/**
 * RiskSummaryCard.tsx
 *
 * Displays a RiskShieldResult:
 * - planStats table (scenariosWon, stabilityPercent, avgCost, worstCaseCost)
 * - Highlights cheapestToday, mostStablePlan, lowestWorstCasePlan
 * - Shows recommendationConfidence as a percentage with disclaimer
 */
import type { RiskShieldResult } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  result: RiskShieldResult;
}

export default function RiskSummaryCard({ result }: Props) {
  const { planStats, recommendationConfidence, cheapestTodayPlanId, mostStablePlanId, lowestWorstCasePlanId } = result;

  return (
    <div className="panel ww-card">
      <h3 style={{ marginBottom: 12 }}>Tariff Risk Shield</h3>

      {/* Confidence meter */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.9rem', marginBottom: 4 }}>
          <strong>Recommendation confidence: {recommendationConfidence.toFixed(0)}%</strong>
        </p>
        <div
          className="risk-meter"
          role="progressbar"
          aria-valuenow={recommendationConfidence}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Recommendation confidence ${recommendationConfidence.toFixed(0)}%`}
          style={{
            height: 8,
            borderRadius: 4,
            background: 'var(--color-neutral-200)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${recommendationConfidence}%`,
              background: 'var(--color-green)',
              borderRadius: 4,
            }}
          />
        </div>
        <p className="field-hint" style={{ marginTop: 4 }}>
          This is an indicative score, not a statistical guarantee.
        </p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="ww-badge-risk">
          <span className="field-hint">Cheapest today</span>
          <strong>{cheapestTodayPlanId}</strong>
        </div>
        <div className="ww-badge-risk">
          <span className="field-hint">Most stable</span>
          <strong>{mostStablePlanId}</strong>
        </div>
        <div className="ww-badge-risk">
          <span className="field-hint">Lowest worst-case</span>
          <strong>{lowestWorstCasePlanId}</strong>
        </div>
      </div>

      {/* Plan stats table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="breakdown-table" aria-label="Risk shield plan statistics">
          <thead>
            <tr>
              <th scope="col">Plan</th>
              <th scope="col" style={{ textAlign: 'right' }}>Scenarios won</th>
              <th scope="col" style={{ textAlign: 'right' }}>Stability</th>
              <th scope="col" style={{ textAlign: 'right' }}>Avg cost</th>
              <th scope="col" style={{ textAlign: 'right' }}>Best case</th>
              <th scope="col" style={{ textAlign: 'right' }}>Worst case</th>
            </tr>
          </thead>
          <tbody>
            {planStats.map((ps) => (
              <tr
                key={ps.planId}
                style={ps.planId === cheapestTodayPlanId ? { fontWeight: 700 } : undefined}
              >
                <td>{ps.planName}</td>
                <td style={{ textAlign: 'right' }}>{ps.scenariosWon}</td>
                <td style={{ textAlign: 'right' }}>{ps.stabilityPercent.toFixed(0)}%</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(ps.avgCost)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(ps.bestCaseCost)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(ps.worstCaseCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
