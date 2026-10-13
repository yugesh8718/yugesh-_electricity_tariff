/**
 * tariffEngine.js
 *
 * Core electricity tariff calculation engine.
 * All functions are pure and independently testable.
 * No React imports — this file has zero UI dependencies.
 *
 * Supported calculation methods:
 *   - progressive  : each slab applies only to units within that band
 *   - whole        : entire consumption billed at the rate of the applicable slab
 */

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Round a monetary value to 2 decimal places using standard rounding.
 * Avoids the floating-point drift that accumulates with plain arithmetic.
 */
export function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Energy charge calculators
// ---------------------------------------------------------------------------

/**
 * calculateSlabProgressive
 *
 * Each slab rate applies only to the units consumed within that band.
 *
 * @param {number} units - Total kWh consumed (must be >= 0)
 * @param {Array<{upTo: number|null, ratePerUnit: number}>} slabs
 *   upTo null means "unlimited" (last slab). Slabs must be ordered ascending.
 * @returns {{ total: number, breakdown: Array<{label, units, rate, amount}> }}
 */
export function calculateSlabProgressive(units, slabs) {
  if (!Number.isFinite(units) || units < 0) {
    throw new Error('units must be a finite non-negative number.');
  }
  if (!Array.isArray(slabs) || slabs.length === 0) {
    throw new Error('slabs must be a non-empty array.');
  }

  let remaining = units;
  let prevLimit = 0;
  const breakdown = [];

  for (const slab of slabs) {
    if (remaining <= 0) break;

    const limit = slab.upTo === null ? Infinity : slab.upTo;
    const bandWidth = limit - prevLimit;
    const unitsInBand = Math.min(remaining, bandWidth);
    const amount = roundMoney(unitsInBand * slab.ratePerUnit);

    const label =
      slab.upTo === null
        ? `Above ${prevLimit} units`
        : prevLimit === 0
        ? `First ${slab.upTo} units`
        : `${prevLimit + 1}–${slab.upTo} units`;

    breakdown.push({ label, units: unitsInBand, rate: slab.ratePerUnit, amount });

    remaining -= unitsInBand;
    prevLimit = limit;
  }

  const total = roundMoney(breakdown.reduce((sum, row) => sum + row.amount, 0));
  return { total, breakdown };
}

/**
 * calculateSlabWhole
 *
 * The entire consumption is billed at the rate of the slab the total falls into.
 *
 * @param {number} units
 * @param {Array<{upTo: number|null, ratePerUnit: number}>} slabs
 * @returns {{ total: number, breakdown: Array<{label, units, rate, amount}> }}
 */
export function calculateSlabWhole(units, slabs) {
  if (!Number.isFinite(units) || units < 0) {
    throw new Error('units must be a finite non-negative number.');
  }
  if (!Array.isArray(slabs) || slabs.length === 0) {
    throw new Error('slabs must be a non-empty array.');
  }

  // Find the applicable slab
  const applicableSlab = slabs.find(
    (slab) => slab.upTo === null || units <= slab.upTo
  ) || slabs[slabs.length - 1];

  const amount = roundMoney(units * applicableSlab.ratePerUnit);
  const label = applicableSlab.upTo === null
    ? `All ${units} units at above-slab rate`
    : `All ${units} units (within ${applicableSlab.upTo}-unit slab)`;

  return {
    total: amount,
    breakdown: [{ label, units, rate: applicableSlab.ratePerUnit, amount }],
  };
}

// ---------------------------------------------------------------------------
// Fixed charges
// ---------------------------------------------------------------------------

/**
 * calculateFixedCharges
 *
 * @param {Array<{label: string, amount: number, basis: 'monthly'|'per_kw'|'per_kva'}>} chargesArray
 * @param {number} loadKW - Consumer's sanctioned load in kW
 * @returns {{ total: number, breakdown: Array<{label, amount}> }}
 */
export function calculateFixedCharges(chargesArray, loadKW) {
  if (!Array.isArray(chargesArray)) return { total: 0, breakdown: [] };

  const breakdown = chargesArray.map((charge) => {
    let amount = 0;
    if (charge.basis === 'per_kw' || charge.basis === 'per_kva') {
      amount = roundMoney(charge.amount * (loadKW || 0));
    } else {
      // 'monthly' or any other basis — flat amount
      amount = roundMoney(charge.amount);
    }
    return { label: charge.label, amount };
  });

  const total = roundMoney(breakdown.reduce((sum, row) => sum + row.amount, 0));
  return { total, breakdown };
}

// ---------------------------------------------------------------------------
// Other charges (wheeling, meter rent, FAC, etc.)
// ---------------------------------------------------------------------------

/**
 * calculateOtherCharges
 *
 * @param {Array<{label: string, amount: number, basis: 'percent_of_energy'|'fixed'}>} otherChargesArray
 * @param {number} energyCharge - Calculated energy charge (used for percent_of_energy)
 * @returns {{ total: number, breakdown: Array<{label, amount}> }}
 */
export function calculateOtherCharges(otherChargesArray, energyCharge) {
  if (!Array.isArray(otherChargesArray)) return { total: 0, breakdown: [] };

  const breakdown = otherChargesArray.map((charge) => {
    let amount = 0;
    if (charge.basis === 'percent_of_energy') {
      amount = roundMoney((charge.amount / 100) * energyCharge);
    } else {
      amount = roundMoney(charge.amount);
    }
    return { label: charge.label, amount };
  });

  const total = roundMoney(breakdown.reduce((sum, row) => sum + row.amount, 0));
  return { total, breakdown };
}

// ---------------------------------------------------------------------------
// Taxes and duties
// ---------------------------------------------------------------------------

