/**
 * catalogue.test.js
 *
 * Tests for the India regions list, DISCOM catalogue, and tariff catalogue.
 * No Firebase — all pure data module tests.
 */
import { describe, it, expect } from 'vitest';
import { INDIA_REGIONS, STATES, UNION_TERRITORIES, getRegionById } from '../src/data/indiaRegions.js';
import { DISCOMS, getDiscomsByRegion, getDiscomById } from '../src/data/discoms.js';
import {
  CATEGORIES,
  TARIFF_SCHEDULES,
  getCategoriesForDiscom,
  getSchedulesForCategory,
  isScheduleCalculable,
} from '../src/data/tariffCatalogue.js';

// ── India regions ─────────────────────────────────────────────────────────────

describe('INDIA_REGIONS', () => {
  it('contains exactly 36 entries (28 states + 8 union territories)', () => {
    expect(INDIA_REGIONS).toHaveLength(36);
  });

  it('contains exactly 28 states', () => {
    expect(STATES).toHaveLength(28);
  });

  it('contains exactly 8 union territories', () => {
    expect(UNION_TERRITORIES).toHaveLength(8);
  });

  it('includes all required states', () => {
    const names = INDIA_REGIONS.map((r) => r.name);
    const required = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
      'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
      'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
      'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
      'West Bengal',
    ];
    for (const name of required) {
      expect(names).toContain(name);
    }
  });

  it('includes all required union territories', () => {
    const names = INDIA_REGIONS.map((r) => r.name);
    const required = [
      'Andaman and Nicobar Islands',
      'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi',
      'Jammu and Kashmir',
      'Ladakh',
      'Lakshadweep',
      'Puducherry',
    ];
    for (const name of required) {
      expect(names).toContain(name);
    }
  });

  it('every region has a stable non-empty id', () => {
    for (const r of INDIA_REGIONS) {
      expect(r.id).toBeTruthy();
      expect(typeof r.id).toBe('string');
    }
  });

  it('no duplicate region ids', () => {
    const ids = INDIA_REGIONS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getRegionById returns correct region', () => {
    expect(getRegionById('up')?.name).toBe('Uttar Pradesh');
    expect(getRegionById('dl')?.name).toBe('Delhi');
    expect(getRegionById('ka')?.name).toBe('Karnataka');
  });

  it('getRegionById returns null for unknown id', () => {
    expect(getRegionById('xx')).toBeNull();
  });

  it('every region has type state or union-territory', () => {
    for (const r of INDIA_REGIONS) {
      expect(['state', 'union-territory']).toContain(r.type);
    }
  });
});

// ── DISCOM catalogue ──────────────────────────────────────────────────────────

describe('DISCOMS', () => {
  it('no duplicate DISCOM ids', () => {
    const ids = DISCOMS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every DISCOM references a valid regionId', () => {
    const regionIds = new Set(INDIA_REGIONS.map((r) => r.id));
    for (const d of DISCOMS) {
      expect(regionIds.has(d.regionId),
        `DISCOM ${d.id} has unknown regionId "${d.regionId}"`
      ).toBe(true);
    }
  });

  it('getDiscomsByRegion returns only DISCOMs for that region', () => {
    const upDiscoms = getDiscomsByRegion('up');
    expect(upDiscoms.length).toBeGreaterThan(0);
    for (const d of upDiscoms) {
      expect(d.regionId).toBe('up');
    }
  });

  it('getDiscomsByRegion for UP includes DVVNL and PVVNL', () => {
    const ids = getDiscomsByRegion('up').map((d) => d.id);
    expect(ids).toContain('dvvnl');
    expect(ids).toContain('pvvnl');
  });

  it('getDiscomsByRegion for Delhi includes BRPL, BYPL, TPDDL', () => {
    const ids = getDiscomsByRegion('dl').map((d) => d.id);
    expect(ids).toContain('bses-rajdhani');
    expect(ids).toContain('bses-yamuna');
    expect(ids).toContain('tpddl');
  });

  it('getDiscomsByRegion returns empty array for region with no DISCOMs configured', () => {
    // Mizoram has needsVerification DISCOM — should still be returned
    const mz = getDiscomsByRegion('mz');
    expect(Array.isArray(mz)).toBe(true);
  });

  it('getDiscomsByRegion returns empty array for non-existent region', () => {
    expect(getDiscomsByRegion('xx')).toHaveLength(0);
  });

  it('getDiscomById returns correct DISCOM', () => {
    expect(getDiscomById('dvvnl')?.shortName).toBe('DVVNL');
    expect(getDiscomById('bescom')?.shortName).toBe('BESCOM');
  });

  it('getDiscomById returns null for unknown id', () => {
    expect(getDiscomById('unknown-discom')).toBeNull();
  });

  it('changing state (simulated) — DISCOM list changes', () => {
    const upDiscoms = getDiscomsByRegion('up');
    const kaDiscoms = getDiscomsByRegion('ka');
    const upIds = upDiscoms.map((d) => d.id);
    const kaIds = kaDiscoms.map((d) => d.id);
    // No overlap expected between UP and Karnataka DISCOMs
    expect(upIds.some((id) => kaIds.includes(id))).toBe(false);
  });
});

