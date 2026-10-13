/**
 * DigitalTwinPage.tsx
 *
 * Reads 'ww-result' from sessionStorage and shows the Consumption Digital Twin:
 * usage fingerprint + break-even explorer.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FingerprintCard from '../components/FingerprintCard';
import BreakEvenCard from '../components/BreakEvenCard';
import type { ComparisonResult } from '../types';
import { calculateBill } from '../utils/billingEngine';

interface CostPoint {
  peakPercent: number;
  [planName: string]: number;
}

export default function DigitalTwinPage() {
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
        <p>Loading Digital Twin…</p>
      </div>
    );
  }

  const { fingerprint, breakEven, plans, consumption } = result;

  // Build cost curves for the break-even chart (5pp steps)
  const { shoulder, total } = consumption;
  const maxPeakShare = total > 0 ? Math.max(0, ((total - shoulder) / total) * 100) : 100;
  const costCurves: CostPoint[] = [];
  const planNames = plans.map((p) => p.name);

  for (let pct = 0; pct <= Math.ceil(maxPeakShare); pct += 5) {
    const cappedPct = Math.min(pct, maxPeakShare);
    const peak = (cappedPct / 100) * total;
    const offPeak = Math.max(0, total - shoulder - peak);
    const c = { ...consumption, offPeak, peak };
    const row: CostPoint = { peakPercent: cappedPct };
    plans.forEach((plan) => {
      row[plan.name] = calculateBill(c, plan).estimatedTotal;
    });
    costCurves.push(row);
  }

  return (
    <div className="page digital-twin-page">
      <div className="page-header">
        <div>
          <h1>Consumption Digital Twin</h1>
          <p>Your usage fingerprint and tariff break-even analysis.</p>
        </div>
        <Link to="/comparison" className="btn btn-secondary">← Back to comparison</Link>
      </div>

      {/* ── Fingerprint ─────────────────────────────────────────────────── */}
      <section aria-labelledby="fingerprint-heading">
        <h2 id="fingerprint-heading" style={{ marginBottom: '0.75rem' }}>
          Usage fingerprint
        </h2>
        <FingerprintCard fingerprint={fingerprint} />
      </section>

      {/* ── What the fingerprint means ──────────────────────────────────── */}
      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h3>What this means for your tariff choice</h3>
        <p style={{ color: 'var(--color-neutral-600)', marginTop: '0.5rem' }}>
          {fingerprint.explanation}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            marginTop: '1rem',
            flexWrap: 'wrap',
            fontSize: '0.9rem',
          }}
        >
          <div>
            <span className="field-hint">Off-peak share</span>
            <strong style={{ display: 'block', fontSize: '1.4rem' }}>
              {fingerprint.offPeakShare.toFixed(1)}%
            </strong>
          </div>
          <div>
            <span className="field-hint">Shoulder share</span>
            <strong style={{ display: 'block', fontSize: '1.4rem' }}>
              {fingerprint.shoulderShare.toFixed(1)}%
            </strong>
          </div>
          <div>
            <span className="field-hint">Peak share</span>
            <strong style={{ display: 'block', fontSize: '1.4rem' }}>
              {fingerprint.peakShare.toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>

      {/* ── Break-even explorer ─────────────────────────────────────────── */}
      <section aria-labelledby="breakeven-heading" style={{ marginTop: '2rem' }}>
        <h2 id="breakeven-heading" style={{ marginBottom: '0.75rem' }}>
          Tariff Break-Even Explorer
        </h2>
        <BreakEvenCard
          result={breakEven}
          costCurves={costCurves}
          planNames={planNames}
        />
      </section>

      {/* ── Next steps ──────────────────────────────────────────────────── */}
      <nav
        aria-label="Continue analysis"
        style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
      >
        <Link to="/risk-shield" className="btn btn-primary">
          🛡️ View Risk Shield →
        </Link>
        <Link to="/shift-advisor" className="btn btn-secondary">
          🔄 Peak Shift Advisor
        </Link>
      </nav>
    </div>
  );
}
