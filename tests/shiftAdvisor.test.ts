/**
 * shiftAdvisor.test.ts
 *
 * Tests for generateShiftScenarios.
 */
import { describe, it, expect } from 'vitest';
import { generateShiftScenarios } from '../src/utils/shiftAdvisor.ts';
import { compareAllPlans } from '../src/utils/billingEngine.ts';
import { SAMPLE_PLANS } from '../src/data/samplePlans.ts';
import type { ConsumptionInput, TariffPlan } from '../src/types/index.ts';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const consumption: ConsumptionInput = {
  offPeak: 120,
  shoulder: 150,
  peak: 80,
  total: 350,
  consumerType: 'household',
  billingPeriod: 'monthly',
};

const originalBills = compareAllPlans(consumption, SAMPLE_PLANS);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('generateShiftScenarios', () => {
  it('produces exactly 3 scenarios (10%, 20%, 30%)', () => {
    const scenarios = generateShiftScenarios(consumption, SAMPLE_PLANS, originalBills);
    expect(scenarios).toHaveLength(3);
    expect(scenarios.map((s) => s.shiftPercent)).toEqual([10, 20, 30]);
  });

  it('total kWh is preserved in all scenarios', () => {
    const scenarios = generateShiftScenarios(consumption, SAMPLE_PLANS, originalBills);
    for (const s of scenarios) {
      expect(s.adjustedConsumption.total).toBeCloseTo(consumption.total, 4);
    }
  });

  it('shoulder kWh is unchanged in all scenarios', () => {
    const scenarios = generateShiftScenarios(consumption, SAMPLE_PLANS, originalBills);
    for (const s of scenarios) {
      expect(s.adjustedConsumption.shoulder).toBeCloseTo(consumption.shoulder, 4);
    }
  });

  it('unitsShifted = peak × (shiftPercent / 100)', () => {
    const scenarios = generateShiftScenarios(consumption, SAMPLE_PLANS, originalBills);
    for (const s of scenarios) {
      const expected = consumption.peak * (s.shiftPercent / 100);
      expect(s.unitsShifted).toBeCloseTo(expected, 4);
    }
  });

  it('savings are positive when shifting to cheaper off-peak rates (TOU plan)', () => {
    // Smart TOU has lower off-peak rate (4.25) vs peak (9.00), so shifting saves money
    const scenarios = generateShiftScenarios(consumption, SAMPLE_PLANS, originalBills);
    const touPlanId = SAMPLE_PLANS.find((p) => p.name === 'Smart TOU')!.id;
    const firstScenario = scenarios[0];
    // savings[touPlanId] should be positive (bill decreases when peak → off-peak)
    expect(firstScenario.savings[touPlanId]).toBeGreaterThan(0);
  });

  it('savings are zero for flat plan (same rate in all periods)', () => {
    const flatPlan: TariffPlan = {
      id: 'flat-only',
      name: 'Flat Only',
      fixedCharge: 100,
      offPeakRate: 6.0,
      shoulderRate: 6.0,
      peakRate: 6.0,
      taxDutyPercent: 0,
      surcharge: 0,
    };
    const bills = compareAllPlans(consumption, [flatPlan]);
    const scenarios = generateShiftScenarios(consumption, [flatPlan], bills);
    for (const s of scenarios) {
      expect(s.savings[flatPlan.id]).toBeCloseTo(0, 4);
    }
  });

  it('recommendationChanges is a boolean in every scenario', () => {
    const scenarios = generateShiftScenarios(consumption, SAMPLE_PLANS, originalBills);
    for (const s of scenarios) {
      expect(typeof s.recommendationChanges).toBe('boolean');
    }
  });

  it('newRecommendedPlanId is set in every scenario', () => {
    const scenarios = generateShiftScenarios(consumption, SAMPLE_PLANS, originalBills);
    for (const s of scenarios) {
      expect(typeof s.newRecommendedPlanId).toBe('string');
      expect(s.newRecommendedPlanId.length).toBeGreaterThan(0);
    }
  });
});