// ── Tariff catalogue ──────────────────────────────────────────────────────────

describe('CATEGORIES', () => {
  it('no duplicate category ids', () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getCategoriesForDiscom returns only categories for that DISCOM', () => {
    const cats = getCategoriesForDiscom('dvvnl');
    expect(cats.length).toBeGreaterThan(0);
    for (const c of cats) {
      expect(c.discomId).toBe('dvvnl');
    }
  });

  it('getCategoriesForDiscom returns empty for unknown DISCOM', () => {
    expect(getCategoriesForDiscom('unknown')).toHaveLength(0);
  });

  it('changing DISCOM (simulated) — categories change', () => {
    const dvvnl = getCategoriesForDiscom('dvvnl').map((c) => c.id);
    const bescom = getCategoriesForDiscom('bescom').map((c) => c.id);
    expect(dvvnl.some((id) => bescom.includes(id))).toBe(false);
  });
});

describe('TARIFF_SCHEDULES', () => {
  it('no duplicate schedule ids', () => {
    const ids = TARIFF_SCHEDULES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every schedule references a known categoryId', () => {
    const catIds = new Set(CATEGORIES.map((c) => c.id));
    for (const s of TARIFF_SCHEDULES) {
      expect(catIds.has(s.categoryId),
        `Schedule ${s.id} references unknown categoryId "${s.categoryId}"`
      ).toBe(true);
    }
  });

  it('getSchedulesForCategory returns only schedules for that category', () => {
    const schedules = getSchedulesForCategory('dvvnl-domestic');
    expect(schedules.length).toBeGreaterThan(0);
    for (const s of schedules) {
      expect(s.categoryId).toBe('dvvnl-domestic');
    }
  });

  it('changing category (simulated) — schedule list changes', () => {
    const domestic = getSchedulesForCategory('dvvnl-domestic').map((s) => s.id);
    const commercial = getSchedulesForCategory('dvvnl-commercial').map((s) => s.id);
    expect(domestic.some((id) => commercial.includes(id))).toBe(false);
  });

  it('changing category clears schedule (no cross-contamination)', () => {
    // A schedule for DVVNL domestic must NOT appear in BESCOM domestic
    const dvvnlSchedules = getSchedulesForCategory('dvvnl-domestic').map((s) => s.id);
    const bescomSchedules = getSchedulesForCategory('bescom-domestic').map((s) => s.id);
    expect(dvvnlSchedules.some((id) => bescomSchedules.includes(id))).toBe(false);
  });

  it('unverified schedules are not calculable', () => {
    const unverified = TARIFF_SCHEDULES.filter((s) => s.dataStatus === 'needs-verification');
    expect(unverified.length).toBeGreaterThan(0);
    for (const s of unverified) {
      expect(isScheduleCalculable(s)).toBe(false);
    }
  });

  it('verified schedules with slabs are calculable', () => {
    const verified = TARIFF_SCHEDULES.filter(
      (s) => s.dataStatus === 'verified' && Array.isArray(s.slabs) && s.slabs.length > 0
    );
    for (const s of verified) {
      expect(isScheduleCalculable(s)).toBe(true);
    }
  });

  it('demo schedules with slabs ARE calculable', () => {
    const demoSchedules = TARIFF_SCHEDULES.filter(
      (s) => s.dataStatus === 'demo' && Array.isArray(s.slabs) && s.slabs.length > 0
    );
    expect(demoSchedules.length).toBeGreaterThan(0);
    for (const s of demoSchedules) {
      expect(isScheduleCalculable(s)).toBe(true);
    }
  });

  it('TANGEDCO demo schedule exists and is calculable', () => {
    const demo = TARIFF_SCHEDULES.find((s) => s.id === 'tangedco-lti-demo');
    expect(demo).toBeDefined();
    expect(demo.dataStatus).toBe('demo');
    expect(isScheduleCalculable(demo)).toBe(true);
    expect(Array.isArray(demo.slabs) && demo.slabs.length > 0).toBe(true);
  });

  it('TANGEDCO official schedule exists and is NOT calculable (needs verification)', () => {
    const official = TARIFF_SCHEDULES.find((s) => s.id === 'tangedco-lti-fy2425');
    expect(official).toBeDefined();
    expect(official.dataStatus).toBe('needs-verification');
    expect(isScheduleCalculable(official)).toBe(false);
  });

  it('DVVNL demo schedule exists and is calculable', () => {
    const demo = TARIFF_SCHEDULES.find((s) => s.id === 'dvvnl-lmv1-demo');
    expect(demo).toBeDefined();
    expect(demo.dataStatus).toBe('demo');
    expect(isScheduleCalculable(demo)).toBe(true);
  });

  it('every schedule has a dataStatus of verified, demo, needs-verification, or not-configured', () => {
    const valid = new Set(['verified', 'demo', 'needs-verification', 'not-configured']);
    for (const s of TARIFF_SCHEDULES) {
      expect(valid.has(s.dataStatus),
        `Schedule ${s.id} has invalid dataStatus "${s.dataStatus}"`
      ).toBe(true);
    }
  });

  it('every schedule has an officialSourceUrl field (may be empty string)', () => {
    for (const s of TARIFF_SCHEDULES) {
      expect('officialSourceUrl' in s).toBe(true);
    }
  });
});

