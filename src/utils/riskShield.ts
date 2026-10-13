/**
 * riskShield.ts
 *
 * Generates exactly 25 risk scenarios (5 consumption multipliers × 5 peak-shift deltas)
 * and aggregates plan statistics with a recommendation confidence score.
 *
 * Consumption multipliers : [0.8, 0.9, 1.0, 1.1, 1.2]
 * Peak shift deltas (pp)  : [-15, -10, 0, +10, +15]
 *
 * For each scenario:
 *   1. Scale total consumption by the multiplier (offPeak and shoulder scale proportionally,
 *      then peak is re-derived from peak share after shift).
 *   2. Apply peakShiftDelta as ± percentage points to the peak share.
 *   3. Clamp peak share to [0, 100].
 *   4. Redistribute the remainder proportionally between offPeak and shoulder
 *      (maintaining their original ratio).
 *   5. Ensure no negative consumption values.
 */

import type {
  ConsumptionInput,
  TariffPlan,
  RiskScenario,
  RiskShieldResult,
  PlanStats,
} from '../types/index.js';
import { calculateBill } from './billingEngine.js';

const CONSUMPTION_MULTIPLIERS = [0.8, 0.9, 1.0, 1.1, 1.2];
const PEAK_SHIFT_DELTAS = [-15, -10, 0, 10, 15];

/**
 * Build an adjusted consumption input for a single scenario cell.
 * Guarantees non-negative values.
 */
function buildScenarioConsumption(
  base: ConsumptionInput,
  consumptionMultiplier: number,
  peakShiftDelta: number
): ConsumptionInput {
  const { offPeak, shoulder, peak, total, consumerType, billingPeriod, providerName, tariffCode } =
    base;

  // Scale total
  const scaledTotal = total * consumptionMultiplier;

  // Original shares
  const originalPeakShare = total > 0 ? (peak / total) * 100 : 0;
  const originalOffPeakShare = total > 0 ? (offPeak / total) * 100 : 0;
  const originalShoulderShare = total > 0 ? (shoulder / total) * 100 : 0;

  // New peak share after delta, clamped to [0, 100]
  const newPeakShare = Math.max(0, Math.min(100, originalPeakShare + peakShiftDelta));

  // Remainder for off-peak + shoulder
  const remainderShare = 100 - newPeakShare;

  // Redistribute remainder proportionally between offPeak and shoulder
  const offPeakPlusShoulderOriginal = originalOffPeakShare + originalShoulderShare;

  let newOffPeakShare: number;
  let newShoulderShare: number;

  if (offPeakPlusShoulderOriginal > 0) {
    newOffPeakShare = (originalOffPeakShare / offPeakPlusShoulderOriginal) * remainderShare;
    newShoulderShare = (originalShoulderShare / offPeakPlusShoulderOriginal) * remainderShare;
  } else {
    // Equal split when both are zero
    newOffPeakShare = remainderShare / 2;
    newShoulderShare = remainderShare / 2;
  }

  // Convert shares to absolute kWh on the scaled total
  const newPeak = Math.max(0, (newPeakShare / 100) * scaledTotal);
  const newOffPeak = Math.max(0, (newOffPeakShare / 100) * scaledTotal);
  const newShoulder = Math.max(0, (newShoulderShare / 100) * scaledTotal);

  return {
    offPeak: newOffPeak,
    shoulder: newShoulder,
    peak: newPeak,
    total: scaledTotal,
    consumerType,
    billingPeriod,
    providerName,
    tariffCode,
  };
}

/**
 * Generate exactly 25 scenarios and aggregate risk shield statistics.
 */
export function generateRiskShield(
  consumption: ConsumptionInput,
  plans: TariffPlan[],
  recommendedPlanId: string
): RiskShieldResult {
  const scenarios: RiskScenario[] = [];

  // Initialize plan stats
  const statsMap = new Map<string, PlanStats>();
  for (const plan of plans) {
    statsMap.set(plan.id, {
      planId: plan.id,
      planName: plan.name,
      scenariosWon: 0,
      stabilityPercent: 0,
      maxCost: -Infinity,
      avgCost: 0,
      worstCaseCost: -Infinity,
      bestCaseCost: Infinity,
    });
  }

  // Generate 5 × 5 = 25 scenarios
  for (const multiplier of CONSUMPTION_MULTIPLIERS) {
    for (const delta of PEAK_SHIFT_DELTAS) {
      const adjusted = buildScenarioConsumption(consumption, multiplier, delta);

      // Calculate bill for each plan
      const bills: Record<string, number> = {};
      let minCost = Infinity;
      let cheapestPlanId = plans[0].id;

      for (const plan of plans) {
        const bill = calculateBill(adjusted, plan).estimatedTotal;
        bills[plan.id] = bill;

        const stats = statsMap.get(plan.id)!;
        if (bill > stats.maxCost) stats.maxCost = bill;
        if (bill > stats.worstCaseCost) stats.worstCaseCost = bill;
        if (bill < stats.bestCaseCost) stats.bestCaseCost = bill;
        stats.avgCost += bill;

        if (bill < minCost) {
          minCost = bill;
          cheapestPlanId = plan.id;
        }
      }

      // Credit the winner
      const winner = statsMap.get(cheapestPlanId)!;
      winner.scenariosWon += 1;

      scenarios.push({
        consumptionMultiplier: multiplier,
        peakShiftDelta: delta,
        adjustedConsumption: adjusted,
        bills,
        cheapestPlanId,
      });
    }
  }

  const totalScenarios = scenarios.length; // 25

  // Finalize averages and stability
  for (const stats of statsMap.values()) {
    stats.avgCost = stats.avgCost / totalScenarios;
    stats.stabilityPercent = (stats.scenariosWon / totalScenarios) * 100;
    // Guard against no scenarios (shouldn't happen)
    if (!isFinite(stats.bestCaseCost)) stats.bestCaseCost = 0;
    if (!isFinite(stats.worstCaseCost)) stats.worstCaseCost = 0;
    if (!isFinite(stats.maxCost)) stats.maxCost = 0;
  }

  const planStats = Array.from(statsMap.values());

  // Recommendation confidence: fraction of scenarios where recommended plan wins
  const recommendedStats = statsMap.get(recommendedPlanId);
  const recommendationConfidence = recommendedStats
    ? (recommendedStats.scenariosWon / totalScenarios) * 100
    : 0;

  // cheapestToday: plan with lowest cost at current consumption (multiplier=1, delta=0)
  const todayScenario = scenarios.find(
    (s) => s.consumptionMultiplier === 1.0 && s.peakShiftDelta === 0
  )!;
  const cheapestTodayPlanId = todayScenario.cheapestPlanId;

  // mostStablePlan: highest scenariosWon
  const mostStablePlanId = planStats.reduce((a, b) =>
    a.scenariosWon >= b.scenariosWon ? a : b
  ).planId;

  // lowestWorstCasePlan: lowest worstCaseCost
  const lowestWorstCasePlanId = planStats.reduce((a, b) =>
    a.worstCaseCost <= b.worstCaseCost ? a : b
  ).planId;

  return {
    scenarios,
    planStats,
    recommendationConfidence,
    cheapestTodayPlanId,
    mostStablePlanId,
    lowestWorstCasePlanId,
  };
}
