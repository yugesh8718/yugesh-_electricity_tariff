/**
 * SavingsCard.tsx
 *
 * Shows:
 * - Savings between recommended and next-cheapest plan
 * - Recharts BarChart comparing all plan totals
 * - Effective cost per kWh per plan
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
import type { BillBreakdown } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  bills: BillBreakdown[];
  recommendedPlanId: string;
}

export default function SavingsCard({ bills, recommendedPlanId }: Props) {
  const sorted = [...bills].sort((a, b) => a.estimatedTotal - b.estimatedTotal);
  const recommended = sorted[0];
  const nextCheapest = sorted[1];
  const savings = nextCheapest ? nextCheapest.estimatedTotal - recommended.estimatedTotal : 0;

  const chartData = bills.map((b) => ({
    name: b.planName,
    'Estimated bill (₹)': b.estimatedTotal,
    isRecommended: b.planId === recommendedPlanId,
  }));

  return (
    <div className="panel ww-card">
      <h3 style={{ marginBottom: 8 }}>Savings Summary</h3>

      {nextCheapest && savings > 0 && (
        <div className="summary-panel" style={{ marginBottom: 16 }}>
          <div className="summary-icon">₹</div>
          <div className="summary-content">
            <h2>{recommended.planName} saves the most</h2>
            <p className="summary-explanation">
              Compared to {nextCheapest.planName}
            </p>
          </div>
          <div className="savings-amount">
            <span>You save</span>
            <strong>{formatCurrency(savings)}</strong>
            <small>per billing period</small>
          </div>
        </div>
      )}

      <div
        className="chart-container"
        aria-label="Bar chart comparing estimated bills for each tariff plan"
        style={{ height: 220 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v: number) => `₹${v}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="Estimated bill (₹)" fill="#1E40AF" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Visually-hidden data table */}
      <table className="visually-hidden" aria-label="Plan cost comparison data">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Estimated total</th>
            <th>Effective ₹/kWh</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b.planId}>
              <td>{b.planName}{b.planId === recommendedPlanId ? ' (Recommended)' : ''}</td>
              <td>{formatCurrency(b.estimatedTotal)}</td>
              <td>{formatCurrency(b.effectiveCostPerKwh)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Per-plan effective rate */}
      <div style={{ marginTop: 12 }}>
        <p className="field-hint" style={{ marginBottom: 6 }}>Effective cost per kWh</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {bills.map((b) => (
            <div key={b.planId} style={{ fontSize: '0.88rem' }}>
              <strong>{b.planName}:</strong> {formatCurrency(b.effectiveCostPerKwh)}/kWh
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
