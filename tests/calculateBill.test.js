import { describe, expect, it } from 'vitest';
import { calculateBill } from '../src/utils/calculateBill.js';
import { samplePlans } from '../src/data/samplePlans.js';

describe('calculateBill', () => {
  it('calculates the worked example correctly', () => {
    const plan = { fixedMonthlyCharge: 100, peakRate: 8, normalRate: 5, offPeakRate: 3 };
    // 100 + (10×8) + (100×5) + (100×3) = 100 + 80 + 500 + 300 = 980
    expect(calculateBill({ peak: 10, normal: 100, offPeak: 100 }, plan)).toBe(980);
  });

  it('returns the fixed charge when all usage is zero', () => {
    expect(calculateBill({ peak: 0, normal: 0, offPeak: 0 }, samplePlans[0])).toBe(80);
  });

  it('works when the fixed charge is zero', () => {
    const plan = { fixedMonthlyCharge: 0, peakRate: 2, normalRate: 3, offPeakRate: 4 };
    expect(calculateBill({ peak: 1, normal: 2, offPeak: 3 }, plan)).toBe(20);
  });

  it('works when all rates are zero', () => {
    const plan = { fixedMonthlyCharge: 42, peakRate: 0, normalRate: 0, offPeakRate: 0 };
    expect(calculateBill({ peak: 5, normal: 6, offPeak: 7 }, plan)).toBe(42);
  });

  it('supports decimal usage without premature rounding', () => {
    const plan = { fixedMonthlyCharge: 0, peakRate: 1.5, normalRate: 2, offPeakRate: 3 };
    expect(calculateBill({ peak: 0.5, normal: 1.25, offPeak: 2 }, plan)).toBe(9.25);
  });

  it('rejects negative consumption', () => {
    expect(() => calculateBill({ peak: -1, normal: 0, offPeak: 0 }, samplePlans[0])).toThrow(/non-negative/);
  });

  it('rejects non-finite usage', () => {
    expect(() => calculateBill({ peak: Number.NaN, normal: 0, offPeak: 0 }, samplePlans[0])).toThrow(/non-negative/);
  });

  it('rejects negative tariff rates', () => {
    const plan = { ...samplePlans[0], peakRate: -1 };
    expect(() => calculateBill({ peak: 1, normal: 0, offPeak: 0 }, plan)).toThrow(/non-negative/);
  });
});
