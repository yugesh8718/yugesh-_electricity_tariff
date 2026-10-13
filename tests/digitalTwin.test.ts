/**
 * digitalTwin.test.ts
 *
 * Tests for classifyFingerprint / generateFingerprint.
 */
import { describe, it, expect } from 'vitest';
import { generateFingerprint, classifyFingerprint } from '../src/utils/digitalTwin.ts';
import type { ConsumptionInput } from '../src/types/index.ts';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeConsumption(
  offPeak: number,
  shoulder: number,
  peak: number,
  consumerType: ConsumptionInput['consumerType'] = 'household'
): ConsumptionInput {
  return {
    offPeak,
    shoulder,
    peak,
    total: offPeak + shoulder + peak,
    consumerType,
    billingPeriod: 'monthly',
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('generateFingerprint', () => {
  it('peak share >= 45% → Peak-Heavy Household', () => {
    // 170 out of 350 = 48.57%
    const fp = generateFingerprint(makeConsumption(70, 110, 170));
    expect(fp.label).toBe('Peak-Heavy Household');
  });

  it('off-peak share >= 45% → Off-Peak Optimiser', () => {
    // 170 out of 370 = 45.9%
    const fp = generateFingerprint(makeConsumption(170, 130, 70));
    expect(fp.label).toBe('Off-Peak Optimiser');
  });

  it('shoulder share >= 50% with household → Daytime Dominant', () => {
    // 200 out of 390 = 51.3%
    const fp = generateFingerprint(makeConsumption(100, 200, 90));
    expect(fp.label).toBe('Daytime Dominant');
  });

  it('shoulder share >= 50% with small-business → Daytime Small Business', () => {
    // 300 out of 550 = 54.5%
    const fp = generateFingerprint(makeConsumption(90, 300, 160, 'small-business'));
    expect(fp.label).toBe('Daytime Small Business');
  });

  it('balanced usage → Balanced Household', () => {
    // 120/350=34.3%, 150/350=42.9%, 80/350=22.9% — none >= threshold
    const fp = generateFingerprint(makeConsumption(120, 150, 80));
    expect(fp.label).toBe('Balanced Household');
  });

  it('returned fingerprint contains accurate percentages', () => {
    const fp = generateFingerprint(makeConsumption(100, 200, 100));
    expect(fp.offPeakShare).toBeCloseTo(25, 1);
    expect(fp.shoulderShare).toBeCloseTo(50, 1);
    expect(fp.peakShare).toBeCloseTo(25, 1);
  });

  it('explanation is a non-empty string', () => {
    const fp = generateFingerprint(makeConsumption(120, 150, 80));
    expect(typeof fp.explanation).toBe('string');
    expect(fp.explanation.length).toBeGreaterThan(0);
  });

  it('classifyFingerprint and generateFingerprint return identical results', () => {
    const c = makeConsumption(120, 150, 80);
    expect(classifyFingerprint(c)).toEqual(generateFingerprint(c));
  });

  it('handles zero total gracefully (no division by zero)', () => {
    const c: ConsumptionInput = {
      offPeak: 0,
      shoulder: 0,
      peak: 0,
      total: 0,
      consumerType: 'household',
      billingPeriod: 'monthly',
    };
    const fp = generateFingerprint(c);
    expect(fp.offPeakShare).toBe(0);
    expect(fp.peakShare).toBe(0);
  });
});
