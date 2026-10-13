/**
 * formatCurrency.ts
 *
 * Formats a numeric value as Indian Rupees (₹) with 2 decimal places.
 * Re-exports the existing formatRupees utility under the WattWise name.
 */

/**
 * Format a number as ₹ with exactly 2 decimal places.
 * e.g. formatCurrency(1234.5) → "₹1,234.50"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
