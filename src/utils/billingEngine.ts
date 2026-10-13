/**
 * billingEngine.ts
 *
 * Pure TypeScript bill calculation engine for WattWise.
 * No React imports. All functions are deterministic and side-effect free.
 */

import type { ConsumptionInput, TariffPlan, BillBreakdown } from '../types/index.js';

/**
 * Calculate a full bill breakdown for a given consumption profile and tariff plan.
 *
 * Formula:
 *   offPeakCharge   = offPeak × offPeakRate
 *   shoulderCharge  = shoulder × shoulderRate
 *   peakCharge      = peak × peakRate
 *   energyCharge    = offPeakCharge + shoulderCharge + peakCharge
 *   fixedCharge     = billingPeriod === 'bimonthly' ? plan.fixedCharge × 2 : plan.fixedCharge
 *   subtotal        = energyCharge + fixedCharge + plan.surcharge
 *   duty            = subtotal × plan.taxDutyPercent / 100
 *   estimatedTotal  = subtotal + duty
 *   effectiveCostPerKwh = total > 0 ? estimatedTotal / total : 0
 */
export function calculateBill(
  consumption: ConsumptionInput,
  plan: TariffPlan
): BillBreakdown {
  const { offPeak, shoulder, peak, total, billingPeriod } = consumption;

  const offPeakCharge = offPeak * plan.offPeakRate;
  const shoulderCharge = shoulder * plan.shoulderRate;
  const peakCharge = peak * plan.peakRate;
  const energyCharge = offPeakCharge + shoulderCharge + peakCharge;

  const fixedCharge =
    billingPeriod === 'bimonthly' ? plan.fixedCharge * 2 : plan.fixedCharge;

  const subtotal = energyCharge + fixedCharge + plan.surcharge;
  const duty = subtotal * (plan.taxDutyPercent / 100);
  const estimatedTotal = subtotal + duty;
  const effectiveCostPerKwh = total > 0 ? estimatedTotal / total : 0;

  return {
    planId: plan.id,
    planName: plan.name,
    offPeakCharge,
    shoulderCharge,
    peakCharge,
    energyCharge,
    fixedCharge,
    surcharge: plan.surcharge,
    subtotal,
    duty,
    estimatedTotal,
    effectiveCostPerKwh,
  };
}

/**
 * Calculate bills for all plans and return them sorted by estimatedTotal ascending.
 * The cheapest plan will be first in the returned array.
 */
export function compareAllPlans(
  consumption: ConsumptionInput,
  plans: TariffPlan[]
): BillBreakdown[] {
  return plans
    .map((plan) => calculateBill(consumption, plan))
    .sort((a, b) => a.estimatedTotal - b.estimatedTotal);
}
