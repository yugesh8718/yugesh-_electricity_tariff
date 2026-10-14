/**
 * ComparisonPage.tsx
 *
 * Reads 'ww-consumption' from sessionStorage, runs generateComparison,
 * and displays all results with links to the detail pages.
 *
 * FEAT-003 additions:
 *  - Success notification after result is set
 *  - Verification badges per plan breakdown card
 *  - State/board source line when ww-state-ctx is set
 *  - Tie badge when two plans share the lowest cost
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SAMPLE_PLANS } from '../data/samplePlans.ts';
import { generateComparison } from '../utils/recommendationEngine';
import { saveComparison } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { isConfigured } from '../firebase/config';
import SavingsCard from '../components/SavingsCard';
import BillBreakdownTable from '../components/BillBreakdownTable';
import ComparisonTable from '../components/ComparisonTable';
import ComparisonExportActions from '../components/ComparisonExportActions';
import type { ConsumptionInput, TariffPlan, ComparisonResult, BillBreakdown } from '../types';

// ---------------------------------------------------------------------------
// Helper — derive verification badge class and label from plan description
// ---------------------------------------------------------------------------

function getVerificationBadge(description?: string): { className: string; label: string } {
  if (!description || description.toLowerCase().includes('demo')) {
    return { className: 'badge-demo', label: 'Demo rates' };
  }
  if (description.toLowerCase().includes('verified')) {
    return { className: 'badge-verified', label: 'Verified' };
  }
  return { className: 'badge-unverified', label: 'Unverified' };
}

// ---------------------------------------------------------------------------
// Helper — find the minimum estimated total across all bills
// ---------------------------------------------------------------------------

function getMinTotal(bills: BillBreakdown[]): number {
  return Math.min(...bills.map((b) => b.estimatedTotal));
}

// ---------------------------------------------------------------------------
// State context type (written by CalculatorPage)
// ---------------------------------------------------------------------------

interface StateCtx {
  stateId?: string;
  boardId?: string;
  boardName?: string;
  scheduleId?: string;
}

export default function ComparisonPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Read state context set by CalculatorPage (FEAT-001/002)
  const stateCtxRaw = sessionStorage.getItem('ww-state-ctx');
  const stateCtx: StateCtx = stateCtxRaw ? (JSON.parse(stateCtxRaw) as StateCtx) : {};

  useEffect(() => {
    const raw = sessionStorage.getItem('ww-consumption');
    if (!raw) {
      navigate('/calculator', { replace: true });
      return;
    }

    try {
      const consumption = JSON.parse(raw) as ConsumptionInput;
      const rawPlans = sessionStorage.getItem('ww-plans');
      const plans: TariffPlan[] = rawPlans ? (JSON.parse(rawPlans) as TariffPlan[]) : SAMPLE_PLANS;

      const comparison = generateComparison(consumption, plans);
      setResult(comparison);
      sessionStorage.setItem('ww-result', JSON.stringify(comparison));

      // FEAT-003: success notification with recommended plan name
      const recommended = comparison.plans.find((p) => p.id === comparison.recommendedPlanId);
      if (recommended) {
        addNotification(
          'success',
          `✅ Bill calculated using plan: ${recommended.name}. / திட்டம் ${recommended.name} பயன்படுத்தி கட்டணம் கணக்கிடப்பட்டது.`,
        );
      }
    } catch {
      navigate('/calculator', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function handleSave() {
    if (!result || !user) {
      navigate('/login?redirect=/comparison');
      return;
    }
    setSaveStatus('saving');
    try {
      await saveComparison(user.uid, result);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }

  if (!result) {
    return (
      <div className="page">
        <p>Loading comparison…</p>
      </div>
    );
  }

  const { bills, recommendedPlanId, consumption } = result;
  const recommendedPlan = result.plans.find((p) => p.id === recommendedPlanId);

  // FEAT-003: detect ties — any bill sharing the minimum total
  const minTotal = getMinTotal(bills);
  const tiedPlanIds = bills
    .filter((b) => Math.abs(b.estimatedTotal - minTotal) < 0.01)
    .map((b) => b.planId);
  const hasTie = tiedPlanIds.length > 1;

  // FEAT-003: build source label from state context
  const sourceLabel =
    stateCtx.boardName && stateCtx.stateId
      ? `Source: ${stateCtx.stateId.toUpperCase()} — ${stateCtx.boardName}`
      : null;

  return (
    <div className="page comparison-page">
      <div className="page-header">
        <div>
          <h1>Plan Comparison</h1>
          <p>
            {consumption.consumerType === 'household' ? 'Household' : 'Small Business'} ·{' '}
            {consumption.billingPeriod === 'monthly' ? 'Monthly' : 'Bimonthly'} ·{' '}
            {consumption.total.toFixed(1)} kWh total
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/calculator" className="btn btn-secondary">← Edit inputs</Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleSave()}
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
          >
            {saveStatus === 'idle' && 'Save comparison'}
            {saveStatus === 'saving' && 'Saving…'}
            {saveStatus === 'saved' && 'Saved ✓'}
            {saveStatus === 'error' && 'Retry save'}
          </button>
        </div>
      </div>

      {!isConfigured && (
        <div className="notice demo-notice" role="note" style={{ marginBottom: '1rem' }}>
          Firebase not configured — cloud saving is unavailable. Results are kept in this tab's
          session only.
        </div>
      )}

      {/* ── Recommended plan highlight ──────────────────────────────────── */}
      {recommendedPlan && (
        <div
          className="panel ww-card comparison-card--winner"
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="comparison-card-header">
            <div>
              <p className="eyebrow">RECOMMENDED PLAN</p>
              <h2>{recommendedPlan.name}</h2>
              {recommendedPlan.description && (
                <p style={{ color: 'var(--color-neutral-600)', fontSize: '0.9rem' }}>
                  {recommendedPlan.description}
                </p>
              )}
            </div>
            <span className="badge badge-winner">★ Best value</span>
          </div>
        </div>
      )}

      {/* ── Savings summary chart ───────────────────────────────────────── */}
      <SavingsCard bills={bills} recommendedPlanId={recommendedPlanId} />

      {/* ── Bill breakdown per plan ─────────────────────────────────────── */}
      <section
        aria-labelledby="breakdown-heading"
        style={{ marginTop: '2rem' }}
      >
        <h2 id="breakdown-heading" style={{ marginBottom: '1rem' }}>
          Detailed breakdown
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bills.map((bill) => {
            // FEAT-003: find the corresponding plan to read description
            const plan = result.plans.find((p) => p.id === bill.planId);
            const { className: badgeClass, label: badgeLabel } = getVerificationBadge(
              plan?.description,
            );
            const isTied = hasTie && tiedPlanIds.includes(bill.planId);

            return (
              <div key={bill.planId} className="panel">
                <h3 style={{ marginBottom: '0.5rem' }}>
                  {bill.planName}
                  {bill.planId === recommendedPlanId && (
                    <span className="badge badge-winner" style={{ marginLeft: '0.75rem' }}>
                      Recommended
                    </span>
                  )}
                  {isTied && (
                    <span
                      className="badge"
                      style={{
                        marginLeft: '0.75rem',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      Tie
                    </span>
                  )}
                </h3>

                {/* FEAT-003: verification badge */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={badgeClass}>{badgeLabel}</span>

                  {/* FEAT-003: state/board source when ww-state-ctx is set */}
                  {sourceLabel && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', margin: 0 }}>
                      {sourceLabel}
                    </p>
                  )}
                </div>

                <BillBreakdownTable breakdown={bill} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Comparison table + Export actions ──────────────────────────── */}
      <ComparisonTable result={result} />
      <ComparisonExportActions result={result} />

      {/* ── Navigation links ────────────────────────────────────────────── */}
      <nav
        aria-label="Deep-dive analysis"
        style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
      >
        <Link to="/digital-twin" className="btn btn-secondary">
          🔬 Consumption Digital Twin
        </Link>
        <Link to="/risk-shield" className="btn btn-secondary">
          🛡️ Risk Shield
        </Link>
        <Link to="/shift-advisor" className="btn btn-secondary">
          🔄 Peak Shift Advisor
        </Link>
      </nav>

      {/* ── Explanation ─────────────────────────────────────────────────── */}
      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h3>Explanation</h3>
        <p style={{ color: 'var(--color-neutral-600)' }}>{result.explanation}</p>
      </div>
    </div>
  );
}
