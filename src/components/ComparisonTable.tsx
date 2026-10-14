/**
 * ComparisonTable.tsx
 *
 * Renders a responsive side-by-side comparison table for two or more plans.
 * Reads ONLY from the ComparisonResult already passed as props — never recalculates.
 *
 * Accessible: role="table", proper th/td, aria-label, highlighted winner column.
 * Print-friendly: visible in black-and-white, no chart dependencies.
 */
import type { ComparisonResult } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  result: ComparisonResult;
}

interface Row {
  label: string;
  getValue: (planIdx: number) => string;
  isTotal?: boolean;
  isDiff?: boolean;
}

export default function ComparisonTable({ result }: Props) {
  const { plans, bills, recommendedPlanId, consumption } = result;

  // Sort plans: recommended first for visual clarity
  const orderedPlans = [...plans].sort((a, b) =>
    a.id === recommendedPlanId ? -1 : b.id === recommendedPlanId ? 1 : 0,
  );

  const billFor = (planId: string) => bills.find((b) => b.planId === planId);

  // ── Row definitions — values read from existing bills, never recalculated ──

  const rows: Row[] = [
    {
      label: 'Off-peak energy charge',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.offPeakCharge ?? 0),
    },
    {
      label: 'Shoulder energy charge',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.shoulderCharge ?? 0),
    },
    {
      label: 'Peak energy charge',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.peakCharge ?? 0),
    },
    {
      label: 'Energy subtotal',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.energyCharge ?? 0),
      isTotal: false,
    },
    {
      label: 'Fixed / supply charge',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.fixedCharge ?? 0),
    },
    {
      label: 'Surcharge',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.surcharge ?? 0),
    },
    {
      label: 'Subtotal',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.subtotal ?? 0),
    },
    {
      label: 'Electricity duty',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.duty ?? 0),
    },
    {
      label: 'Estimated total',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.estimatedTotal ?? 0),
      isTotal: true,
    },
    {
      label: 'Effective ₹/kWh',
      getValue: (i) => formatCurrency(billFor(orderedPlans[i].id)?.effectiveCostPerKwh ?? 0),
    },
  ];

  // ── Savings row (only when 2+ plans) ──────────────────────────────────────

  const sorted = [...bills].sort((a, b) => a.estimatedTotal - b.estimatedTotal);
  const winner = sorted[0];
  const runner = sorted[1];

  let monthlySavings = 0;
  let annualSavings = 0;
  let pctDiff = '0.0';

  if (winner && runner) {
    monthlySavings = runner.estimatedTotal - winner.estimatedTotal;
    annualSavings = monthlySavings * (consumption.billingPeriod === 'bimonthly' ? 6 : 12);
    pctDiff = runner.estimatedTotal > 0
      ? ((monthlySavings / runner.estimatedTotal) * 100).toFixed(1)
      : '0.0';
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section
      className="panel comparison-export-section"
      aria-labelledby="comparison-table-heading"
    >
      <h2 id="comparison-table-heading" className="comparison-table-title">
        Side-by-side Comparison
      </h2>

      <div className="comparison-table-wrapper">
        <table
          className="comparison-table"
          aria-label="Side-by-side plan cost comparison"
        >
          <thead>
            <tr>
              <th scope="col" className="comparison-table-component-header">
                Charge Component
              </th>
              {orderedPlans.map((plan) => {
                const isRec = plan.id === recommendedPlanId;
                return (
                  <th
                    key={plan.id}
                    scope="col"
                    className={`comparison-table-plan-header${isRec ? ' comparison-table-winner-header' : ''}`}
                    aria-label={isRec ? `${plan.name} — Recommended` : plan.name}
                  >
                    {plan.name}
                    {isRec && (
                      <span className="badge badge-winner comparison-table-winner-badge">
                        ★ Best value
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map(({ label, getValue, isTotal }) => (
              <tr
                key={label}
                className={isTotal ? 'comparison-table-total-row' : undefined}
              >
                <td className="comparison-table-label">{label}</td>
                {orderedPlans.map((plan, idx) => {
                  const isRec = plan.id === recommendedPlanId;
                  return (
                    <td
                      key={plan.id}
                      className={`comparison-table-value${isRec ? ' comparison-table-winner-col' : ''}`}
                    >
                      {getValue(idx)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          {winner && runner && (
            <tfoot>
              <tr className="comparison-table-savings-row">
                <td className="comparison-table-label">Monthly savings</td>
                <td colSpan={orderedPlans.length} className="comparison-table-value">
                  {formatCurrency(monthlySavings)} ({pctDiff}% cheaper)
                </td>
              </tr>
              <tr className="comparison-table-savings-row">
                <td className="comparison-table-label">
                  Estimated annual savings
                </td>
                <td colSpan={orderedPlans.length} className="comparison-table-value">
                  {formatCurrency(annualSavings)}
                  <span className="comparison-table-annual-note">
                    {' '}({consumption.billingPeriod === 'bimonthly' ? '6 billing periods' : '12 billing periods'} / year)
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {winner && (
        <p className="comparison-table-winner-note" aria-live="polite">
          <strong>{winner.planName}</strong> is the most cost-effective plan at{' '}
          {formatCurrency(winner.estimatedTotal)} per {consumption.billingPeriod === 'bimonthly' ? '2 months' : 'month'}.
          {runner && monthlySavings > 0 && (
            <> You save {formatCurrency(monthlySavings)} compared to {runner.planName}.</>
          )}
        </p>
      )}
    </section>
  );
}
