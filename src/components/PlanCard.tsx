/**
 * PlanCard.tsx
 *
 * Displays a TariffPlan with name, provider (description), rates table,
 * fixed charge, and an optional "Recommended" badge.
 * Shows estimated total if a BillBreakdown is provided.
 */
import type { TariffPlan, BillBreakdown } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  plan: TariffPlan;
  isRecommended?: boolean;
  bill?: BillBreakdown;
}

export default function PlanCard({ plan, isRecommended = false, bill }: Props) {
  return (
    <article
      className={`panel comparison-card${isRecommended ? ' comparison-card--winner' : ''}`}
      aria-label={`Tariff plan: ${plan.name}${isRecommended ? ' (Recommended)' : ''}`}
    >
      <header className="comparison-card-header">
        <div>
          <h2>{plan.name}</h2>
          {plan.description && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-600)' }}>
              {plan.description}
            </p>
          )}
        </div>
        {isRecommended && (
          <span className="badge badge-winner" aria-label="Recommended plan">
            ★ Recommended
          </span>
        )}
      </header>

      <table className="breakdown-table compact" aria-label={`Rates for ${plan.name}`}>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col" style={{ textAlign: 'right' }}>Rate (₹/kWh)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Off-peak</td>
            <td style={{ textAlign: 'right' }}>{plan.offPeakRate.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Shoulder</td>
            <td style={{ textAlign: 'right' }}>{plan.shoulderRate.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Peak</td>
            <td style={{ textAlign: 'right' }}>{plan.peakRate.toFixed(2)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>Fixed charge</td>
            <td style={{ textAlign: 'right' }}>{formatCurrency(plan.fixedCharge)}/period</td>
          </tr>
          <tr>
            <td>Duty</td>
            <td style={{ textAlign: 'right' }}>{plan.taxDutyPercent}%</td>
          </tr>
        </tfoot>
      </table>

      {bill && (
        <div style={{ marginTop: 12 }}>
          <span className="bill-amount">{formatCurrency(bill.estimatedTotal)}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)' }}>
            Estimated bill · {formatCurrency(bill.effectiveCostPerKwh)}/kWh effective
          </span>
        </div>
      )}
    </article>
  );
}
