/**
 * RiskShieldPage.tsx
 *
 * Reads 'ww-result' from sessionStorage, shows RiskSummaryCard, RegretCard,
 * and a grouped BarChart of scenario costs per plan.
 *
 * Includes the required disclaimer:
 * "This confidence score is based on simulated scenarios and is not a statistical guarantee."
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import RiskSummaryCard from '../components/RiskSummaryCard';
import RegretCard from '../components/RegretCard';
import { formatCurrency } from '../utils/formatCurrency';
import type { ComparisonResult } from '../types';

const BAR_COLORS = ['#1E40AF', '#10B981', '#F59E0B', '#EF4444'];

export default function RiskShieldPage() {
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
        <p>Loading Risk Shield…</p>
      </div>
    );
  }

  const { riskShield, regret, plans } = result;

  // Build grouped bar-chart data: one entry per scenario (25 total)
  // Summarise by consumptionMultiplier for readability
  const multipliers = [...new Set(riskShield.scenarios.map((s) => s.consumptionMultiplier))];
  const chartData = multipliers.map((m) => {
    const row: Record<string, number | string> = { label: `×${m.toFixed(1)}` };
    plans.forEach((plan) => {
      // Average across peak-shift deltas for this multiplier
      const scenariosForM = riskShield.scenarios.filter(
        (s) => s.consumptionMultiplier === m
      );
      const sum = scenariosForM.reduce((acc, s) => acc + (s.bills[plan.id] ?? 0), 0);
      row[plan.name] = sum / scenariosForM.length;
    });
    return row;
  });

  return (
    <div className="page risk-shield-page">
      <div className="page-header">
        <div>
          <h1>Tariff Risk Shield</h1>
          <p>
            How your recommended plan holds up across {riskShield.scenarios.length} simulated
            usage scenarios.
          </p>
        </div>
        <Link to="/comparison" className="btn btn-secondary">← Back to comparison</Link>
      </div>

      {/* ── Disclaimer ──────────────────────────────────────────────────── */}
      <div className="notice demo-notice" role="note" style={{ marginBottom: '1rem' }}>
        This confidence score is based on simulated scenarios and is not a statistical guarantee.
        Actual costs depend on real tariff rates and your future usage pattern.
      </div>

      {/* ── Risk summary ────────────────────────────────────────────────── */}
      <RiskSummaryCard result={riskShield} />

      {/* ── Regret guard ────────────────────────────────────────────────── */}
      <div style={{ marginTop: '1.5rem' }}>
        <RegretCard result={regret} />
      </div>

      {/* ── Scenario cost chart ─────────────────────────────────────────── */}
      <section
        aria-labelledby="scenario-chart-heading"
        style={{ marginTop: '2rem' }}
      >
        <h2 id="scenario-chart-heading" style={{ marginBottom: '0.75rem' }}>
          Average cost by consumption level
        </h2>
        <p className="field-hint" style={{ marginBottom: '0.75rem' }}>
          Average estimated bill (across all 5 peak-shift scenarios) at each consumption
          multiplier.
        </p>

        <div
          className="panel ww-card"
          aria-label="Grouped bar chart of average plan costs by consumption multiplier"
        >
          <div
            className="chart-container"
            aria-label={`Bar chart comparing ${plans.map((p) => p.name).join(' and ')} costs across consumption multipliers`}
            style={{ height: 280 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v: number) => `₹${v.toFixed(0)}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                {plans.map((plan, i) => (
                  <Bar
                    key={plan.id}
                    dataKey={plan.name}
                    fill={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Accessible text summary */}
          <table className="visually-hidden" aria-label="Scenario cost data">
            <thead>
              <tr>
                <th>Consumption multiplier</th>
                {plans.map((p) => <th key={p.id}>{p.name} average cost</th>)}
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={String(row.label)}>
                  <td>{row.label}</td>
                  {plans.map((p) => (
                    <td key={p.id}>{formatCurrency(row[p.name] as number)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav
        aria-label="Continue analysis"
        style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
      >
        <Link to="/shift-advisor" className="btn btn-primary">
          🔄 Peak Shift Advisor →
        </Link>
        <Link to="/digital-twin" className="btn btn-secondary">
          🔬 Digital Twin
        </Link>
      </nav>
    </div>
  );
}
