/**
 * BillBreakdownTable.tsx
 *
 * Renders a BillBreakdown as an accessible <table> with rows for each
 * charge component. Highlights the total row. Uses formatCurrency.
 */
import type { BillBreakdown } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  breakdown: BillBreakdown;
}

export default function BillBreakdownTable({ breakdown }: Props) {
  const rows: Array<{ label: string; value: number; className?: string }> = [
    { label: 'Off-peak energy charge', value: breakdown.offPeakCharge },
    { label: 'Shoulder energy charge', value: breakdown.shoulderCharge },
    { label: 'Peak energy charge',     value: breakdown.peakCharge },
    { label: 'Energy subtotal',        value: breakdown.energyCharge, className: 'subtotal-row' },
    { label: 'Fixed / supply charge',  value: breakdown.fixedCharge },
    { label: 'Surcharge',              value: breakdown.surcharge },
    { label: 'Subtotal',               value: breakdown.subtotal, className: 'subtotal-row' },
    { label: 'Electricity duty',       value: breakdown.duty },
  ];

  return (
    <div>
      <table
        className="breakdown-table"
        aria-label={`Bill breakdown for ${breakdown.planName}`}
      >
        <thead>
          <tr>
            <th scope="col">Charge component</th>
            <th scope="col" style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, value, className }) => (
            <tr key={label} className={className}>
              <td>{label}</td>
              <td>{formatCurrency(value)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td>Estimated total</td>
            <td>{formatCurrency(breakdown.estimatedTotal)}</td>
          </tr>
          <tr>
            <td>Effective cost per kWh</td>
            <td>{formatCurrency(breakdown.effectiveCostPerKwh)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Visually-hidden accessible data summary */}
      <p className="visually-hidden">
        Plan {breakdown.planName}: off-peak {formatCurrency(breakdown.offPeakCharge)},
        shoulder {formatCurrency(breakdown.shoulderCharge)},
        peak {formatCurrency(breakdown.peakCharge)},
        fixed {formatCurrency(breakdown.fixedCharge)},
        total {formatCurrency(breakdown.estimatedTotal)}.
      </p>
    </div>
  );
}
