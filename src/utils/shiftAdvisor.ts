/**
 * shiftAdvisor.ts
 *
 * Shows how the bill changes if the user moves peak consumption to off-peak hours
 * without reducing total usage.
 *
 * Shift scenarios: 10%, 20%, 30% of peak units moved to off-peak.
 * Shoulder consumption is unchanged.
 * Total consumption is unchanged.
 */

import type {
  ConsumptionInput,
  TariffPlan,
  BillBreakdown,
  ShiftScenario,
} from '../types/index.js';
import { calculateBill, compareAllPlans } from './billingEngine.js';
import { formatCurrency } from './formatCurrency.js';

const SHIFT_PERCENTS = [10, 20, 30];

/**
 * Generate 3 peak-to-off-peak shift scenarios.
 *
 * @param consumption    - Original consumption profile
 * @param plans          - All tariff plans to evaluate
 * @param originalBills  - Pre-calculated bills at current consumption (sorted by cost)
 */
export function generateShiftScenarios(
  consumption: ConsumptionInput,
  plans: TariffPlan[],
  originalBills: BillBreakdown[]
): ShiftScenario[] {
  const originalRecommendedPlanId = originalBills[0]?.planId ?? '';

  // Build a lookup for original costs by planId
  const originalCostByPlanId: Record<string, number> = {};
  for (const bill of originalBills) {
    originalCostByPlanId[bill.planId] = bill.estimatedTotal;
  }

  return SHIFT_PERCENTS.map((shiftPercent) => {
    const unitsShifted = consumption.peak * (shiftPercent / 100);
    const newPeak = Math.max(0, consumption.peak - unitsShifted);
    const newOffPeak = consumption.offPeak + unitsShifted;

    const adjustedConsumption: ConsumptionInput = {
      ...consumption,
      offPeak: newOffPeak,
      peak: newPeak,
      // shoulder and total remain unchanged
    };

    const newPeakPercent =
      consumption.total > 0 ? (newPeak / consumption.total) * 100 : 0;

    // Calculate bills for all plans with new consumption
    const newBills = compareAllPlans(adjustedConsumption, plans);
    const newRecommendedPlanId = newBills[0]?.planId ?? '';
    const recommendationChanges = newRecommendedPlanId !== originalRecommendedPlanId;

    // Savings per plan (positive = cheaper than original)
    const savings: Record<string, number> = {};
    for (const bill of newBills) {
      const original = originalCostByPlanId[bill.planId] ?? 0;
      savings[bill.planId] = original - bill.estimatedTotal;
    }

    // Explanation for the recommended (currently cheapest) plan
    const recPlanSavings = savings[originalRecommendedPlanId] ?? 0;
    const recPlanOriginalBill = originalCostByPlanId[originalRecommendedPlanId] ?? 0;
    const recPlanNewBill =
      newBills.find((b) => b.planId === originalRecommendedPlanId)?.estimatedTotal ??
      recPlanOriginalBill;

    let explanation: string;
    if (recPlanSavings > 0) {
      explanation =
        `Moving ${unitsShifted.toFixed(1)} kWh from peak to off-peak hours could reduce the ` +
        `${originalBills.find((b) => b.planId === originalRecommendedPlanId)?.planName ?? originalRecommendedPlanId} ` +
        `estimate by ${formatCurrency(recPlanSavings)} without reducing total consumption.`;
    } else if (recPlanSavings < 0) {
      explanation =
        `Shifting ${unitsShifted.toFixed(1)} kWh from peak to off-peak would increase the ` +
        `${originalBills.find((b) => b.planId === originalRecommendedPlanId)?.planName ?? originalRecommendedPlanId} ` +
        `estimate by ${formatCurrency(Math.abs(recPlanSavings))}.`;
    } else {
      explanation =
        `Shifting ${unitsShifted.toFixed(1)} kWh from peak to off-peak does not change the ` +
        `${originalBills.find((b) => b.planId === originalRecommendedPlanId)?.planName ?? originalRecommendedPlanId} ` +
        `estimate (flat-rate plan).`;
    }

    if (recommendationChanges) {
      const newRecPlanName =
        newBills.find((b) => b.planId === newRecommendedPlanId)?.planName ?? newRecommendedPlanId;
      explanation += ` Note: after this shift, ${newRecPlanName} becomes the recommended plan.`;
    }

    // Note about appliance safety (per spec requirement)
    explanation +=
      ' Not all appliances can safely be rescheduled — check manufacturer guidance before shifting high-load equipment.';

    return {
      shiftPercent,
      unitsShifted,
      newPeakPercent,
      adjustedConsumption,
      bills: newBills,
      savings,
      recommendationChanges,
      newRecommendedPlanId,
      explanation,
    };
  });
}
