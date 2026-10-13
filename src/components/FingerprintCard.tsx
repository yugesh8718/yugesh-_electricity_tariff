/**
 * FingerprintCard.tsx
 *
 * Displays a UsageFingerprint:
 * - Label as a large badge
 * - Percentage breakdown as a Recharts PieChart
 * - Explanation text
 *
 * Accessible: aria-label on chart container + visually-hidden data table.
 */
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { UsageFingerprint } from '../types';

interface Props {
  fingerprint: UsageFingerprint;
}

const COLORS = ['#06B6D4', '#F59E0B', '#EF4444']; // cyan, amber, red → off-peak, shoulder, peak

export default function FingerprintCard({ fingerprint }: Props) {
  const data = [
    { name: 'Off-peak', value: fingerprint.offPeakShare },
    { name: 'Shoulder', value: fingerprint.shoulderShare },
    { name: 'Peak',     value: fingerprint.peakShare },
  ];

  return (
    <div className="panel ww-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span className="badge ww-badge-fingerprint" style={{ fontSize: '1rem', padding: '6px 18px' }}>
          {fingerprint.label}
        </span>
      </div>

      <p style={{ marginBottom: 16, color: 'var(--color-neutral-600)' }}>
        {fingerprint.explanation}
      </p>

      <div
        className="chart-container"
        aria-label={`Usage breakdown pie chart: off-peak ${fingerprint.offPeakShare.toFixed(1)}%, shoulder ${fingerprint.shoulderShare.toFixed(1)}%, peak ${fingerprint.peakShare.toFixed(1)}%`}
        style={{ height: 220 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${(value as number).toFixed(1)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Visually-hidden data table for screen readers */}
      <table className="visually-hidden" aria-label="Usage share data">
        <thead>
          <tr><th>Period</th><th>Share (%)</th></tr>
        </thead>
        <tbody>
          {data.map(({ name, value }) => (
            <tr key={name}><td>{name}</td><td>{value.toFixed(1)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
