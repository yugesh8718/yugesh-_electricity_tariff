/**
 * riskShield.test.ts
 *
 * Tests for generateRiskShield.
 */
import { describe, it, expect } from 'vitest';
import { generateRiskShield } from '../src/utils/riskShield.ts';
import { SAMPLE_PLANS } from '../src/data/samplePlans.ts';
import type { ConsumptionInput } from '../src/types/index.ts';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const consumption: ConsumptionInput = {
  offPeak: 120,
  shoulder: 150,
  peak: 80,
  total: 350,
  consumerType: 'household',
  billingPeriod: 'monthly',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('generateRiskShield', () => {
  it('generates exactly 25 scenarios (5 multipliers × 5 deltas)', () => {
    const result = generateRiskShield(consumption, SAMPLE_PLANS, SAMPLE_PLANS[0].id);
    expect(result.scenarios).toHaveLength(25);
  });

  it('no negative consumption in any scenario', () => {
    const result = generateRiskShield(consumption, SAMPLE_PLANS, SAMPLE_PLANS[0].id);
    for (const scenario of result.scenarios) {
      const { offPeak, shoulder, peak, total } = scenario.adjustedConsumption;
      expect(offPeak).toBeGreaterThanOrEqual(0);
      expect(shoulder).toBeGreaterThanOrEqual(0);
      expect(peak).toBeGreaterThanOrEqual(0);
      expect(total).toBeGreaterThanOrEqual(0);
    }
  });

  it('confidence score is between 0 and 100', () => {
    const result = generateRiskShield(consumption, SAMPLE_PLANS, SAMPLE_PLANS[1].id);
    expect(result.recommendationConfidence).toBeGreaterThanOrEqual(0);
    expect(result.recommendationConfidence).toBeLessThanOrEqual(100);
  });

  it('planStats avgCost is the mean of all 25 scenario bills for each plan', () => {
    const result = generateRiskShield(consumption, SAMPLE_PLANS, SAMPLE_PLANS[0].id);
    for (const stats of result.planStats) {
      const sum = result.scenarios.reduce((acc, s) => acc + (s.bills[stats.planId] ?? 0), 0);
      const expectedAvg = sum / 25;
      expect(stats.avgCost).toBeCloseTo(expectedAvg, 4);
    }
  });

  it('scenariosWon totals across all plans equal 25', () => {
    const result = generateRiskShield(consumption, SAMPLE_PLANS, SAMPLE_PLANS[0].id);
    const totalWon = result.planStats.reduce((sum, ps) => sum + ps.scenariosWon, 0);
    expect(totalWon).toBe(25);
  });

  it('cheapestTodayPlanId matches the plan that wins at multiplier=1.0, delta=0', () => {
    const result = generateRiskShield(consumption, SAMPLE_PLANS, SAMPLE_PLANS[0].id);
    const todayScenario = result.scenarios.find(
      (s) => s.consumptionMultiplier === 1.0 && s.peakShiftDelta === 0
    );
    expect(todayScenario).toBeDefined();
    expect(result.cheapestTodayPlanId).toBe(todayScenario!.cheapestPlanId);
  });

  it('planStats has one entry per plan', () => {
    const result = generateRiskShield(consumption, SAMPLE_PLANS, SAMPLE_PLANS[0].id);
    expect(result.planStats).toHaveLength(SAMPLE_PLANS.length);
  });

  it('stabilityPercent equals scenariosWon / 25 × 100', () => {
    const result = generateRiskShield(consumption, SAMPLE_PLANS, SAMPLE_PLANS[0].id);
    for (const ps of result.planStats) {
      expect(ps.stabilityPercent).toBeCloseTo((ps.scenariosWon / 25) * 100, 4);
    }
  });
});
