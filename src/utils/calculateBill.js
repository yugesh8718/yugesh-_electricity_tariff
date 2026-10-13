/**
 * calculateBill.js
 *
 * Flat-rate bill calculator (peak / normal / off-peak time-of-use model).
 * Used by the home-page comparator and existing tests.
 *
 * slabBill() delegates to the full tariff engine for slab-based calculations.
 */
import { calculateFullBill } from '../lib/tariffEngine.js';

// ---------------------------------------------------------------------------
// Flat-rate calculator
// ---------------------------------------------------------------------------

/**
 * Calculate a simple estimated monthly bill.
 * Formula: fixed charge + (peak × peakRate) + (normal × normalRate) + (offPeak × offPeakRate)
 *
 * Taxes, subsidies, and slab rates are not included — use slabBill() for those.
 *
 * @param {{ peak: number, normal: number, offPeak: number }} usage
 * @param {{ fixedMonthlyCharge: number, peakRate: number, normalRate: number, offPeakRate: number }} plan
 * @returns {number} Estimated bill in rupees
 */
export function calculateBill(usage, plan) {
  const usageFields = ['peak', 'normal', 'offPeak'];
  const rateFields  = ['peakRate', 'normalRate', 'offPeakRate'];

  for (const field of usageFields) {
    if (!Number.isFinite(usage[field]) || usage[field] < 0) {
      throw new Error(`Usage for ${field} must be a finite, non-negative number.`);
    }
  }

  if (!Number.isFinite(plan.fixedMonthlyCharge) || plan.fixedMonthlyCharge < 0) {
    throw new Error('Fixed monthly charge must be a finite, non-negative number.');
  }

  for (const field of rateFields) {
    if (!Number.isFinite(plan[field]) || plan[field] < 0) {
      throw new Error(`${field} must be a finite, non-negative number.`);
    }
  }

  const bill =
    plan.fixedMonthlyCharge +
    usage.peak    * plan.peakRate +
    usage.normal  * plan.normalRate +
    usage.offPeak * plan.offPeakRate;

  if (!Number.isFinite(bill)) {
    throw new Error('The calculated bill is too large to display safely.');
  }

  return bill;
}

// ---------------------------------------------------------------------------
// Slab-based bill wrapper
// ---------------------------------------------------------------------------

/**
 * slabBill — wrapper around calculateFullBill for slab-based tariff documents.
 *
 * @param {object} tariff - Tariff document (from Firestore or DEMO_TARIFFS)
 * @param {number} units  - Monthly consumption in kWh
 * @param {number} loadKW - Consumer sanctioned load in kW
 * @returns {object} Full bill breakdown (see tariffEngine.calculateFullBill)
 */
export function slabBill(tariff, units, loadKW) {
  return calculateFullBill(tariff, units, loadKW);
}
