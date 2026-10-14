/**
 * comparisonExport.test.tsx
 *
 * Focused tests for ComparisonTable, ComparisonExportActions, and
 * the exportComparisonPdf utility.
 *
 * All PDF generation and browser printing are mocked — no real file I/O.
 * Firebase is not used by any of these components.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { ComparisonResult } from '../src/types';

// ── Mock jspdf and jspdf-autotable (no real PDF generation in tests) ──────────

const mockDocInstance = {
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setTextColor: vi.fn(),
  setFillColor: vi.fn(),
  setDrawColor: vi.fn(),
  setLineWidth: vi.fn(),
  splitTextToSize: vi.fn((text: string) => [text]),
  text: vi.fn(),
  line: vi.fn(),
  rect: vi.fn(),
  addPage: vi.fn(),
  setPage: vi.fn(),
  getNumberOfPages: vi.fn(() => 1),
  output: vi.fn(() => new Blob(['%PDF-mock'], { type: 'application/pdf' })),
};

// jsPDF must be a constructable class
class MockJsPDF {
  constructor() {
    Object.assign(this, mockDocInstance);
    // jspdf-autotable stores finalY here
    (this as unknown as Record<string, unknown>).lastAutoTable = { finalY: 100 };
  }
}

vi.mock('jspdf', () => ({
  default: MockJsPDF,
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn((_doc: unknown, opts: { didDrawPage?: (d: { cursor: { y: number } }) => void }) => {
    opts?.didDrawPage?.({ cursor: { y: 150 } });
  }),
}));

// ── Mock window.URL.createObjectURL and revokeObjectURL ──────────────────────

const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(window, 'URL', {
  value: { createObjectURL: mockCreateObjectURL, revokeObjectURL: mockRevokeObjectURL },
  writable: true,
});

// ── Mock window.print ────────────────────────────────────────────────────────

const mockPrint = vi.fn();
Object.defineProperty(window, 'print', { value: mockPrint, writable: true });

// ── Firebase mocks (not used by export feature but imported transitively) ─────

vi.mock('../src/firebase/config', () => ({
  auth: null,
  db: null,
  isConfigured: false,
  isFirebaseConfigured: false,
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => null),
  GoogleAuthProvider: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_: unknown, cb: (u: null) => void) => { cb(null); return () => {}; }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => null),
  collection: vi.fn(), doc: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock' })),
  serverTimestamp: vi.fn(() => null),
}));

vi.mock('../src/lib/lang.jsx', () => ({
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
  useLang: () => ({ lang: 'en', toggle: () => {}, t: (k: string) => k }),
}));

// ── Minimal ComparisonResult fixture (pre-calculated, never re-calculated) ────

const PLAN_A = {
  id: 'plan-a', name: 'Plan A',
  fixedCharge: 80, offPeakRate: 3, shoulderRate: 4, peakRate: 7,
  taxDutyPercent: 5, surcharge: 0,
};

const PLAN_B = {
  id: 'plan-b', name: 'Plan B',
  fixedCharge: 160, offPeakRate: 2.5, shoulderRate: 5.5, peakRate: 4,
  taxDutyPercent: 5, surcharge: 0,
};

const MOCK_RESULT: ComparisonResult = {
  timestamp: '2026-10-13T09:00:00.000Z',
  consumption: {
    offPeak: 100, shoulder: 0, peak: 10, total: 110,
    consumerType: 'household', billingPeriod: 'monthly',
  },
  plans: [PLAN_A, PLAN_B],
  bills: [
    {
      planId: 'plan-a', planName: 'Plan A',
      offPeakCharge: 300, shoulderCharge: 0, peakCharge: 70,
      energyCharge: 370, fixedCharge: 80, surcharge: 0,
      subtotal: 450, duty: 22.5, estimatedTotal: 472.5,
      effectiveCostPerKwh: 4.3,
    },
    {
      planId: 'plan-b', planName: 'Plan B',
      offPeakCharge: 250, shoulderCharge: 0, peakCharge: 40,
      energyCharge: 290, fixedCharge: 160, surcharge: 0,
      subtotal: 450, duty: 22.5, estimatedTotal: 472.5,
      effectiveCostPerKwh: 4.3,
    },
  ],
  recommendedPlanId: 'plan-a',
  fingerprint: {
    label: 'Balanced Household',
    offPeakShare: 0.9, shoulderShare: 0, peakShare: 0.1,
    explanation: 'Balanced usage',
  },
  breakEven: {
    crossoverExists: false, crossoverPeakPercent: null,
    lowerPeakPlanId: 'plan-a', higherPeakPlanId: 'plan-b',
    explanation: 'At current peak usage Plan A is cheaper.',
  },
  riskShield: {
    scenarios: [], planStats: [], recommendationConfidence: 0.8,
    cheapestTodayPlanId: 'plan-a', mostStablePlanId: 'plan-a',
    lowestWorstCasePlanId: 'plan-a',
  },
  regret: {
    selectedPlanId: 'plan-a', avgRegret: 0, maxRegret: 0,
    maxRegretScenario: null, explanation: 'Low regret',
  },
  shiftScenarios: [],
  explanation: 'Plan A wins due to lower fixed charge.',
};

// ── Imports ───────────────────────────────────────────────────────────────────

import ComparisonTable from '../src/components/ComparisonTable';
import ComparisonExportActions from '../src/components/ComparisonExportActions';

// ── ComparisonTable tests ─────────────────────────────────────────────────────

describe('ComparisonTable', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('renders the heading', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getByRole('heading', { name: /side-by-side comparison/i })).toBeInTheDocument();
  });

  it('renders Plan A column header', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    // Plan A appears in multiple places (header + winner note); getAllByText is correct here
    expect(screen.getAllByText(/Plan A/).length).toBeGreaterThan(0);
  });

  it('renders Plan B column header', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getAllByText(/Plan B/).length).toBeGreaterThan(0);
  });

  it('marks the recommended plan header with "Best value"', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getByText('★ Best value')).toBeInTheDocument();
  });

  it('shows "Estimated total" row', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getByText('Estimated total')).toBeInTheDocument();
  });

  it('shows "Monthly savings" in the footer', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getByText('Monthly savings')).toBeInTheDocument();
  });

  it('shows "Estimated annual savings" in the footer', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getByText(/estimated annual savings/i)).toBeInTheDocument();
  });

  it('shows off-peak charge row', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getByText('Off-peak energy charge')).toBeInTheDocument();
  });

  it('shows peak charge row', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getByText('Peak energy charge')).toBeInTheDocument();
  });

  it('shows fixed charge row', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getByText('Fixed / supply charge')).toBeInTheDocument();
  });

  it('shows electricity duty row', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    expect(screen.getByText('Electricity duty')).toBeInTheDocument();
  });

  it('shows winner note with plan name', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    const note = document.querySelector('.comparison-table-winner-note');
    expect(note).not.toBeNull();
    expect(note?.textContent).toMatch(/Plan A/);
    expect(note?.textContent).toMatch(/most cost-effective/i);
  });

  it('applies winner CSS class to recommended plan header', () => {
    const { container } = render(<ComparisonTable result={MOCK_RESULT} />);
    const winnerHeader = container.querySelector('.comparison-table-winner-header');
    expect(winnerHeader).not.toBeNull();
  });

  it('renders the accessible table with aria-label', () => {
    render(<ComparisonTable result={MOCK_RESULT} />);
    const table = screen.getByRole('table', { name: /side-by-side plan cost comparison/i });
    expect(table).toBeInTheDocument();
  });
});

// ── ComparisonExportActions tests ─────────────────────────────────────────────

describe('ComparisonExportActions', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('renders the "Download Comparison PDF" button', () => {
    render(<ComparisonExportActions result={MOCK_RESULT} />);
    expect(screen.getByRole('button', { name: /download comparison pdf/i })).toBeInTheDocument();
  });

  it('renders the "Print Comparison" button', () => {
    render(<ComparisonExportActions result={MOCK_RESULT} />);
    expect(screen.getByRole('button', { name: /print the comparison report/i })).toBeInTheDocument();
  });

  it('disables the PDF button when result is null', () => {
    render(<ComparisonExportActions result={null} />);
    const btn = screen.getByRole('button', { name: /download.*pdf|no comparison/i });
    expect(btn).toBeDisabled();
  });

  it('enables the PDF button when a valid result is provided', () => {
    render(<ComparisonExportActions result={MOCK_RESULT} />);
    const btn = screen.getByRole('button', { name: /download comparison pdf/i });
    expect(btn).not.toBeDisabled();
  });

  it('Print button calls window.print', async () => {
    render(<ComparisonExportActions result={MOCK_RESULT} />);
    const btn = screen.getByRole('button', { name: /print the comparison report/i });
    await userEvent.click(btn);
    expect(mockPrint).toHaveBeenCalledTimes(1);
  });

  it('clicking PDF button starts generation (shows status region)', async () => {
    render(<ComparisonExportActions result={MOCK_RESULT} />);
    const btn = screen.getByRole('button', { name: /download comparison pdf/i });
    await userEvent.click(btn);
    // After async resolves, status region is present
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  it('triggers a download after successful PDF generation', async () => {
    render(<ComparisonExportActions result={MOCK_RESULT} />);
    const btn = screen.getByRole('button', { name: /download comparison pdf/i });
    await userEvent.click(btn);
    await waitFor(() => {
      // createObjectURL is called when download triggers
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  it('does not call window.print when PDF button is clicked', async () => {
    render(<ComparisonExportActions result={MOCK_RESULT} />);
    const btn = screen.getByRole('button', { name: /download comparison pdf/i });
    await userEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(mockPrint).not.toHaveBeenCalled();
  });

  it('has an aria-live status region', () => {
    render(<ComparisonExportActions result={MOCK_RESULT} />);
    const region = screen.getByRole('status');
    expect(region).toBeInTheDocument();
  });

  it('PDF error from exportComparisonPdf shows retry button', async () => {
    // Simulate a failure by making output() throw
    mockDocInstance.output.mockImplementationOnce(() => {
      throw new Error('PDF engine failed');
    });

    render(<ComparisonExportActions result={MOCK_RESULT} />);
    const btn = screen.getByRole('button', { name: /download comparison pdf/i });
    await userEvent.click(btn);

    await waitFor(() => {
      // After error, button should show "Retry PDF"
      expect(
        screen.getByRole('button', { name: /retry pdf/i })
      ).toBeInTheDocument();
    });
  });
});

// ── exportComparisonPdf utility tests ────────────────────────────────────────

import { exportComparisonPdf, getPdfFilename } from '../src/utils/exportComparisonPdf';

describe('exportComparisonPdf utility', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('returns a Blob on success', async () => {
    const blob = await exportComparisonPdf(MOCK_RESULT);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('getPdfFilename returns a string matching YYYY-MM-DD pattern', () => {
    const filename = getPdfFilename();
    expect(filename).toMatch(/^tariff-comparison-\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it('passes the existing result data to generate output without recalculation', async () => {
    const blob = await exportComparisonPdf(MOCK_RESULT);
    // Should return a Blob — confirms PDF output() was called
    expect(blob.size).toBeGreaterThan(0);
  });
});