/**
 * calculateTaxes
 *
 * @param {Array<{label: string, percent: number}>} taxesArray
 * @param {number} subtotal - Amount to apply taxes to
 * @returns {{ total: number, breakdown: Array<{label, percent, amount}> }}
 */
export function calculateTaxes(taxesArray, subtotal) {
  if (!Array.isArray(taxesArray)) return { total: 0, breakdown: [] };

  const breakdown = taxesArray.map((tax) => {
    const amount = roundMoney((tax.percent / 100) * subtotal);
    return { label: tax.label, percent: tax.percent, amount };
  });

  const total = roundMoney(breakdown.reduce((sum, row) => sum + row.amount, 0));
  return { total, breakdown };
}

// ---------------------------------------------------------------------------
// Subsidies
// ---------------------------------------------------------------------------

/**
 * calculateSubsidy
 *
 * Supports two subsidy types:
 *   - freeUnits: first N units are free (deducted from energy charge proportionally)
 *   - discountPercent: percentage discount on energy charge
 *
 * @param {Array<{label: string, freeUnits?: number, discountPercent?: number}>} subsidyRules
 * @param {number} units - Total units consumed
 * @param {number} energyCharge - Calculated energy charge before subsidy
 * @returns {{ total: number, breakdown: Array<{label, amount}> }}
 */
export function calculateSubsidy(subsidyRules, units, energyCharge) {
  if (!Array.isArray(subsidyRules) || subsidyRules.length === 0) {
    return { total: 0, breakdown: [] };
  }

  const breakdown = subsidyRules.map((rule) => {
    let amount = 0;
    if (rule.freeUnits && units > 0 && energyCharge > 0) {
      // Subsidy = (min(actual units, freeUnits) / actual units) * energyCharge
      const coveredUnits = Math.min(units, rule.freeUnits);
      amount = roundMoney((coveredUnits / units) * energyCharge);
    } else if (rule.discountPercent) {
      amount = roundMoney((rule.discountPercent / 100) * energyCharge);
    }
    return { label: rule.label, amount };
  });

  const total = roundMoney(breakdown.reduce((sum, row) => sum + row.amount, 0));
  return { total, breakdown };
}

// ---------------------------------------------------------------------------
// Full bill orchestrator
// ---------------------------------------------------------------------------

/**
 * calculateFullBill
 *
 * Orchestrates all charge components in the correct order:
 *   1. Energy charges (slab-based)
 *   2. Fixed charges
 *   3. Other charges
 *   4. Taxes (on energy + fixed + other)
 *   5. Subsidy (deducted from energy charge)
 *   6. Final payable = (energy + fixed + other + taxes) - subsidy
 *
 * @param {object} tariff - Tariff document from Firestore or seedData
 * @param {number} units - Monthly consumption in kWh
 * @param {number} loadKW - Consumer's sanctioned load in kW
 * @returns {object} Full breakdown result object
 */
export function calculateFullBill(tariff, units, loadKW) {
  if (!tariff) throw new Error('tariff is required.');
  if (!Number.isFinite(units) || units < 0) {
    throw new Error('units must be a finite non-negative number.');
  }
  if (loadKW !== undefined && (!Number.isFinite(loadKW) || loadKW < 0)) {
    throw new Error('loadKW must be a finite non-negative number.');
  }

  // 1. Energy charges
  const method = tariff.calculationMethod === 'progressive' ? 'progressive' : 'whole';
  const slabResult =
    method === 'progressive'
      ? calculateSlabProgressive(units, tariff.slabs || [])
      : calculateSlabWhole(units, tariff.slabs || []);

  const energyCharge = slabResult.total;

  // 2. Fixed charges
  const fixedResult = calculateFixedCharges(tariff.fixedCharges || [], loadKW || 0);

  // 3. Other charges (based on energy charge)
  const otherResult = calculateOtherCharges(tariff.otherCharges || [], energyCharge);

  // 4. Taxes (on energy + fixed + other)
  const subtotalForTax = roundMoney(energyCharge + fixedResult.total + otherResult.total);
  const taxResult = calculateTaxes(tariff.taxes || [], subtotalForTax);

  // 5. Subsidy
  const subsidyResult = calculateSubsidy(tariff.subsidies || [], units, energyCharge);

  // 6. Totals
  const totalBeforeSubsidy = roundMoney(subtotalForTax + taxResult.total);
  const totalPayable = roundMoney(totalBeforeSubsidy - subsidyResult.total);

  return {
    tariffName: tariff.name || '',
    units,
    loadKW: loadKW || 0,
    calculationMethod: method,
    slabBreakdown: slabResult.breakdown,
    energyCharge,
    fixedChargesBreakdown: fixedResult.breakdown,
    fixedChargesTotal: fixedResult.total,
    otherChargesBreakdown: otherResult.breakdown,
    otherChargesTotal: otherResult.total,
    taxesBreakdown: taxResult.breakdown,
    taxesTotal: taxResult.total,
    subsidyBreakdown: subsidyResult.breakdown,
    subsidyAmount: subsidyResult.total,
    totalBeforeSubsidy,
    totalPayable,
    effectiveDate: tariff.effectiveFrom || '',
    effectiveTo: tariff.effectiveTo || '',
    sourceTitle: tariff.sourceTitle || '',
    sourceUrl: tariff.sourceUrl || '',
    dataStatus: tariff.status || 'demo',
    notes: tariff.notes || '',
    disclaimer:
      'This is an estimate only. Your actual electricity bill may differ based on meter readings, applicable surcharges, arrears, and revisions not reflected in this calculation.',
  };
}
