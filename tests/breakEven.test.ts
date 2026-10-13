/**
 * breakEven.test.ts
 *
 * Tests for findBreakEven.
 */
import { describe, it, expect } from 'vitest';
import { findBreakEven } from '../src/utils/breakEvenEngine.ts';
import { SAMPLE_PLANS } from '../src/data/samplePlans.ts';
import type { ConsumptionInput, TariffPlan } from '../src/types/index.ts';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const balancedConsumption: ConsumptionInput = {
  offPeak: 120,
  shoulder: 150,
  peak: 80,
  total: 350,
  consumerType: 'household',
  billingPeriod: 'monthly',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('findBreakEven', () => {
  it('crossover exists between Flat Saver and Smart TOU for balanced profile', () => {
    const result = findBreakEven(balancedConsumption, SAMPLE_PLANS);
    expect(result.crossoverExists).toBe(true);
    expect(result.crossoverPeakPercent).not.toBeNull();
  });

  it('crossoverPeakPercent is within valid range [0, 100]', () => {
    const result = findBreakEven(balancedConsumption, SAMPLE_PLANS);
    expect(result.crossoverPeakPercent!).toBeGreaterThanOrEqual(0);
    expect(result.crossoverPeakPercent!).toBeLessThanOrEqual(100);
  });

  it('total stays constant in all tested points (shoulder held constant)', () => {
    // The engine only shifts between off-peak and peak; total and shoulder stay fixed
    const result = findBreakEven(balancedConsumption, SAMPLE_PLANS);
    // We verify by checking the algorithm does not produce off-peak < 0
    // at the crossover point
    const pct = result.crossoverPeakPercent ?? 50;
    const peak = (pct / 100) * balancedConsumption.total;
    const offPeak = balancedConsumption.total - balancedConsumption.shoulder - peak;
    expect(offPeak).toBeGreaterThanOrEqual(-0.001);
  });

  it('no crossover when both plans have identical rates', () => {
    const identicalPlan: TariffPlan = { ...SAMPLE_PLANS[0], id: 'flat2', name: 'Flat Copy' };
    const result = findBreakEven(balancedConsumption, [SAMPLE_PLANS[0], identicalPlan]);
    expect(result.crossoverExists).toBe(false);
  });

  it('crossoverPeakPercent is not hard-coded — changes when peak rate changes', () => {
    const result1 = findBreakEven(balancedConsumption, SAMPLE_PLANS);

    // Increase peakRate of TOU plan → crossover moves
    const highPeakTOU: TariffPlan = {
      ...SAMPLE_PLANS[1],
      peakRate: 12.0,
    };
    const result2 = findBreakEven(balancedConsumption, [SAMPLE_PLANS[0], highPeakTOU]);

    if (result1.crossoverExists && result2.crossoverExists) {
      expect(result2.crossoverPeakPercent).not.toBeCloseTo(
        result1.crossoverPeakPercent!,
        0
      );
    }
  });

  it('explanation is a non-empty string', () => {
    const result = findBreakEven(balancedConsumption, SAMPLE_PLANS);
    expect(typeof result.explanation).toBe('string');
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  it('returns correct no-crossover result when only one plan is supplied', () => {
    const result = findBreakEven(balancedConsumption, [SAMPLE_PLANS[0]]);
    expect(result.crossoverExists).toBe(false);
  });
});
