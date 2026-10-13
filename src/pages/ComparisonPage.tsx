/**
 * ComparisonPage.tsx
 *
 * Reads 'ww-consumption' from sessionStorage, runs generateComparison,
 * and displays all results with links to the detail pages.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SAMPLE_PLANS } from '../data/samplePlans.ts';
import { generateComparison } from '../utils/recommendationEngine';
import { saveComparison } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { isConfigured } from '../firebase/config';
import SavingsCard from '../components/SavingsCard';
import BillBreakdownTable from '../components/BillBreakdownTable';
import type { ConsumptionInput, TariffPlan, ComparisonResult } from '../types';

export default function ComparisonPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
    } catch {
      navigate('/calculator', { replace: true });
    }
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
          {bills.map((bill) => (
            <div key={bill.planId} className="panel">
              <h3 style={{ marginBottom: '0.75rem' }}>
                {bill.planName}
                {bill.planId === recommendedPlanId && (
                  <span className="badge badge-winner" style={{ marginLeft: '0.75rem' }}>
                    Recommended
                  </span>
                )}
              </h3>
              <BillBreakdownTable breakdown={bill} />
            </div>
          ))}
        </div>
      </section>

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
