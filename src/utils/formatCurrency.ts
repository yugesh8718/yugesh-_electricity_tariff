/**
 * formatCurrency.ts
 *
 * Currency formatting utility for WattWise.
 * Always formats in Indian Rupees (₹) with 2 decimal places.
 * Also exports formatRupees as a backward-compatible alias.
 */

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a numeric value as Indian Rupees with 2 decimal places.
 * @example formatCurrency(1234.5) → "₹1,234.50"
 */
export function formatCurrency(value: number): string {
  return formatter.format(value);
}

/**
 * Alias for backward compatibility with code that imports from formatRupees.js.
 */
export const formatRupees = formatCurrency;
