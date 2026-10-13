/**
 * statewise.test.ts
 *
 * Tests for the state-wise electricity board catalogue (indiaBoards.ts).
 * All imports come from indiaBoards.ts only — no tariffCatalogue.js,
 * discoms.js, or indiaRegions.js imports here (tested separately in
 * catalogue.test.js).
 */
import { describe, it, expect } from 'vitest';
import {
  INDIA_BOARDS,
  getBoardsByState,
  getCategoriesByBoard,
} from '../src/data/indiaBoards';

// ---------------------------------------------------------------------------
// Helper — pure consumption pattern validator (no React dependency)
// ---------------------------------------------------------------------------

interface PatternValidation {
  valid: boolean;
  sum: number;
  offPeakHigh: boolean;
  peakHigh: boolean;
  normalHigh: boolean;
}

function validateConsumptionPattern(
  offPeakPct: number,
  normalPct: number,
  peakPct: number,
): PatternValidation {
  const sum = offPeakPct + normalPct + peakPct;
  return {
    valid: Math.abs(sum - 100) <= 0.01,
    sum,
    offPeakHigh: offPeakPct >= 90,
    peakHigh: peakPct >= 50,
    normalHigh: normalPct >= 70,
  };
}

// ---------------------------------------------------------------------------
// Helper — kWh derived from total + percentage
// ---------------------------------------------------------------------------

function calcKwh(total: number, pct: number): number {
  return total * (pct / 100);
}

// ---------------------------------------------------------------------------
// INDIA_BOARDS structure tests
// ---------------------------------------------------------------------------

describe('INDIA_BOARDS', () => {
  it('contains exactly 36 entries (all 28 states + 8 UTs)', () => {
    expect(INDIA_BOARDS).toHaveLength(36);
  });

  it('every entry has at least one board', () => {
    for (const entry of INDIA_BOARDS) {
      expect(entry.boards.length, `stateId ${entry.stateId} has no boards`).toBeGreaterThanOrEqual(1);
    }
  });

  it('every board has at least one consumer category', () => {
    for (const entry of INDIA_BOARDS) {
      for (const board of entry.boards) {
        expect(
          board.categories.length,
          `board ${board.boardId} in state ${entry.stateId} has no categories`,
        ).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('every category has at least one tariff schedule', () => {
    for (const entry of INDIA_BOARDS) {
      for (const board of entry.boards) {
        for (const cat of board.categories) {
          expect(
            cat.schedules.length,
            `category ${cat.categoryId} has no schedules`,
          ).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it('all schedules have verificationStatus === "demo"', () => {
    for (const entry of INDIA_BOARDS) {
      for (const board of entry.boards) {
        for (const cat of board.categories) {
          for (const sched of cat.schedules) {
            expect(sched.verificationStatus).toBe('demo');
          }
        }
      }
    }
  });

  it('no duplicate stateIds', () => {
    const ids = INDIA_BOARDS.map((e) => e.stateId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// getBoardsByState tests
// ---------------------------------------------------------------------------

describe('getBoardsByState', () => {
  it('returns boards for Tamil Nadu ("tn") including TANGEDCO', () => {
    const boards = getBoardsByState('tn');
    expect(boards.length).toBeGreaterThanOrEqual(1);
    const boardIds = boards.map((b) => b.boardId);
    // At least one board should be tangedco
    expect(boardIds.some((id) => id.includes('tangedco'))).toBe(true);
  });

  it('returns at least 4 boards for Karnataka ("ka")', () => {
    const boards = getBoardsByState('ka');
    expect(boards.length).toBeGreaterThanOrEqual(4);
  });

  it('returns boards for Maharashtra ("mh")', () => {
    const boards = getBoardsByState('mh');
    expect(boards.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty array for unknown state', () => {
    expect(getBoardsByState('xx')).toHaveLength(0);
  });

  it('different states return different board lists', () => {
    const tn = getBoardsByState('tn').map((b) => b.boardId);
    const ka = getBoardsByState('ka').map((b) => b.boardId);
    expect(tn.some((id) => ka.includes(id))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCategoriesByBoard tests
// ---------------------------------------------------------------------------

describe('getCategoriesByBoard', () => {
  it('returns categories for TANGEDCO', () => {
    const cats = getCategoriesByBoard('tn', 'tangedco');
    expect(cats.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty for unknown board', () => {
    expect(getCategoriesByBoard('tn', 'unknown-board')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// validateConsumptionPattern — pure logic tests
// ---------------------------------------------------------------------------

describe('validateConsumptionPattern', () => {
  it('accepts percentages that total exactly 100', () => {
    const result = validateConsumptionPattern(10, 40, 50);
    expect(result.valid).toBe(true);
    expect(result.sum).toBeCloseTo(100, 5);
  });

  it('rejects percentages that do not total 100', () => {
    const result = validateConsumptionPattern(10, 40, 45);
    expect(result.valid).toBe(false);
    expect(result.sum).toBeCloseTo(95, 5);
  });

  it('off-peak ≥ 90% triggers offPeakHigh', () => {
    expect(validateConsumptionPattern(90, 5, 5).offPeakHigh).toBe(true);
    expect(validateConsumptionPattern(89, 5, 6).offPeakHigh).toBe(false);
  });

  it('peak ≥ 50% triggers peakHigh', () => {
    expect(validateConsumptionPattern(10, 40, 50).peakHigh).toBe(true);
    expect(validateConsumptionPattern(10, 41, 49).peakHigh).toBe(false);
  });

  it('normal ≥ 70% triggers normalHigh', () => {
    expect(validateConsumptionPattern(10, 70, 20).normalHigh).toBe(true);
    expect(validateConsumptionPattern(10, 69, 21).normalHigh).toBe(false);
  });

  it('accepts floating-point sum within tolerance', () => {
    // 33.3 + 33.3 + 33.4 = 100
    const result = validateConsumptionPattern(33.3, 33.3, 33.4);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// kWh calculation tests
// ---------------------------------------------------------------------------

describe('kWh calculation', () => {
  it('peak 50% of 200 kWh = 100 kWh', () => {
    expect(calcKwh(200, 50)).toBe(100);
  });

  it('off-peak 10% of 200 kWh = 20 kWh', () => {
    expect(calcKwh(200, 10)).toBe(20);
  });

  it('normal 40% of 200 kWh = 80 kWh', () => {
    expect(calcKwh(200, 40)).toBe(80);
  });

  it('off-peak + normal + peak sums to total consumption', () => {
    const total = 350;
    const off = calcKwh(total, 20);
    const normal = calcKwh(total, 45);
    const peak = calcKwh(total, 35);
    expect(off + normal + peak).toBeCloseTo(total, 5);
  });
});
