/**
 * RegretCard.tsx
 *
 * Displays a RegretResult:
 * - avgRegret and maxRegret in ₹
 * - maxRegretScenario description
 * - explanation string
 */
import type { RegretResult } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  result: RegretResult;
}

export default function RegretCard({ result }: Props) {
  const { avgRegret, maxRegret, maxRegretScenario, explanation, selectedPlanId } = result;

  return (
    <div className="panel ww-card regret-display">
      <h3 style={{ marginBottom: 8 }}>Plan Regret Guard</h3>

      <p style={{ marginBottom: 16, color: 'var(--color-neutral-600)' }}>
        {explanation}
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <span className="field-hint">Selected plan</span>
          <strong style={{ display: 'block', fontSize: '1rem' }}>{selectedPlanId}</strong>
        </div>
        <div>
          <span className="field-hint">Average regret</span>
          <strong
            style={{
              display: 'block',
              fontSize: '1.2rem',
              color: avgRegret > 0 ? 'var(--color-amber)' : 'var(--color-green)',
            }}
          >
            {formatCurrency(avgRegret)}
          </strong>
        </div>
        <div>
          <span className="field-hint">Maximum regret</span>
          <strong
            style={{
              display: 'block',
              fontSize: '1.2rem',
              color: maxRegret > 0 ? 'var(--color-red)' : 'var(--color-green)',
            }}
          >
            {formatCurrency(maxRegret)}
          </strong>
        </div>
      </div>

      {maxRegretScenario && (
        <div className="notice demo-notice" style={{ marginTop: 8 }}>
          <strong>Worst-case scenario</strong>
          <br />
          Consumption ×{maxRegretScenario.consumptionMultiplier}, peak shift{' '}
          {maxRegretScenario.peakShiftDelta > 0 ? '+' : ''}
          {maxRegretScenario.peakShiftDelta} pp — cheapest would be{' '}
          <strong>{maxRegretScenario.cheapestPlanId}</strong>.
        </div>
      )}
    </div>
  );
}
