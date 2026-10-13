/**
 * ShiftAdvisorPage.tsx
 *
 * Reads 'ww-result' from sessionStorage and shows the Peak Shift Advisor.
 *
 * Required disclaimer: "Not every appliance can safely be rescheduled — consult your
 * electricity provider."
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShiftCard from '../components/ShiftCard';
import { formatCurrency } from '../utils/formatCurrency';
import type { ComparisonResult } from '../types';

export default function ShiftAdvisorPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('ww-result');
    if (!raw) {
      navigate('/comparison', { replace: true });
      return;
    }
    try {
      setResult(JSON.parse(raw) as ComparisonResult);
    } catch {
      navigate('/comparison', { replace: true });
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="page">
        <p>Loading Shift Advisor…</p>
      </div>
    );
  }

  const { shiftScenarios, recommendedPlanId, bills } = result;
  const recommendedPlanName =
    bills.find((b) => b.planId === recommendedPlanId)?.planName ?? recommendedPlanId;

  // Build a highlight message from the first shift scenario (10%)
  const firstShift = shiftScenarios[0];
  const firstShiftSavings = firstShift?.savings[recommendedPlanId] ?? 0;

  return (
    <div className="page shift-advisor-page">
      <div className="page-header">
        <div>
          <h1>Peak Shift Advisor</h1>
          <p>See how moving consumption to off-peak hours changes your bill.</p>
        </div>
        <Link to="/comparison" className="btn btn-secondary">← Back to comparison</Link>
      </div>

      {/* ── Required disclaimer ──────────────────────────────────────────── */}
      <div className="notice demo-notice" role="note" style={{ marginBottom: '1rem' }}>
        Not every appliance can safely be rescheduled — consult your electricity provider
        before shifting high-load equipment such as air conditioners or water heaters.
      </div>

      {/* ── Highlight message ────────────────────────────────────────────── */}
      {firstShift && firstShiftSavings > 0 && (
        <div className="panel ww-card" style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '1.1rem' }}>
            Moving{' '}
            <strong>{firstShift.unitsShifted.toFixed(1)} kWh</strong> from peak to off-peak
            hours could reduce the{' '}
            <strong>{recommendedPlanName}</strong> estimate by{' '}
            <strong>{formatCurrency(firstShiftSavings)}</strong> without reducing total
            consumption.
          </p>
        </div>
      )}

      {/* ── Shift scenarios ──────────────────────────────────────────────── */}
      <ShiftCard scenarios={shiftScenarios} />

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav
        aria-label="Continue analysis"
        style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
      >
        <Link to="/risk-shield" className="btn btn-secondary">
          🛡️ Risk Shield
        </Link>
        <Link to="/digital-twin" className="btn btn-secondary">
          🔬 Digital Twin
        </Link>
        <Link to="/calculator" className="btn btn-secondary">
          ← Edit inputs
        </Link>
      </nav>
    </div>
  );
}
