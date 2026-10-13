/**
 * regretGuard.ts
 *
 * Calculates how much the user may regret choosing a plan if consumption changes.
 *
 * For every risk scenario:
 *   regret = bills[selectedPlanId] − min(bills across all plans)
 *
 * The minimum is always 0 or positive (selected plan is never cheaper than the cheapest).
 */

import type { RiskShieldResult, RegretResult, RiskScenario } from '../types/index.js';
import { formatCurrency } from './formatCurrency.js';

/**
 * Calculate regret metrics for the selected plan across all risk scenarios.
 */
export function calculateRegret(
  riskShield: RiskShieldResult,
  selectedPlanId: string
): RegretResult {
  const { scenarios } = riskShield;

  // Today's scenario (multiplier=1.0, delta=0) for current cost reference
  const todayScenario = scenarios.find(
    (s) => s.consumptionMultiplier === 1.0 && s.peakShiftDelta === 0
  );
  const todayCost = todayScenario?.bills[selectedPlanId] ?? 0;
  const todayCheapestCost = todayScenario
    ? Math.min(...Object.values(todayScenario.bills))
    : 0;
  const todaySavings = todayCost - todayCheapestCost; // negative = saving over cheapest

  let totalRegret = 0;
  let maxRegret = 0;
  let maxRegretScenario: RiskScenario | null = null;

  for (const scenario of scenarios) {
    const selectedCost = scenario.bills[selectedPlanId] ?? 0;
    const cheapestCost = Math.min(...Object.values(scenario.bills));
    const regret = Math.max(0, selectedCost - cheapestCost);

    totalRegret += regret;

    if (regret > maxRegret) {
      maxRegret = regret;
      maxRegretScenario = scenario;
    }
  }

  const avgRegret = scenarios.length > 0 ? totalRegret / scenarios.length : 0;

  // Build explanation
  let explanation: string;
  if (maxRegret === 0) {
    explanation = `Your selected plan is the lowest-cost option in every simulated scenario — no regret detected.`;
  } else {
    // If today the selected plan saves money vs the cheapest today:
    const savingStr =
      todaySavings <= 0
        ? `saves ${formatCurrency(Math.abs(todaySavings))} today`
        : `costs ${formatCurrency(todaySavings)} more than the cheapest plan today`;

    explanation =
      `Your selected plan ${savingStr}, but could cost up to ${formatCurrency(maxRegret)} more than ` +
      `the cheapest available plan if peak usage rises significantly. ` +
      `On average across all simulated scenarios, the extra cost is ${formatCurrency(avgRegret)}.`;
  }

  return {
    selectedPlanId,
    avgRegret,
    maxRegret,
    maxRegretScenario,
    explanation,
  };
}
