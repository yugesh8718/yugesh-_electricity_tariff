import { describe, expect, it } from 'vitest';
import { comparePlans } from '../src/utils/comparePlans.js';
import { samplePlans } from '../src/data/samplePlans.js';

describe('comparePlans with approved sample plans', () => {
  it('selects Plan A for low peak usage and reports ₹50 savings', () => {
    const result = comparePlans({ peak: 10, normal: 100, offPeak: 100 }, samplePlans);
    expect(result.results.map((item) => item.bill)).toEqual([950, 1000]);
    expect(result.cheapest[0].plan.id).toBe('saver');
    expect(result.savings).toBe(50);
    expect(result.isTie).toBe(false);
  });

  it('selects Plan B for high peak usage and reports ₹70 savings', () => {
    const result = comparePlans({ peak: 50, normal: 100, offPeak: 100 }, samplePlans);
    expect(result.results.map((item) => item.bill)).toEqual([1230, 1160]);
    expect(result.cheapest[0].plan.id).toBe('timesmart');
    expect(result.savings).toBe(70);
  });

  it('identifies a tie when the two bills are equal', () => {
    const result = comparePlans({ peak: 80 / 3, normal: 100, offPeak: 100 }, samplePlans);
    expect(result.isTie).toBe(true);
    expect(result.savings).toBeCloseTo(0, 8);
    expect(result.cheapest).toHaveLength(2);
  });

  it('requires at least two plans', () => {
    expect(() => comparePlans({ peak: 0, normal: 0, offPeak: 0 }, [samplePlans[0]])).toThrow(/at least two/i);
  });
});
