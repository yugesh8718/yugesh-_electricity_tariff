import { describe, it, expect } from 'vitest';
import {
  calculateSlabProgressive,
  calculateSlabWhole,
  calculateFixedCharges,
  calculateOtherCharges,
  calculateTaxes,
  calculateSubsidy,
  calculateFullBill,
  roundMoney,
} from '../src/lib/tariffEngine.js';
import { DEMO_TARIFFS } from '../src/lib/demoTariffs.js';

// ---------------------------------------------------------------------------
// roundMoney
// ---------------------------------------------------------------------------
describe('roundMoney', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundMoney(1.005)).toBe(1.01);
    expect(roundMoney(1.004)).toBe(1.00);
    expect(roundMoney(100)).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// calculateSlabProgressive
// ---------------------------------------------------------------------------
describe('calculateSlabProgressive', () => {
  const slabs = [
    { upTo: 100,  ratePerUnit: 3.00 },
    { upTo: 200,  ratePerUnit: 5.00 },
    { upTo: null, ratePerUnit: 7.00 },
  ];

  it('charges zero energy when units is 0', () => {
    const result = calculateSlabProgressive(0, slabs);
    expect(result.total).toBe(0);
    expect(result.breakdown).toHaveLength(0);
  });

  it('charges only the first slab when units fall within it', () => {
    // 50 units × ₹3 = ₹150
    const result = calculateSlabProgressive(50, slabs);
    expect(result.total).toBe(150);
    expect(result.breakdown).toHaveLength(1);
  });

  it('charges exactly at the first slab boundary', () => {
    // 100 units × ₹3 = ₹300
    const result = calculateSlabProgressive(100, slabs);
    expect(result.total).toBe(300);
  });

  it('spans two slabs correctly (101 units)', () => {
    // 100 × 3 = 300 + 1 × 5 = 5 → 305
    const result = calculateSlabProgressive(101, slabs);
    expect(result.total).toBe(305);
    expect(result.breakdown).toHaveLength(2);
  });

  it('spans all three slabs including unlimited last slab (250 units)', () => {
    // 100 × 3 = 300 + 100 × 5 = 500 + 50 × 7 = 350 → 1150
    const result = calculateSlabProgressive(250, slabs);
    expect(result.total).toBe(1150);
    expect(result.breakdown).toHaveLength(3);
  });

  it('throws on negative units', () => {
    expect(() => calculateSlabProgressive(-1, slabs)).toThrow(/non-negative/);
  });

  it('throws on empty slabs array', () => {
    expect(() => calculateSlabProgressive(100, [])).toThrow(/non-empty/);
  });
});

// ---------------------------------------------------------------------------
// calculateSlabWhole
// ---------------------------------------------------------------------------
describe('calculateSlabWhole', () => {
  const slabs = [
    { upTo: 100,  ratePerUnit: 3.00 },
    { upTo: 200,  ratePerUnit: 5.00 },
    { upTo: null, ratePerUnit: 7.00 },
  ];

  it('bills zero units at zero cost', () => {
    expect(calculateSlabWhole(0, slabs).total).toBe(0);
  });

  it('bills 50 units at the first slab rate (50 × 3 = 150)', () => {
    expect(calculateSlabWhole(50, slabs).total).toBe(150);
  });

  it('bills 150 units at the second slab rate (150 × 5 = 750)', () => {
    expect(calculateSlabWhole(150, slabs).total).toBe(750);
  });

  it('bills 300 units at the unlimited last slab rate (300 × 7 = 2100)', () => {
    expect(calculateSlabWhole(300, slabs).total).toBe(2100);
  });

  it('uses last slab when exactly at its upTo value', () => {
    expect(calculateSlabWhole(200, slabs).total).toBe(1000); // 200 × 5
  });
});

// ---------------------------------------------------------------------------
// calculateFixedCharges
// ---------------------------------------------------------------------------
describe('calculateFixedCharges', () => {
  it('returns zero total for empty array', () => {
    expect(calculateFixedCharges([], 1).total).toBe(0);
  });

  it('applies monthly flat charge regardless of load', () => {
    const charges = [{ label: 'Fixed Charge', amount: 105, basis: 'monthly' }];
    expect(calculateFixedCharges(charges, 2).total).toBe(105);
  });

  it('applies per_kw charge multiplied by load', () => {
    const charges = [{ label: 'Demand Charge', amount: 50, basis: 'per_kw' }];
    expect(calculateFixedCharges(charges, 3).total).toBe(150);
  });

  it('sums multiple fixed charges', () => {
    const charges = [
      { label: 'Fixed', amount: 100, basis: 'monthly' },
      { label: 'Demand', amount: 40, basis: 'per_kw' },
    ];
    expect(calculateFixedCharges(charges, 2).total).toBe(180); // 100 + 80
  });
});