// ── Demo-mode calculation ─────────────────────────────────────────────────────

import { calculateFullBill } from '../src/lib/tariffEngine.js';

describe('Demo-mode bill calculation', () => {
  const tangedcoDemo = TARIFF_SCHEDULES.find((s) => s.id === 'tangedco-lti-demo');
  const dvvnlDemo    = TARIFF_SCHEDULES.find((s) => s.id === 'dvvnl-lmv1-demo');

  // Helper: convert catalogue slab format { from, to } → engine format { upTo }
  function scheduleToEngine(schedule) {
    return {
      name:              schedule.displayName,
      calculationMethod: 'progressive',
      slabs:             (schedule.slabs || []).map((s) => ({
        upTo:        s.to,
        ratePerUnit: s.ratePerUnit,
      })),
      fixedCharges: schedule.fixedCharges || [],
      otherCharges: [],
      taxes:        schedule.dutyPercent
        ? [{ label: 'Electricity Duty', percent: schedule.dutyPercent }]
        : [],
      subsidies:    [],
      effectiveFrom: schedule.effectiveFrom || '',
      status:        schedule.dataStatus,
      sourceTitle:   schedule.displayName,
      sourceUrl:     schedule.officialSourceUrl || '',
      notes:         schedule.notes || '',
    };
  }

  describe('TANGEDCO Demo LT-I', () => {
    it('exists and has slabs', () => {
      expect(tangedcoDemo).toBeDefined();
      expect(tangedcoDemo.slabs.length).toBeGreaterThan(0);
    });

    it('calculates zero consumption — only fixed charge + duty', () => {
      const tariff = scheduleToEngine(tangedcoDemo);
      const result = calculateFullBill(tariff, 0, 1);
      // First 100 units free → energy = 0; fixed = 30; duty 5% on 30 = 1.50; total = 31.50
      expect(result.energyCharge).toBe(0);
      expect(result.fixedChargesTotal).toBe(30);
      expect(result.totalPayable).toBeCloseTo(31.5, 1);
    });

    it('calculates 150 units (bimonthly) correctly', () => {
      const tariff = scheduleToEngine(tangedcoDemo);
      const result = calculateFullBill(tariff, 150, 1);
      // Slab 1: 0-100 @ 0.00 = 0
      // Slab 2: 100-200 → 50 units @ 1.50 = 75
      // Energy = 75; fixed = 30; subtotal = 105; duty 5% = 5.25; total = 110.25
      expect(result.energyCharge).toBe(75);
      expect(result.totalPayable).toBeCloseTo(110.25, 1);
    });

    it('calculates 600 units crossing all slabs', () => {
      const tariff = scheduleToEngine(tangedcoDemo);
      const result = calculateFullBill(tariff, 600, 1);
      // 0-100 @ 0 = 0; 100-200 @ 1.50 = 150; 200-500 @ 3.00 = 900; 500-600 @ 5.00 = 500
      // Energy = 1550; fixed = 30; subtotal = 1580; duty 5% = 79; total = 1659
      expect(result.energyCharge).toBe(1550);
      expect(result.fixedChargesTotal).toBe(30);
      expect(result.totalPayable).toBeCloseTo(1659, 0);
    });

    it('marks result as demo', () => {
      const tariff = scheduleToEngine(tangedcoDemo);
      const result = calculateFullBill(tariff, 100, 1);
      expect(result.dataStatus).toBe('demo');
    });

    it('throws on negative consumption', () => {
      const tariff = scheduleToEngine(tangedcoDemo);
      expect(() => calculateFullBill(tariff, -1, 1)).toThrow(/non-negative/);
    });

    it('handles decimal consumption without error', () => {
      const tariff = scheduleToEngine(tangedcoDemo);
      const result = calculateFullBill(tariff, 150.5, 1);
      expect(result.totalPayable).toBeGreaterThan(0);
    });
  });

  describe('DVVNL Demo LMV-1', () => {
    it('calculates 200 units correctly', () => {
      const tariff = scheduleToEngine(dvvnlDemo);
      const result = calculateFullBill(tariff, 200, 1);
      // 0-100 @ 3.35 = 335; 100-150 @ 4.20 = 210; 150-200 @ 5.50 = 275 → energy = 820
      // fixed = 105; subtotal = 925; duty 5% = 46.25; total = 971.25
      expect(result.energyCharge).toBe(820);
      expect(result.totalPayable).toBeCloseTo(971.25, 1);
    });
  });
});
