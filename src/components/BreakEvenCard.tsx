/**
 * BreakEvenCard.tsx
 *
 * Displays a BreakEvenResult:
 * - If crossoverExists: crossover peak % and which plan is cheaper below/above
 * - If no crossover: 'one plan dominates' explanation
 * - Optional Recharts LineChart showing both plan costs vs peak share
 *
 * Accessible: aria-label on chart container + visually-hidden data table.
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { BreakEvenResult } from '../types';

interface CostPoint {
  peakPercent: number;
  [planName: string]: number;
}

interface Props {
  result: BreakEvenResult;
  /** Optional cost curves to visualise. Key = planName, value = cost at each peak% */
  costCurves?: CostPoint[];
  planNames?: string[];
}

const LINE_COLORS = ['#1E40AF', '#10B981', '#F59E0B', '#EF4444'];

export default function BreakEvenCard({ result, costCurves, planNames = [] }: Props) {
  return (
    <div className="panel ww-card break-even-zone">
      <h3 style={{ marginBottom: 8 }}>Tariff Break-Even Explorer</h3>

      <p style={{ marginBottom: 12 }}>{result.explanation}</p>

      {result.crossoverExists && result.crossoverPeakPercent !== null && (
        <div className="notice" style={{ marginBottom: 16 }}>
          <strong>Crossover at {result.crossoverPeakPercent.toFixed(1)}% peak usage</strong>
          <br />
          {result.lowerPeakPlanId && (
            <span>Below: plan {result.lowerPeakPlanId} is cheaper. </span>
          )}
          {result.higherPeakPlanId && (
            <span>Above: plan {result.higherPeakPlanId} is cheaper.</span>
          )}
        </div>
      )}

      {costCurves && costCurves.length > 0 && (
        <>
          <div
            className="chart-container"
            aria-label="Line chart showing estimated plan costs as peak usage percentage increases"
            style={{ height: 240, marginTop: 8 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costCurves}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="peakPercent"
                  label={{ value: 'Peak %', position: 'insideBottom', offset: -4 }}
                />
                <YAxis tickFormatter={(v: number) => `₹${v}`} />
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                <Legend />
                {result.crossoverExists && result.crossoverPeakPercent !== null && (
                  <ReferenceLine
                    x={result.crossoverPeakPercent}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{ value: 'Crossover', position: 'top', fontSize: 11 }}
                  />
                )}
                {planNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Visually-hidden data table */}
          <table className="visually-hidden" aria-label="Break-even cost data">
            <thead>
              <tr>
                <th>Peak %</th>
                {planNames.map((n) => <th key={n}>{n}</th>)}
              </tr>
            </thead>
            <tbody>
              {costCurves.map((row) => (
                <tr key={row.peakPercent}>
                  <td>{row.peakPercent}</td>
                  {planNames.map((n) => <td key={n}>{(row[n] as number)?.toFixed(2)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