// ---------------------------------------------------------------------------
// calculateOtherCharges
// ---------------------------------------------------------------------------
describe('calculateOtherCharges', () => {
  it('returns zero for empty array', () => {
    expect(calculateOtherCharges([], 1000).total).toBe(0);
  });

  it('calculates percent_of_energy correctly', () => {
    const charges = [{ label: 'Wheeling', amount: 10, basis: 'percent_of_energy' }];
    expect(calculateOtherCharges(charges, 500).total).toBe(50);
  });

  it('calculates fixed other charge', () => {
    const charges = [{ label: 'Meter Rent', amount: 25, basis: 'fixed' }];
    expect(calculateOtherCharges(charges, 999).total).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// calculateTaxes
// ---------------------------------------------------------------------------
describe('calculateTaxes', () => {
  it('returns zero for empty array', () => {
    expect(calculateTaxes([], 1000).total).toBe(0);
  });

  it('calculates 5% electricity duty correctly', () => {
    const taxes = [{ label: 'Electricity Duty', percent: 5 }];
    const result = calculateTaxes(taxes, 1000);
    expect(result.total).toBe(50);
    expect(result.breakdown[0].amount).toBe(50);
  });

  it('sums multiple taxes', () => {
    const taxes = [
      { label: 'Duty', percent: 5 },
      { label: 'Surcharge', percent: 2 },
    ];
    expect(calculateTaxes(taxes, 1000).total).toBe(70);
  });
});

// ---------------------------------------------------------------------------
// calculateSubsidy
// ---------------------------------------------------------------------------
describe('calculateSubsidy', () => {
  it('returns zero when no rules', () => {
    expect(calculateSubsidy([], 100, 500).total).toBe(0);
  });

  it('applies freeUnits subsidy correctly', () => {
    // 50 free units out of 100 total = 50% of ₹500 energy charge = ₹250
    const rules = [{ label: 'BPL subsidy', freeUnits: 50 }];
    expect(calculateSubsidy(rules, 100, 500).total).toBe(250);
  });

  it('caps freeUnits at actual consumption', () => {
    // 200 free units but only 100 consumed = 100% subsidy = full ₹500
    const rules = [{ label: 'Free units', freeUnits: 200 }];
    expect(calculateSubsidy(rules, 100, 500).total).toBe(500);
  });

  it('applies discountPercent correctly', () => {
    const rules = [{ label: '10% discount', discountPercent: 10 }];
    expect(calculateSubsidy(rules, 100, 500).total).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// calculateFullBill — using the two demo tariffs
// ---------------------------------------------------------------------------
describe('calculateFullBill with DEMO_TARIFFS[0] (FY 2023-24, progressive)', () => {
  const tariff = DEMO_TARIFFS[0];

  it('produces a result object with all expected fields', () => {
    const result = calculateFullBill(tariff, 100, 1);
    expect(result).toHaveProperty('tariffName');
    expect(result).toHaveProperty('energyCharge');
    expect(result).toHaveProperty('fixedChargesTotal');
    expect(result).toHaveProperty('taxesTotal');
    expect(result).toHaveProperty('totalPayable');
    expect(result).toHaveProperty('disclaimer');
  });

  it('calculates a 100-unit bill correctly', () => {
    // Energy: 100 × 3.35 = 335
    // Fixed:  105
    // Subtotal for tax: 335 + 105 = 440
    // Tax 5%: 22
    // Total: 440 + 22 = 462
    const result = calculateFullBill(tariff, 100, 1);
    expect(result.energyCharge).toBe(335);
    expect(result.fixedChargesTotal).toBe(105);
    expect(result.taxesTotal).toBe(roundMoney(440 * 0.05));
    expect(result.totalPayable).toBe(roundMoney(440 + 440 * 0.05));
  });

  it('calculates a 200-unit bill crossing multiple slabs', () => {
    // Energy: 100×3.35 + 50×4.20 + 50×5.50 = 335 + 210 + 275 = 820
    // Fixed: 105
    // Subtotal: 925, Tax 5%: 46.25, Total: 971.25
    const result = calculateFullBill(tariff, 200, 1);
    expect(result.energyCharge).toBe(820);
    expect(result.totalPayable).toBe(roundMoney(925 * 1.05));
  });

  it('zero consumption returns only fixed charge + tax', () => {
    const result = calculateFullBill(tariff, 0, 1);
    expect(result.energyCharge).toBe(0);
    // Fixed: 105, Tax 5% on 105 = 5.25, Total: 110.25
    expect(result.totalPayable).toBe(roundMoney(105 * 1.05));
  });

  it('marks result as demo status', () => {
    const result = calculateFullBill(tariff, 100, 1);
    expect(result.dataStatus).toBe('demo');
  });

  it('throws on negative units', () => {
    expect(() => calculateFullBill(tariff, -1, 1)).toThrow(/non-negative/);
  });

  it('throws when tariff is null', () => {
    expect(() => calculateFullBill(null, 100, 1)).toThrow(/tariff is required/);
  });
});

describe('calculateFullBill comparison — FY23 vs FY24', () => {
  it('FY 2024-25 tariff produces higher bill than FY 2023-24 at 150 units', () => {
    const bill23 = calculateFullBill(DEMO_TARIFFS[0], 150, 1).totalPayable;
    const bill24 = calculateFullBill(DEMO_TARIFFS[1], 150, 1).totalPayable;
    expect(bill24).toBeGreaterThan(bill23);
  });
});
