/**
 * recommendationEngine.ts
 *
 * Orchestrates all five WattWise novelties into a single ComparisonResult.
 * This is a pure TypeScript utility — no React imports.
 */

import type { ConsumptionInput, TariffPlan, ComparisonResult } from '../types/index.js';
import { compareAllPlans } from './billingEngine.js';
import { generateFingerprint } from './digitalTwin.js';
import { findBreakEven } from './breakEvenEngine.js';
import { generateRiskShield } from './riskShield.js';
import { calculateRegret } from './regretGuard.js';
import { generateShiftScenarios } from './shiftAdvisor.js';

/**
 * Orchestrate all novelties and produce a complete ComparisonResult.
 *
 * @param consumption - User's consumption input
 * @param plans       - Tariff plans to compare (min 2 recommended)
 * @returns           ComparisonResult with all analyses populated
 */
export function generateComparison(
  consumption: ConsumptionInput,
  plans: TariffPlan[]
): ComparisonResult {
  // 1. Calculate bills for all plans (sorted cheapest first)
  const bills = compareAllPlans(consumption, plans);
  const recommendedPlanId = bills[0]?.planId ?? '';
  const recommendedPlanName = bills[0]?.planName ?? '';

  // 2. Consumption Digital Twin fingerprint
  const fingerprint = generateFingerprint(consumption);

  // 3. Break-even analysis
  const breakEven = findBreakEven(consumption, plans);

  // 4. Risk Shield (25 scenarios)
  const riskShield = generateRiskShield(consumption, plans, recommendedPlanId);

  // 5. Regret Guard
  const regret = calculateRegret(riskShield, recommendedPlanId);

  // 6. Peak Shift Advisor
  const shiftScenarios = generateShiftScenarios(consumption, plans, bills);

  // 7. Natural-language explanation
  const todayCheapest = bills[0];
  const todaySecond = bills[1];
  const savingsOverSecond =
    todaySecond ? todaySecond.estimatedTotal - todayCheapest.estimatedTotal : 0;

  let explanation =
    `Based on your ${fingerprint.label} usage pattern, ${recommendedPlanName} is recommended. `;

  if (savingsOverSecond > 0) {
    explanation += `It saves approximately ₹${savingsOverSecond.toFixed(2)} compared to the next best option. `;
  }

  if (breakEven.crossoverExists && breakEven.crossoverPeakPercent !== null) {
    explanation +=
      `${recommendedPlanName} remains cheapest until peak usage reaches approximately ` +
      `${breakEven.crossoverPeakPercent.toFixed(1)}% of total consumption. `;
  }

  explanation +=
    `Recommendation confidence: ${riskShield.recommendationConfidence.toFixed(0)}% ` +
    `(${bills[0] ? riskShield.planStats.find((s) => s.planId === recommendedPlanId)?.scenariosWon ?? 0 : 0} of 25 simulated scenarios).`;

  return {
    timestamp: new Date().toISOString(),
    consumption,
    plans,
    bills,
    recommendedPlanId,
    fingerprint,
    breakEven,
    riskShield,
    regret,
    shiftScenarios,
    explanation,
  };
}
