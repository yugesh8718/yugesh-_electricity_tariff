/**
 * billingEngine.test.ts
 *
 * Tests for calculateBill and compareAllPlans.
 */
import { describe, it, expect } from 'vitest';
import { calculateBill, compareAllPlans } from '../src/utils/billingEngine.ts';
import { SAMPLE_PLANS } from '../src/data/samplePlans.ts';
import type { ConsumptionInput, TariffPlan } from '../src/types/index.ts';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseConsumption: ConsumptionInput = {
  offPeak: 100,
  shoulder: 100,
  peak: 100,
  total: 300,
  consumerType: 'household',
  billingPeriod: 'monthly',
};

const flatPlan: TariffPlan = {
  id: 'flat',
  name: 'Flat 6.25',
  fixedCharge: 120,
  offPeakRate: 6.25,
  shoulderRate: 6.25,
  peakRate: 6.25,
  taxDutyPercent: 0,
  surcharge: 0,
};

const touPlan: TariffPlan = {
  id: 'tou',
  name: 'TOU',
  fixedCharge: 150,
  offPeakRate: 4.25,
  shoulderRate: 6.0,
  peakRate: 9.0,
  taxDutyPercent: 0,
  surcharge: 0,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('calculateBill', () => {
  it('flat tariff: all rates 6.25 → energy charge = total × 6.25', () => {
    const bill = calculateBill(baseConsumption, flatPlan);
    expect(bill.energyCharge).toBeCloseTo(300 * 6.25, 4);
  });

  it('flat tariff: all rates equal → off-peak, shoulder and peak charges are equal', () => {
    const bill = calculateBill(baseConsumption, flatPlan);
    expect(bill.offPeakCharge).toBeCloseTo(bill.shoulderCharge, 4);
    expect(bill.shoulderCharge).toBeCloseTo(bill.peakCharge, 4);
  });

  it('TOU tariff: peak charge uses peakRate 9.00', () => {
    const bill = calculateBill(baseConsumption, touPlan);
    expect(bill.peakCharge).toBeCloseTo(100 * 9.0, 4);
  });

  it('TOU tariff: off-peak charge uses offPeakRate 4.25', () => {
    const bill = calculateBill(baseConsumption, touPlan);
    expect(bill.offPeakCharge).toBeCloseTo(100 * 4.25, 4);
  });

  it('monthly billing: fixed charge equals plan.fixedCharge', () => {
    const bill = calculateBill(baseConsumption, flatPlan);
    expect(bill.fixedCharge).toBeCloseTo(flatPlan.fixedCharge, 4);
  });

  it('bimonthly billing: fixed charge equals 2 × plan.fixedCharge', () => {
    const bimonthly: ConsumptionInput = { ...baseConsumption, billingPeriod: 'bimonthly' };
    const bill = calculateBill(bimonthly, flatPlan);
    expect(bill.fixedCharge).toBeCloseTo(flatPlan.fixedCharge * 2, 4);
  });

  it('tax calculation: 5% duty is applied to subtotal', () => {
    const taxPlan: TariffPlan = { ...flatPlan, id: 'tax', taxDutyPercent: 5 };
    const bill = calculateBill(baseConsumption, taxPlan);
    expect(bill.duty).toBeCloseTo(bill.subtotal * 0.05, 4);
  });

  it('surcharge is added to subtotal', () => {
    const surPlan: TariffPlan = { ...flatPlan, id: 'sur', surcharge: 50 };
    const bill = calculateBill(baseConsumption, surPlan);
    expect(bill.subtotal).toBeCloseTo(bill.energyCharge + bill.fixedCharge + 50, 4);
  });

  it('decimal kWh values produce correct charges', () => {
    const decConsumption: ConsumptionInput = {
      ...baseConsumption,
      offPeak: 33.3,
      shoulder: 33.3,
      peak: 33.4,
      total: 100,
    };
    const bill = calculateBill(decConsumption, flatPlan);
    expect(bill.energyCharge).toBeCloseTo(100 * 6.25, 2);
  });

  it('zero usage: only fixed charge applies (energy charge = 0)', () => {
    const zeroCons: ConsumptionInput = {
      offPeak: 0,
      shoulder: 0,
      peak: 0,
      total: 0,
      consumerType: 'household',
      billingPeriod: 'monthly',
    };
    const bill = calculateBill(zeroCons, flatPlan);
    expect(bill.energyCharge).toBe(0);
    expect(bill.estimatedTotal).toBeCloseTo(flatPlan.fixedCharge, 4);
  });

  it('effectiveCostPerKwh is zero when total is zero', () => {
    const zeroCons: ConsumptionInput = {
      offPeak: 0,
      shoulder: 0,
      peak: 0,
      total: 0,
      consumerType: 'household',
      billingPeriod: 'monthly',
    };
    const bill = calculateBill(zeroCons, flatPlan);
    expect(bill.effectiveCostPerKwh).toBe(0);
  });
});

describe('compareAllPlans', () => {
  it('returns results sorted by estimatedTotal ascending', () => {
    const bills = compareAllPlans(baseConsumption, SAMPLE_PLANS);
    for (let i = 1; i < bills.length; i++) {
      expect(bills[i].estimatedTotal).toBeGreaterThanOrEqual(bills[i - 1].estimatedTotal);
    }
  });

  it('both plans equal when using same flat rates', () => {
    const clonedFlat: TariffPlan = { ...flatPlan, id: 'flat2', name: 'Flat Copy' };
    const bills = compareAllPlans(baseConsumption, [flatPlan, clonedFlat]);
    expect(bills[0].estimatedTotal).toBeCloseTo(bills[1].estimatedTotal, 4);
  });

  it('selects cheapest plan for Balanced Household (Smart TOU wins)', () => {
    const balanced: ConsumptionInput = {
      offPeak: 120,
      shoulder: 150,
      peak: 80,
      total: 350,
      consumerType: 'household',
      billingPeriod: 'monthly',
    };
    const bills = compareAllPlans(balanced, SAMPLE_PLANS);
    expect(bills[0].planName).toBe('Smart TOU');
  });

  it('selects cheapest plan for Peak-Heavy Household (Flat Saver wins)', () => {
    const peakHeavy: ConsumptionInput = {
      offPeak: 70,
      shoulder: 110,
      peak: 170,
      total: 350,
      consumerType: 'household',
      billingPeriod: 'monthly',
    };
    const bills = compareAllPlans(peakHeavy, SAMPLE_PLANS);
    expect(bills[0].planName).toBe('Flat Saver');
  });
});
