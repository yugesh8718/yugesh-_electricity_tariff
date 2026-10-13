/**
 * breakEvenEngine.ts
 *
 * Finds the peak-usage percentage at which the cheapest tariff plan changes.
 *
 * Algorithm:
 *   - Keep total consumption constant.
 *   - Keep shoulder consumption constant.
 *   - Shift units only between off-peak and peak periods.
 *   - Use binary search to locate the crossover within 0.01% tolerance.
 *   - Never hard-code the crossover value; always compute from actual rates.
 */

import type { ConsumptionInput, TariffPlan, BreakEvenResult } from '../types/index.js';
import { calculateBill } from './billingEngine.js';

const MAX_ITERATIONS = 50;
const TOLERANCE = 0.01; // percentage points

/**
 * Build a modified consumption profile with a given peak-share percentage.
 * Shoulder is held constant; off-peak absorbs the remainder.
 */
function buildConsumptionAtPeakShare(
  base: ConsumptionInput,
  peakSharePercent: number
): ConsumptionInput {
  const { shoulder, total, consumerType, billingPeriod, providerName, tariffCode } = base;

  const peak = (peakSharePercent / 100) * total;
  const offPeak = Math.max(0, total - shoulder - peak);

  return {
    offPeak,
    shoulder,
    peak,
    total,
    consumerType,
    billingPeriod,
    providerName,
    tariffCode,
  };
}

/**
 * Return the index of the cheapest plan for a given consumption profile.
 */
function cheapestPlanIndex(consumption: ConsumptionInput, plans: TariffPlan[]): number {
  let minCost = Infinity;
  let minIndex = 0;
  for (let i = 0; i < plans.length; i++) {
    const cost = calculateBill(consumption, plans[i]).estimatedTotal;
    if (cost < minCost) {
      minCost = cost;
      minIndex = i;
    }
  }
  return minIndex;
}

/**
 * Find the peak-usage percentage crossover point between two competing plans.
 * Uses binary search; converges within MAX_ITERATIONS to TOLERANCE% precision.
 *
 * Constraints:
 *   - peakShare is clamped to [0, (total - shoulder) / total * 100] so off-peak never goes negative.
 *   - If no crossover exists in the valid range, crossoverExists is false.
 */
export function findBreakEven(
  consumption: ConsumptionInput,
  plans: TariffPlan[]
): BreakEvenResult {
  if (plans.length < 2) {
    return {
      crossoverExists: false,
      crossoverPeakPercent: null,
      lowerPeakPlanId: null,
      higherPeakPlanId: null,
      explanation: 'At least two plans are required for break-even analysis.',
    };
  }

  const { shoulder, total } = consumption;

  // Maximum peak share so that off-peak does not go negative
  const maxPeakShare = total > 0 ? Math.max(0, ((total - shoulder) / total) * 100) : 0;
  const minPeakShare = 0;

  const cheapestAtMin = cheapestPlanIndex(
    buildConsumptionAtPeakShare(consumption, minPeakShare),
    plans
  );
  const cheapestAtMax = cheapestPlanIndex(
    buildConsumptionAtPeakShare(consumption, maxPeakShare),
    plans
  );

  // No crossover if the same plan wins at both extremes
  if (cheapestAtMin === cheapestAtMax) {
    const dominantPlan = plans[cheapestAtMin];
    return {
      crossoverExists: false,
      crossoverPeakPercent: null,
      lowerPeakPlanId: dominantPlan.id,
      higherPeakPlanId: dominantPlan.id,
      explanation:
        `${dominantPlan.name} remains the cheaper plan throughout the entire tested peak-usage range ` +
        `(0% – ${maxPeakShare.toFixed(1)}%). No crossover point exists for the supplied plans.`,
    };
  }

  // Binary search for the crossover point
  let lo = minPeakShare;
  let hi = maxPeakShare;
  let iterations = 0;

  while (hi - lo > TOLERANCE && iterations < MAX_ITERATIONS) {
    const mid = (lo + hi) / 2;
    const cheapestAtMid = cheapestPlanIndex(
      buildConsumptionAtPeakShare(consumption, mid),
      plans
    );
    if (cheapestAtMid === cheapestAtMin) {
      lo = mid;
    } else {
      hi = mid;
    }
    iterations++;
  }

  const crossoverPeakPercent = (lo + hi) / 2;
  const lowerPlan = plans[cheapestAtMin];
  const higherPlan = plans[cheapestAtMax];

  return {
    crossoverExists: true,
    crossoverPeakPercent,
    lowerPeakPlanId: lowerPlan.id,
    higherPeakPlanId: higherPlan.id,
    explanation:
      `${lowerPlan.name} is cheaper when peak usage is below approximately ${crossoverPeakPercent.toFixed(1)}% of total consumption. ` +
      `Above ${crossoverPeakPercent.toFixed(1)}%, ${higherPlan.name} becomes the lower-cost plan.`,
  };
}
