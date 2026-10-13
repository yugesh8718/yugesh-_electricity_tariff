/**
 * ShiftCard.tsx
 *
 * Displays an array of ShiftScenario:
 * - For each scenario: unitsShifted, newPeakPercent, bills per plan, savings, recommendation change
 * - Recharts BarChart comparing bills across scenarios
 *
 * Accessible: aria-label on chart container + visually-hidden data table.
 */
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
import type { ShiftScenario } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  scenarios: ShiftScenario[];
}

const BAR_COLORS = ['#1E40AF', '#10B981', '#F59E0B', '#EF4444'];

export default function ShiftCard({ scenarios }: Props) {
  if (!scenarios.length) return null;

  // Build chart data: one entry per scenario, bars per plan
  const planIds = scenarios[0].bills.map((b) => b.planId);
  const chartData = scenarios.map((s) => {
    const row: Record<string, number | string> = {
      label: `Shift ${s.shiftPercent}%`,
    };
    s.bills.forEach((b) => { row[b.planName] = b.estimatedTotal; });
    return row;
  });

  return (
    <div className="panel ww-card">
      <h3 style={{ marginBottom: 12 }}>Peak Shift Advisor</h3>

      {/* Chart */}
      <div
        className="chart-container"
        aria-label="Bar chart comparing estimated bills across peak shift scenarios"
        style={{ height: 240, marginBottom: 16 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(v: number) => `₹${v}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            {scenarios[0].bills.map((b, i) => (
              <Bar
                key={b.planId}
                dataKey={b.planName}
                fill={BAR_COLORS[i % BAR_COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Visually-hidden data table */}
      <table className="visually-hidden" aria-label="Peak shift scenario data">
        <thead>
          <tr>
            <th>Shift</th>
            <th>Units shifted</th>
            <th>New peak %</th>
            {planIds.map((id) => <th key={id}>{id} bill</th>)}
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => (
            <tr key={s.shiftPercent}>
              <td>{s.shiftPercent}%</td>
              <td>{s.unitsShifted.toFixed(1)} kWh</td>
              <td>{s.newPeakPercent.toFixed(1)}%</td>
              {s.bills.map((b) => (
                <td key={b.planId}>{formatCurrency(b.estimatedTotal)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Scenario cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {scenarios.map((s) => (
          <div key={s.shiftPercent} className="shift-scenario-card notice" style={{ marginBottom: 0 }}>
            <strong>Shift {s.shiftPercent}% of peak ({s.unitsShifted.toFixed(1)} kWh)</strong>
            {' → '}new peak: {s.newPeakPercent.toFixed(1)}%
            {s.recommendationChanges && (
              <span className="badge badge-method" style={{ marginLeft: 8 }}>
                Recommendation changes to {s.newRecommendedPlanId}
              </span>
            )}
            <p style={{ fontSize: '0.85rem', marginTop: 4, color: 'var(--color-neutral-600)' }}>
              {s.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
