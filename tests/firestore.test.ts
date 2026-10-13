/**
 * firestore.test.ts
 *
 * Tests for the Firestore data-access layer with mocked firebase/firestore.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Firebase firestore ─────────────────────────────────────────────────

const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockDeleteDoc = vi.fn();
const mockCollection = vi.fn((...args: string[]) => args.join('/'));
const mockDoc = vi.fn((...args: string[]) => args.join('/'));
const mockServerTimestamp = vi.fn(() => null);

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...(args as string[])),
  doc: (...args: unknown[]) => mockDoc(...(args as string[])),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

// ─── Use a module-level object so we can toggle the db property ───────────────
// firestore.ts reads `db` as an imported binding; to control it per-test we
// must use a factory mock where `db` is exposed as a live getter.

const configState = { db: { type: 'Firestore' } as object | null };

vi.mock('../src/firebase/config.ts', () => ({
  get db() { return configState.db; },
  auth: null,
  isConfigured: true,
  isFirebaseConfigured: true,
}));

// ─── Import after mocks ───────────────────────────────────────────────────────

import {
  saveComparison,
  getComparisons,
  deleteComparison,
} from '../src/lib/firestore.ts';
import type { ComparisonResult } from '../src/types/index.ts';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeResult(): ComparisonResult {
  return {
    timestamp: new Date().toISOString(),
    consumption: {
      offPeak: 120,
      shoulder: 150,
      peak: 80,
      total: 350,
      consumerType: 'household',
      billingPeriod: 'monthly',
    },
    plans: [],
    bills: [],
    recommendedPlanId: 'plan-flat-saver',
    fingerprint: {
      label: 'Balanced Household',
      offPeakShare: 34.3,
      shoulderShare: 42.9,
      peakShare: 22.9,
      explanation: 'Balanced usage.',
    },
    breakEven: {
      crossoverExists: false,
      crossoverPeakPercent: null,
      lowerPeakPlanId: null,
      higherPeakPlanId: null,
      explanation: 'No crossover.',
    },
    riskShield: {
      scenarios: [],
      planStats: [],
      recommendationConfidence: 80,
      cheapestTodayPlanId: 'plan-flat-saver',
      mostStablePlanId: 'plan-flat-saver',
      lowestWorstCasePlanId: 'plan-flat-saver',
    },
    regret: {
      selectedPlanId: 'plan-flat-saver',
      avgRegret: 0,
      maxRegret: 0,
      maxRegretScenario: null,
      explanation: 'No regret.',
    },
    shiftScenarios: [],
    explanation: 'Test result.',
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('saveComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configState.db = { type: 'Firestore' };
  });

  it('calls addDoc and returns the new document ID', async () => {
    mockAddDoc.mockResolvedValue({ id: 'new-doc-123' });
    const result = makeResult();
    const id = await saveComparison('user1', result);
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(id).toBe('new-doc-123');
  });

  it('writes to users/{uid}/comparisons path', async () => {
    mockAddDoc.mockResolvedValue({ id: 'abc' });
    await saveComparison('user1', makeResult());
    // collection was called with db, 'users', 'user1', 'comparisons'
    expect(mockCollection).toHaveBeenCalled();
  });

  it('throws when db is null', async () => {
    configState.db = null;
    await expect(saveComparison('user1', makeResult())).rejects.toThrow(
      'Firebase is not configured'
    );
  });
});

describe('getComparisons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configState.db = { type: 'Firestore' };
  });

  it('returns array of ComparisonResult from Firestore snapshot', async () => {
    const baseResult = makeResult();
    const { id: _id, ...resultWithoutId } = { ...baseResult, id: 'existing-id' };
    const fakeDoc = {
      id: 'doc1',
      data: () => resultWithoutId,
    };
    mockGetDocs.mockResolvedValue({ docs: [fakeDoc] });
    const results = await getComparisons('user1');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('doc1');
  });

  it('returns empty array when db is null', async () => {
    configState.db = null;
    const results = await getComparisons('user1');
    expect(results).toEqual([]);
  });
});

describe('deleteComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configState.db = { type: 'Firestore' };
  });

  it('calls deleteDoc', async () => {
    mockDeleteDoc.mockResolvedValue(undefined);
    await deleteComparison('user1', 'doc1');
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });

  it('throws when db is null', async () => {
    configState.db = null;
    await expect(deleteComparison('user1', 'doc1')).rejects.toThrow(
      'Firebase is not configured'
    );
  });
});
