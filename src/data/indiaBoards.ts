/**
 * indiaBoards.ts
 *
 * State-wise electricity board / DISCOM catalogue for India.
 * Covers all 36 states and Union Territories.
 *
 * ⚠️  ALL TARIFF DATA IN THIS FILE IS FOR DEMONSTRATION PURPOSES ONLY.
 *     No rate in this file has been verified against an official SERC or
 *     DISCOM tariff order.  verificationStatus is always 'demo'.
 *     Do NOT use these figures for actual electricity billing.
 *
 * Extensibility: Add a new state by appending a StateBoard entry whose
 * stateId matches the id field in src/data/indiaRegions.js.
 */

import type { TariffPlan } from '../types/index.js';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface TariffSchedule {
  scheduleId: string;
  scheduleName: string;
  /** Tariff type — flat, tou, slab, etc. */
  tariffType: 'flat' | 'tou' | 'slab' | 'other';
  /** Billing period */
  billingPeriod: 'monthly' | 'bimonthly';
  /** ISO date string when this schedule took effect */
  effectiveDate: string;
  /** Fixed supply / service charge per billing period (₹) */
  fixedCharge: number;
  /** Flat energy rate (₹/kWh) — used when tariffType is 'flat' or 'slab' (avg) */
  flatRate: number;
  /** Off-peak energy rate (₹/kWh) — used for TOU plans */
  offPeakRate: number;
  /** Shoulder / normal energy rate (₹/kWh) */
  shoulderRate: number;
  /** Peak energy rate (₹/kWh) */
  peakRate: number;
  /** Electricity duty / tax as a percentage of subtotal */
  taxDutyPercent: number;
  /** Additional surcharge in rupees */
  surcharge: number;
  /**
   * Always 'demo' — never 'verified'.
   * Rates are illustrative sample values, not official tariff orders.
   */
  verificationStatus: 'demo';
  /** Official SERC / DISCOM website for reference */
  sourceUrl: string;
  /** Human-readable disclaimer note */
  notes: string;
}

export interface ConsumerCategory {
  categoryId: string;
  categoryName: string;
  description: string;
  schedules: TariffSchedule[];
}

export interface BoardEntry {
  boardId: string;
  boardName: string;
  shortName: string;
  officialUrl: string;
  categories: ConsumerCategory[];
}

export interface StateBoard {
  stateId: string;
  boards: BoardEntry[];
}

// ---------------------------------------------------------------------------
// Helper — build a demo TariffSchedule quickly
// ---------------------------------------------------------------------------

function demoSchedule(
  scheduleId: string,
  scheduleName: string,
  opts: {
    tariffType?: TariffSchedule['tariffType'];
    billingPeriod?: TariffSchedule['billingPeriod'];
    effectiveDate?: string;
    fixedCharge?: number;
    flatRate?: number;
    offPeakRate?: number;
    shoulderRate?: number;
    peakRate?: number;
    taxDutyPercent?: number;
    surcharge?: number;
    sourceUrl?: string;
    notes?: string;
  } = {}
): TariffSchedule {
  const flat = opts.flatRate ?? 5.00;
  return {
    scheduleId,
    scheduleName,
    tariffType: opts.tariffType ?? 'flat',
    billingPeriod: opts.billingPeriod ?? 'monthly',
    effectiveDate: opts.effectiveDate ?? '2024-04-01',
    fixedCharge: opts.fixedCharge ?? 50,
    flatRate: flat,
    offPeakRate: opts.offPeakRate ?? flat * 0.70,
    shoulderRate: opts.shoulderRate ?? flat,
    peakRate: opts.peakRate ?? flat * 1.30,
    taxDutyPercent: opts.taxDutyPercent ?? 5,
    surcharge: opts.surcharge ?? 0,
    verificationStatus: 'demo',
    sourceUrl: opts.sourceUrl ?? '',
    notes:
      opts.notes ??
      '⚠️ DEMO DATA — NOT VERIFIED OFFICIAL RATES. ' +
        'Sample rates for demonstration only. Do not use for actual billing.',
  };
}

// ---------------------------------------------------------------------------
// INDIA_BOARDS — one entry per stateId from indiaRegions.js
// ---------------------------------------------------------------------------

export const INDIA_BOARDS: StateBoard[] = [
  // ── 1. Andhra Pradesh ──────────────────────────────────────────────────────
  {
    stateId: 'ap',
    boards: [
      {
        boardId: 'apspdcl',
        boardName: 'Southern Power Distribution Company of Andhra Pradesh Ltd',
        shortName: 'APSPDCL',
        officialUrl: 'https://www.apspdcl.in',
        categories: [
          {
            categoryId: 'apspdcl-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential consumers on low-tension supply',
            schedules: [
              demoSchedule('apspdcl-domestic-flat-demo', 'APSPDCL Domestic Flat — Demo', {
                fixedCharge: 45, flatRate: 4.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.aperc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'apspdcl-commercial',
            categoryName: 'Commercial (LT-II)',
            description: 'Shops, offices and other commercial premises',
            schedules: [
              demoSchedule('apspdcl-commercial-flat-demo', 'APSPDCL Commercial Flat — Demo', {
                fixedCharge: 100, flatRate: 7.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.aperc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'apspdcl-industrial',
            categoryName: 'Industrial LT (LT-IV)',
            description: 'Small and medium industrial consumers on LT supply',
            schedules: [
              demoSchedule('apspdcl-industrial-flat-demo', 'APSPDCL Industrial LT Flat — Demo', {
                fixedCharge: 200, flatRate: 8.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.aperc.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'apepdcl',
        boardName: 'Eastern Power Distribution Company of Andhra Pradesh Ltd',
        shortName: 'APEPDCL',
        officialUrl: 'https://www.apepdcl.in',
        categories: [
          {
            categoryId: 'apepdcl-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential consumers on low-tension supply',
            schedules: [
              demoSchedule('apepdcl-domestic-flat-demo', 'APEPDCL Domestic Flat — Demo', {
                fixedCharge: 45, flatRate: 4.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.aperc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'apepdcl-commercial',
            categoryName: 'Commercial (LT-II)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('apepdcl-commercial-flat-demo', 'APEPDCL Commercial Flat — Demo', {
                fixedCharge: 100, flatRate: 7.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.aperc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'apepdcl-industrial',
            categoryName: 'Industrial LT (LT-IV)',
            description: 'Industrial LT consumers',
            schedules: [
              demoSchedule('apepdcl-industrial-flat-demo', 'APEPDCL Industrial LT Flat — Demo', {
                fixedCharge: 200, flatRate: 8.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.aperc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 2. Arunachal Pradesh ───────────────────────────────────────────────────
  {
    stateId: 'ar',
    boards: [
      {
        boardId: 'apdcl-ar',
        boardName: 'Department of Hydro Power Development, Arunachal Pradesh',
        shortName: 'DHPD AP',
        officialUrl: 'https://www.arunachalpradesh.gov.in',
        categories: [
          {
            categoryId: 'dhpd-ar-domestic',
            categoryName: 'Domestic',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('dhpd-ar-domestic-demo', 'DHPD AP Domestic — Demo', {
                fixedCharge: 40, flatRate: 3.50,
                sourceUrl: 'https://www.arunachalpradesh.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 3. Assam ───────────────────────────────────────────────────────────────
  {
    stateId: 'as',
    boards: [
      {
        boardId: 'apdcl',
        boardName: 'Assam Power Distribution Company Ltd',
        shortName: 'APDCL',
        officialUrl: 'https://www.apdcl.org',
        categories: [
          {
            categoryId: 'apdcl-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('apdcl-domestic-demo', 'APDCL Domestic — Demo', {
                fixedCharge: 40, flatRate: 4.50,
                sourceUrl: 'https://www.aerc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 4. Bihar ───────────────────────────────────────────────────────────────
  {
    stateId: 'br',
    boards: [
      {
        boardId: 'nbpdcl',
        boardName: 'North Bihar Power Distribution Company Ltd',
        shortName: 'NBPDCL',
        officialUrl: 'https://www.nbpdcl.co.in',
        categories: [
          {
            categoryId: 'nbpdcl-domestic',
            categoryName: 'Domestic (LMV-1)',
            description: 'Residential LT consumers',
            schedules: [
              demoSchedule('nbpdcl-domestic-demo', 'NBPDCL Domestic — Demo', {
                fixedCharge: 80, flatRate: 5.50,
                sourceUrl: 'https://www.bserc.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'sbpdcl',
        boardName: 'South Bihar Power Distribution Company Ltd',
        shortName: 'SBPDCL',
        officialUrl: 'https://www.sbpdcl.co.in',
        categories: [
          {
            categoryId: 'sbpdcl-domestic',
            categoryName: 'Domestic (LMV-1)',
            description: 'Residential LT consumers',
            schedules: [
              demoSchedule('sbpdcl-domestic-demo', 'SBPDCL Domestic — Demo', {
                fixedCharge: 80, flatRate: 5.50,
                sourceUrl: 'https://www.bserc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 5. Chhattisgarh ────────────────────────────────────────────────────────
  {
    stateId: 'cg',
    boards: [
      {
        boardId: 'cspdcl',
        boardName: 'Chhattisgarh State Power Distribution Company Ltd',
        shortName: 'CSPDCL',
        officialUrl: 'https://www.cspdcl.co.in',
        categories: [
          {
            categoryId: 'cspdcl-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('cspdcl-domestic-demo', 'CSPDCL Domestic — Demo', {
                fixedCharge: 50, flatRate: 4.00,
                sourceUrl: 'https://www.cserc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 6. Goa ─────────────────────────────────────────────────────────────────
  {
    stateId: 'ga',
    boards: [
      {
        boardId: 'ged',
        boardName: 'Goa Electricity Department',
        shortName: 'GED',
        officialUrl: 'https://www.goaelectricity.gov.in',
        categories: [
          {
            categoryId: 'ged-domestic',
            categoryName: 'Domestic',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('ged-domestic-demo', 'GED Domestic — Demo', {
                fixedCharge: 35, flatRate: 3.80,
                sourceUrl: 'https://www.goaelectricity.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 7. Gujarat ─────────────────────────────────────────────────────────────
  {
    stateId: 'gj',
    boards: [
      {
        boardId: 'dgvcl',
        boardName: 'Dakshin Gujarat Vij Company Ltd',
        shortName: 'DGVCL',
        officialUrl: 'https://www.dgvcl.com',
        categories: [
          {
            categoryId: 'dgvcl-domestic',
            categoryName: 'Domestic (LTP)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('dgvcl-domestic-demo', 'DGVCL Domestic — Demo', {
                fixedCharge: 30, flatRate: 3.35, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
          {
            categoryId: 'dgvcl-commercial',
            categoryName: 'Commercial (LTP)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('dgvcl-commercial-demo', 'DGVCL Commercial — Demo', {
                fixedCharge: 80, flatRate: 6.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
          {
            categoryId: 'dgvcl-industrial',
            categoryName: 'Industrial LT (LTP-HV)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('dgvcl-industrial-demo', 'DGVCL Industrial LT — Demo', {
                fixedCharge: 150, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'mgvcl',
        boardName: 'Madhya Gujarat Vij Company Ltd',
        shortName: 'MGVCL',
        officialUrl: 'https://www.mgvcl.com',
        categories: [
          {
            categoryId: 'mgvcl-domestic',
            categoryName: 'Domestic (LTP)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('mgvcl-domestic-demo', 'MGVCL Domestic — Demo', {
                fixedCharge: 30, flatRate: 3.35, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
          {
            categoryId: 'mgvcl-commercial',
            categoryName: 'Commercial (LTP)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('mgvcl-commercial-demo', 'MGVCL Commercial — Demo', {
                fixedCharge: 80, flatRate: 6.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
          {
            categoryId: 'mgvcl-industrial',
            categoryName: 'Industrial LT (LTP-HV)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('mgvcl-industrial-demo', 'MGVCL Industrial LT — Demo', {
                fixedCharge: 150, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'pgvcl',
        boardName: 'Paschim Gujarat Vij Company Ltd',
        shortName: 'PGVCL',
        officialUrl: 'https://www.pgvcl.com',
        categories: [
          {
            categoryId: 'pgvcl-domestic',
            categoryName: 'Domestic (LTP)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('pgvcl-domestic-demo', 'PGVCL Domestic — Demo', {
                fixedCharge: 30, flatRate: 3.35, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
          {
            categoryId: 'pgvcl-commercial',
            categoryName: 'Commercial (LTP)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('pgvcl-commercial-demo', 'PGVCL Commercial — Demo', {
                fixedCharge: 80, flatRate: 6.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
          {
            categoryId: 'pgvcl-industrial',
            categoryName: 'Industrial LT (LTP-HV)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('pgvcl-industrial-demo', 'PGVCL Industrial LT — Demo', {
                fixedCharge: 150, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'ugvcl',
        boardName: 'Uttar Gujarat Vij Company Ltd',
        shortName: 'UGVCL',
        officialUrl: 'https://www.ugvcl.com',
        categories: [
          {
            categoryId: 'ugvcl-domestic',
            categoryName: 'Domestic (LTP)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('ugvcl-domestic-demo', 'UGVCL Domestic — Demo', {
                fixedCharge: 30, flatRate: 3.35, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
          {
            categoryId: 'ugvcl-commercial',
            categoryName: 'Commercial (LTP)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('ugvcl-commercial-demo', 'UGVCL Commercial — Demo', {
                fixedCharge: 80, flatRate: 6.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
          {
            categoryId: 'ugvcl-industrial',
            categoryName: 'Industrial LT (LTP-HV)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('ugvcl-industrial-demo', 'UGVCL Industrial LT — Demo', {
                fixedCharge: 150, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.gercin.org',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 8. Haryana ─────────────────────────────────────────────────────────────
  {
    stateId: 'hr',
    boards: [
      {
        boardId: 'uhbvn',
        boardName: 'Uttar Haryana Bijli Vitran Nigam',
        shortName: 'UHBVN',
        officialUrl: 'https://www.uhbvn.org.in',
        categories: [
          {
            categoryId: 'uhbvn-domestic',
            categoryName: 'Domestic (DS)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('uhbvn-domestic-demo', 'UHBVN Domestic — Demo', {
                fixedCharge: 65, flatRate: 5.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.herc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'uhbvn-commercial',
            categoryName: 'Commercial (NDS)',
            description: 'Non-domestic commercial consumers',
            schedules: [
              demoSchedule('uhbvn-commercial-demo', 'UHBVN Commercial — Demo', {
                fixedCharge: 130, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.herc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'uhbvn-industrial',
            categoryName: 'Industrial LT (MS)',
            description: 'Small industrial consumers on medium supply',
            schedules: [
              demoSchedule('uhbvn-industrial-demo', 'UHBVN Industrial LT — Demo', {
                fixedCharge: 200, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.herc.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'dhbvn',
        boardName: 'Dakshin Haryana Bijli Vitran Nigam',
        shortName: 'DHBVN',
        officialUrl: 'https://www.dhbvn.org.in',
        categories: [
          {
            categoryId: 'dhbvn-domestic',
            categoryName: 'Domestic (DS)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('dhbvn-domestic-demo', 'DHBVN Domestic — Demo', {
                fixedCharge: 65, flatRate: 5.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.herc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'dhbvn-commercial',
            categoryName: 'Commercial (NDS)',
            description: 'Non-domestic commercial consumers',
            schedules: [
              demoSchedule('dhbvn-commercial-demo', 'DHBVN Commercial — Demo', {
                fixedCharge: 130, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.herc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'dhbvn-industrial',
            categoryName: 'Industrial LT (MS)',
            description: 'Small industrial consumers',
            schedules: [
              demoSchedule('dhbvn-industrial-demo', 'DHBVN Industrial LT — Demo', {
                fixedCharge: 200, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.herc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 9. Himachal Pradesh ────────────────────────────────────────────────────
  {
    stateId: 'hp',
    boards: [
      {
        boardId: 'hpsebl',
        boardName: 'Himachal Pradesh State Electricity Board Ltd',
        shortName: 'HPSEBL',
        officialUrl: 'https://www.hpseb.in',
        categories: [
          {
            categoryId: 'hpsebl-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('hpsebl-domestic-demo', 'HPSEBL Domestic — Demo', {
                fixedCharge: 30, flatRate: 3.50,
                sourceUrl: 'https://www.hperc.org',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 10. Jharkhand ──────────────────────────────────────────────────────────
  {
    stateId: 'jh',
    boards: [
      {
        boardId: 'jbvnl',
        boardName: 'Jharkhand Bijli Vitran Nigam Ltd',
        shortName: 'JBVNL',
        officialUrl: 'https://www.jbvnl.co.in',
        categories: [
          {
            categoryId: 'jbvnl-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('jbvnl-domestic-demo', 'JBVNL Domestic — Demo', {
                fixedCharge: 55, flatRate: 5.00,
                sourceUrl: 'https://www.jserc.org',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 11. Karnataka ──────────────────────────────────────────────────────────
  {
    stateId: 'ka',
    boards: [
      {
        boardId: 'bescom',
        boardName: 'Bangalore Electricity Supply Company Ltd',
        shortName: 'BESCOM',
        officialUrl: 'https://www.bescom.co.in',
        categories: [
          {
            categoryId: 'bescom-domestic',
            categoryName: 'Domestic (LT-2)',
            description: 'LT domestic consumers in Bangalore circle',
            schedules: [
              demoSchedule('bescom-domestic-flat-demo', 'BESCOM Domestic Flat — Demo', {
                fixedCharge: 50, flatRate: 4.85, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
              demoSchedule('bescom-domestic-tou-demo', 'BESCOM Domestic TOU — Demo', {
                tariffType: 'tou',
                fixedCharge: 70, flatRate: 4.85,
                offPeakRate: 3.50, shoulderRate: 4.85, peakRate: 7.00,
                taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'bescom-commercial',
            categoryName: 'Commercial (LT-5)',
            description: 'LT commercial consumers',
            schedules: [
              demoSchedule('bescom-commercial-demo', 'BESCOM Commercial — Demo', {
                fixedCharge: 120, flatRate: 7.45, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'bescom-industrial',
            categoryName: 'Industrial LT (LT-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('bescom-industrial-demo', 'BESCOM Industrial LT — Demo', {
                fixedCharge: 200, flatRate: 8.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'hescom',
        boardName: 'Hubli Electricity Supply Company Ltd',
        shortName: 'HESCOM',
        officialUrl: 'https://www.hescom.co.in',
        categories: [
          {
            categoryId: 'hescom-domestic',
            categoryName: 'Domestic (LT-2)',
            description: 'Residential consumers in Hubli circle',
            schedules: [
              demoSchedule('hescom-domestic-demo', 'HESCOM Domestic — Demo', {
                fixedCharge: 50, flatRate: 4.85, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'hescom-commercial',
            categoryName: 'Commercial (LT-5)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('hescom-commercial-demo', 'HESCOM Commercial — Demo', {
                fixedCharge: 120, flatRate: 7.45, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'hescom-industrial',
            categoryName: 'Industrial LT (LT-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('hescom-industrial-demo', 'HESCOM Industrial LT — Demo', {
                fixedCharge: 200, flatRate: 8.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'gescom',
        boardName: 'Gulbarga Electricity Supply Company Ltd',
        shortName: 'GESCOM',
        officialUrl: 'https://www.gescom.in',
        categories: [
          {
            categoryId: 'gescom-domestic',
            categoryName: 'Domestic (LT-2)',
            description: 'Residential consumers in Gulbarga circle',
            schedules: [
              demoSchedule('gescom-domestic-demo', 'GESCOM Domestic — Demo', {
                fixedCharge: 50, flatRate: 4.85, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'gescom-commercial',
            categoryName: 'Commercial (LT-5)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('gescom-commercial-demo', 'GESCOM Commercial — Demo', {
                fixedCharge: 120, flatRate: 7.45, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'gescom-industrial',
            categoryName: 'Industrial LT (LT-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('gescom-industrial-demo', 'GESCOM Industrial LT — Demo', {
                fixedCharge: 200, flatRate: 8.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'mescom',
        boardName: 'Mangalore Electricity Supply Company Ltd',
        shortName: 'MESCOM',
        officialUrl: 'https://www.mescom.co.in',
        categories: [
          {
            categoryId: 'mescom-domestic',
            categoryName: 'Domestic (LT-2)',
            description: 'Residential consumers in Mangalore circle',
            schedules: [
              demoSchedule('mescom-domestic-demo', 'MESCOM Domestic — Demo', {
                fixedCharge: 50, flatRate: 4.85, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'mescom-commercial',
            categoryName: 'Commercial (LT-5)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('mescom-commercial-demo', 'MESCOM Commercial — Demo', {
                fixedCharge: 120, flatRate: 7.45, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'mescom-industrial',
            categoryName: 'Industrial LT (LT-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('mescom-industrial-demo', 'MESCOM Industrial LT — Demo', {
                fixedCharge: 200, flatRate: 8.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'cescom',
        boardName: 'Chamundeshwari Electricity Supply Corporation Ltd',
        shortName: 'CESCOM',
        officialUrl: 'https://www.cescom.co.in',
        categories: [
          {
            categoryId: 'cescom-domestic',
            categoryName: 'Domestic (LT-2)',
            description: 'Residential consumers in Mysore circle',
            schedules: [
              demoSchedule('cescom-domestic-demo', 'CESCOM Domestic — Demo', {
                fixedCharge: 50, flatRate: 4.85, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'cescom-commercial',
            categoryName: 'Commercial (LT-5)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('cescom-commercial-demo', 'CESCOM Commercial — Demo', {
                fixedCharge: 120, flatRate: 7.45, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
          {
            categoryId: 'cescom-industrial',
            categoryName: 'Industrial LT (LT-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('cescom-industrial-demo', 'CESCOM Industrial LT — Demo', {
                fixedCharge: 200, flatRate: 8.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.kerc.karnataka.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 12. Kerala ─────────────────────────────────────────────────────────────
  {
    stateId: 'kl',
    boards: [
      {
        boardId: 'kseb',
        boardName: 'Kerala State Electricity Board Ltd',
        shortName: 'KSEB',
        officialUrl: 'https://www.kseb.in',
        categories: [
          {
            categoryId: 'kseb-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('kseb-domestic-flat-demo', 'KSEB Domestic Flat — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 25, flatRate: 3.25, taxDutyPercent: 5,
                sourceUrl: 'https://www.kseb.in',
              }),
              demoSchedule('kseb-domestic-tou-demo', 'KSEB Domestic TOU — Demo', {
                tariffType: 'tou',
                billingPeriod: 'bimonthly',
                fixedCharge: 40, flatRate: 3.25,
                offPeakRate: 2.00, shoulderRate: 3.25, peakRate: 5.50,
                taxDutyPercent: 5,
                sourceUrl: 'https://www.kseb.in',
              }),
            ],
          },
          {
            categoryId: 'kseb-commercial',
            categoryName: 'Commercial (LT-V)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('kseb-commercial-demo', 'KSEB Commercial — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 75, flatRate: 6.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.kseb.in',
              }),
            ],
          },
          {
            categoryId: 'kseb-industrial',
            categoryName: 'Industrial LT (LT-VII)',
            description: 'Small industrial consumers',
            schedules: [
              demoSchedule('kseb-industrial-demo', 'KSEB Industrial LT — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 150, flatRate: 7.80, taxDutyPercent: 5,
                sourceUrl: 'https://www.kseb.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 13. Madhya Pradesh ─────────────────────────────────────────────────────
  {
    stateId: 'mp',
    boards: [
      {
        boardId: 'mpmkvvcl',
        boardName: 'Madhya Pradesh Madhya Kshetra Vidyut Vitaran Company Ltd',
        shortName: 'MPMKVVCL',
        officialUrl: 'https://www.mpmkvvcl.org',
        categories: [
          {
            categoryId: 'mpmkvvcl-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('mpmkvvcl-domestic-demo', 'MPMKVVCL Domestic — Demo', {
                fixedCharge: 60, flatRate: 5.00,
                sourceUrl: 'https://www.mperc.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'mppkvvcl',
        boardName: 'Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company Ltd',
        shortName: 'MPPKVVCL',
        officialUrl: 'https://www.mppkvvcl.org',
        categories: [
          {
            categoryId: 'mppkvvcl-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('mppkvvcl-domestic-demo', 'MPPKVVCL Domestic — Demo', {
                fixedCharge: 60, flatRate: 5.00,
                sourceUrl: 'https://www.mperc.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 14. Maharashtra ────────────────────────────────────────────────────────
  {
    stateId: 'mh',
    boards: [
      {
        boardId: 'mahadiscom',
        boardName: 'Maharashtra State Electricity Distribution Company Ltd',
        shortName: 'MSEDCL',
        officialUrl: 'https://www.mahadiscom.in',
        categories: [
          {
            categoryId: 'msedcl-domestic',
            categoryName: 'Domestic (LT-1)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('msedcl-domestic-flat-demo', 'MSEDCL Domestic Flat — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 55, flatRate: 5.35, taxDutyPercent: 5,
                sourceUrl: 'https://www.mahadiscom.in',
              }),
              demoSchedule('msedcl-domestic-tou-demo', 'MSEDCL Domestic TOU — Demo', {
                tariffType: 'tou',
                billingPeriod: 'bimonthly',
                fixedCharge: 75, flatRate: 5.35,
                offPeakRate: 3.60, shoulderRate: 5.35, peakRate: 8.20,
                taxDutyPercent: 5,
                sourceUrl: 'https://www.mahadiscom.in',
              }),
            ],
          },
          {
            categoryId: 'msedcl-commercial',
            categoryName: 'Commercial (LT-2)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('msedcl-commercial-demo', 'MSEDCL Commercial — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 130, flatRate: 8.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.mahadiscom.in',
              }),
            ],
          },
          {
            categoryId: 'msedcl-industrial',
            categoryName: 'Industrial LT (LT-3)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('msedcl-industrial-demo', 'MSEDCL Industrial LT — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 250, flatRate: 9.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.mahadiscom.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'best',
        boardName: 'Brihanmumbai Electric Supply and Transport Undertaking',
        shortName: 'BEST',
        officialUrl: 'https://www.bestundertaking.com',
        categories: [
          {
            categoryId: 'best-domestic',
            categoryName: 'Residential',
            description: 'BEST residential consumers in Mumbai',
            schedules: [
              demoSchedule('best-domestic-demo', 'BEST Residential — Demo', {
                fixedCharge: 60, flatRate: 5.60, taxDutyPercent: 5,
                sourceUrl: 'https://www.bestundertaking.com',
              }),
            ],
          },
          {
            categoryId: 'best-commercial',
            categoryName: 'Commercial',
            description: 'BEST commercial consumers',
            schedules: [
              demoSchedule('best-commercial-demo', 'BEST Commercial — Demo', {
                fixedCharge: 140, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.bestundertaking.com',
              }),
            ],
          },
          {
            categoryId: 'best-industrial',
            categoryName: 'Industrial LT',
            description: 'BEST LT industrial consumers',
            schedules: [
              demoSchedule('best-industrial-demo', 'BEST Industrial LT — Demo', {
                fixedCharge: 300, flatRate: 9.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.bestundertaking.com',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'tpcl-mh',
        boardName: 'Tata Power Company Ltd — Mumbai Distribution',
        shortName: 'Tata Power',
        officialUrl: 'https://www.tatapower.com',
        categories: [
          {
            categoryId: 'tpcl-mh-domestic',
            categoryName: 'Residential',
            description: 'Tata Power residential consumers in Mumbai',
            schedules: [
              demoSchedule('tpcl-mh-domestic-demo', 'Tata Power Residential — Demo', {
                fixedCharge: 55, flatRate: 5.40, taxDutyPercent: 5,
                sourceUrl: 'https://www.tatapower.com',
              }),
            ],
          },
          {
            categoryId: 'tpcl-mh-commercial',
            categoryName: 'Commercial',
            description: 'Tata Power commercial consumers',
            schedules: [
              demoSchedule('tpcl-mh-commercial-demo', 'Tata Power Commercial — Demo', {
                fixedCharge: 135, flatRate: 8.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.tatapower.com',
              }),
            ],
          },
          {
            categoryId: 'tpcl-mh-industrial',
            categoryName: 'Industrial LT',
            description: 'Tata Power LT industrial consumers',
            schedules: [
              demoSchedule('tpcl-mh-industrial-demo', 'Tata Power Industrial LT — Demo', {
                fixedCharge: 280, flatRate: 9.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.tatapower.com',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 15. Manipur ────────────────────────────────────────────────────────────
  {
    stateId: 'mn',
    boards: [
      {
        boardId: 'mspdcl',
        boardName: 'Manipur State Power Distribution Company Ltd',
        shortName: 'MSPDCL',
        officialUrl: 'https://mspdcl.nic.in',
        categories: [
          {
            categoryId: 'mspdcl-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('mspdcl-domestic-demo', 'MSPDCL Domestic — Demo', {
                fixedCharge: 35, flatRate: 4.00,
                sourceUrl: 'https://mspdcl.nic.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 16. Meghalaya ──────────────────────────────────────────────────────────
  {
    stateId: 'ml',
    boards: [
      {
        boardId: 'mepco',
        boardName: 'Meghalaya Power Distribution Corporation Ltd',
        shortName: 'MePDCL',
        officialUrl: 'https://www.mepco.org.in',
        categories: [
          {
            categoryId: 'mepdcl-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('mepdcl-domestic-demo', 'MePDCL Domestic — Demo', {
                fixedCharge: 40, flatRate: 4.20,
                sourceUrl: 'https://www.mepco.org.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 17. Mizoram ────────────────────────────────────────────────────────────
  {
    stateId: 'mz',
    boards: [
      {
        boardId: 'zadcl',
        boardName: 'Mizoram Department of Power and Electricity',
        shortName: 'MzDoPE',
        officialUrl: 'https://www.mizoram.gov.in',
        categories: [
          {
            categoryId: 'mzdope-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('mzdope-domestic-demo', 'MzDoPE Domestic — Demo', {
                fixedCharge: 30, flatRate: 3.80,
                sourceUrl: 'https://www.mizoram.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 18. Nagaland ───────────────────────────────────────────────────────────
  {
    stateId: 'nl',
    boards: [
      {
        boardId: 'dpn',
        boardName: 'Department of Power, Nagaland',
        shortName: 'DoP Nagaland',
        officialUrl: 'https://www.nagaland.gov.in',
        categories: [
          {
            categoryId: 'dpn-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('dpn-domestic-demo', 'DoP Nagaland Domestic — Demo', {
                fixedCharge: 30, flatRate: 4.00,
                sourceUrl: 'https://www.nagaland.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 19. Odisha ─────────────────────────────────────────────────────────────
  {
    stateId: 'od',
    boards: [
      {
        boardId: 'tpcodl',
        boardName: 'TP Central Odisha Distribution Ltd',
        shortName: 'TPCODL',
        officialUrl: 'https://www.tpcodl.in',
        categories: [
          {
            categoryId: 'tpcodl-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('tpcodl-domestic-demo', 'TPCODL Domestic — Demo', {
                fixedCharge: 50, flatRate: 5.00,
                sourceUrl: 'https://www.oerc.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'nesco',
        boardName: 'North Eastern Electricity Supply Company of Odisha Ltd',
        shortName: 'NESCO',
        officialUrl: 'https://www.nesco.co.in',
        categories: [
          {
            categoryId: 'nesco-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('nesco-domestic-demo', 'NESCO Domestic — Demo', {
                fixedCharge: 50, flatRate: 5.00,
                sourceUrl: 'https://www.oerc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 20. Punjab ─────────────────────────────────────────────────────────────
  {
    stateId: 'pb',
    boards: [
      {
        boardId: 'pspcl',
        boardName: 'Punjab State Power Corporation Ltd',
        shortName: 'PSPCL',
        officialUrl: 'https://www.pspcl.in',
        categories: [
          {
            categoryId: 'pspcl-domestic',
            categoryName: 'Domestic Supply (DS)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('pspcl-domestic-flat-demo', 'PSPCL Domestic Flat — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 60, flatRate: 4.85, taxDutyPercent: 5,
                sourceUrl: 'https://www.pserc.gov.in',
              }),
              demoSchedule('pspcl-domestic-tou-demo', 'PSPCL Domestic TOU — Demo', {
                tariffType: 'tou',
                billingPeriod: 'bimonthly',
                fixedCharge: 80, flatRate: 4.85,
                offPeakRate: 3.20, shoulderRate: 4.85, peakRate: 7.50,
                taxDutyPercent: 5,
                sourceUrl: 'https://www.pserc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'pspcl-commercial',
            categoryName: 'Non-Residential Supply (NRS)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('pspcl-commercial-demo', 'PSPCL Commercial — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 130, flatRate: 7.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.pserc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'pspcl-industrial',
            categoryName: 'Small Power Supply (SP)',
            description: 'Small industrial LT consumers',
            schedules: [
              demoSchedule('pspcl-industrial-demo', 'PSPCL Small Power — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 180, flatRate: 8.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.pserc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 21. Rajasthan ──────────────────────────────────────────────────────────
  {
    stateId: 'rj',
    boards: [
      {
        boardId: 'jvvnl',
        boardName: 'Jaipur Vidyut Vitran Nigam Ltd',
        shortName: 'JVVNL',
        officialUrl: 'https://www.jvvnl.in',
        categories: [
          {
            categoryId: 'jvvnl-domestic',
            categoryName: 'Domestic (LV-1)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('jvvnl-domestic-flat-demo', 'JVVNL Domestic Flat — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 55, flatRate: 5.50, taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
              demoSchedule('jvvnl-domestic-tou-demo', 'JVVNL Domestic TOU — Demo', {
                tariffType: 'tou',
                billingPeriod: 'bimonthly',
                fixedCharge: 75, flatRate: 5.50,
                offPeakRate: 3.80, shoulderRate: 5.50, peakRate: 8.00,
                taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
            ],
          },
          {
            categoryId: 'jvvnl-commercial',
            categoryName: 'Commercial (LV-4)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('jvvnl-commercial-demo', 'JVVNL Commercial — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 130, flatRate: 8.00, taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
            ],
          },
          {
            categoryId: 'jvvnl-industrial',
            categoryName: 'Industrial LT (LV-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('jvvnl-industrial-demo', 'JVVNL Industrial LT — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 220, flatRate: 9.00, taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'avvnl',
        boardName: 'Ajmer Vidyut Vitran Nigam Ltd',
        shortName: 'AVVNL',
        officialUrl: 'https://www.avvnl.com',
        categories: [
          {
            categoryId: 'avvnl-domestic',
            categoryName: 'Domestic (LV-1)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('avvnl-domestic-demo', 'AVVNL Domestic — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 55, flatRate: 5.50, taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
            ],
          },
          {
            categoryId: 'avvnl-commercial',
            categoryName: 'Commercial (LV-4)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('avvnl-commercial-demo', 'AVVNL Commercial — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 130, flatRate: 8.00, taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
            ],
          },
          {
            categoryId: 'avvnl-industrial',
            categoryName: 'Industrial LT (LV-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('avvnl-industrial-demo', 'AVVNL Industrial LT — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 220, flatRate: 9.00, taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'jdvvnl',
        boardName: 'Jodhpur Vidyut Vitran Nigam Ltd',
        shortName: 'JdVVNL',
        officialUrl: 'https://www.jdvvnl.com',
        categories: [
          {
            categoryId: 'jdvvnl-domestic',
            categoryName: 'Domestic (LV-1)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('jdvvnl-domestic-demo', 'JdVVNL Domestic — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 55, flatRate: 5.50, taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
            ],
          },
          {
            categoryId: 'jdvvnl-commercial',
            categoryName: 'Commercial (LV-4)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('jdvvnl-commercial-demo', 'JdVVNL Commercial — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 130, flatRate: 8.00, taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
            ],
          },
          {
            categoryId: 'jdvvnl-industrial',
            categoryName: 'Industrial LT (LV-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('jdvvnl-industrial-demo', 'JdVVNL Industrial LT — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 220, flatRate: 9.00, taxDutyPercent: 5,
                sourceUrl: 'https://rerc.rajasthan.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 22. Sikkim ─────────────────────────────────────────────────────────────
  {
    stateId: 'sk',
    boards: [
      {
        boardId: 'sikkim-ded',
        boardName: 'Energy and Power Department, Sikkim',
        shortName: 'EPD Sikkim',
        officialUrl: 'https://www.sikkim.gov.in',
        categories: [
          {
            categoryId: 'epd-sk-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('epd-sk-domestic-demo', 'EPD Sikkim Domestic — Demo', {
                fixedCharge: 25, flatRate: 3.00,
                sourceUrl: 'https://www.sikkim.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 23. Tamil Nadu ─────────────────────────────────────────────────────────
  {
    stateId: 'tn',
    boards: [
      {
        boardId: 'tangedco',
        boardName: 'Tamil Nadu Generation and Distribution Corporation Ltd',
        shortName: 'TANGEDCO',
        officialUrl: 'https://www.tangedco.gov.in',
        categories: [
          {
            categoryId: 'tangedco-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential LT consumers',
            schedules: [
              demoSchedule('tangedco-domestic-flat-demo', 'TANGEDCO Domestic Flat — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 30, flatRate: 3.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.tangedco.gov.in',
                notes:
                  '⚠️ DEMO DATA — NOT OFFICIAL TANGEDCO/TNERC RATES. ' +
                  'Consult https://www.tangedco.gov.in and https://www.tnerc.gov.in for official tariffs.',
              }),
              demoSchedule('tangedco-domestic-tou-demo', 'TANGEDCO Domestic TOU — Demo', {
                tariffType: 'tou',
                billingPeriod: 'bimonthly',
                fixedCharge: 50, flatRate: 3.00,
                offPeakRate: 1.80, shoulderRate: 3.00, peakRate: 5.50,
                taxDutyPercent: 5,
                sourceUrl: 'https://www.tangedco.gov.in',
                notes:
                  '⚠️ DEMO TOU DATA — NOT OFFICIAL TANGEDCO/TNERC RATES. ' +
                  'Sample rates for demonstration only.',
              }),
            ],
          },
          {
            categoryId: 'tangedco-commercial',
            categoryName: 'Commercial (LT-II)',
            description: 'Commercial LT consumers',
            schedules: [
              demoSchedule('tangedco-commercial-demo', 'TANGEDCO Commercial — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 80, flatRate: 6.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.tangedco.gov.in',
              }),
            ],
          },
          {
            categoryId: 'tangedco-industrial',
            categoryName: 'Industrial LT (LT-III)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('tangedco-industrial-demo', 'TANGEDCO Industrial LT — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 175, flatRate: 8.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.tangedco.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 24. Telangana ──────────────────────────────────────────────────────────
  {
    stateId: 'tg',
    boards: [
      {
        boardId: 'tsspdcl',
        boardName: 'Southern Power Distribution Company of Telangana Ltd',
        shortName: 'TSSPDCL',
        officialUrl: 'https://www.tsspdcl.in',
        categories: [
          {
            categoryId: 'tsspdcl-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('tsspdcl-domestic-demo', 'TSSPDCL Domestic — Demo', {
                fixedCharge: 50, flatRate: 4.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.tserc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'tsspdcl-commercial',
            categoryName: 'Commercial (LT-II)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('tsspdcl-commercial-demo', 'TSSPDCL Commercial — Demo', {
                fixedCharge: 110, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.tserc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'tsspdcl-industrial',
            categoryName: 'Industrial LT (LT-III)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('tsspdcl-industrial-demo', 'TSSPDCL Industrial LT — Demo', {
                fixedCharge: 200, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.tserc.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'tsnpdcl',
        boardName: 'Northern Power Distribution Company of Telangana Ltd',
        shortName: 'TSNPDCL',
        officialUrl: 'https://www.tsnpdcl.in',
        categories: [
          {
            categoryId: 'tsnpdcl-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('tsnpdcl-domestic-demo', 'TSNPDCL Domestic — Demo', {
                fixedCharge: 50, flatRate: 4.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.tserc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'tsnpdcl-commercial',
            categoryName: 'Commercial (LT-II)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('tsnpdcl-commercial-demo', 'TSNPDCL Commercial — Demo', {
                fixedCharge: 110, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.tserc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'tsnpdcl-industrial',
            categoryName: 'Industrial LT (LT-III)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('tsnpdcl-industrial-demo', 'TSNPDCL Industrial LT — Demo', {
                fixedCharge: 200, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.tserc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 25. Tripura ────────────────────────────────────────────────────────────
  {
    stateId: 'tr',
    boards: [
      {
        boardId: 'tsecl',
        boardName: 'Tripura State Electricity Corporation Ltd',
        shortName: 'TSECL',
        officialUrl: 'https://tsecl.nic.in',
        categories: [
          {
            categoryId: 'tsecl-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('tsecl-domestic-demo', 'TSECL Domestic — Demo', {
                fixedCharge: 35, flatRate: 4.50,
                sourceUrl: 'https://tsecl.nic.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 26. Uttar Pradesh ──────────────────────────────────────────────────────
  {
    stateId: 'up',
    boards: [
      {
        boardId: 'dvvnl',
        boardName: 'Dakshinanchal Vidyut Vitran Nigam Ltd',
        shortName: 'DVVNL',
        officialUrl: 'https://www.dvvnl.org',
        categories: [
          {
            categoryId: 'dvvnl-ib-domestic',
            categoryName: 'Domestic (LMV-1)',
            description: 'Residential single-phase consumers',
            schedules: [
              demoSchedule('dvvnl-ib-domestic-flat-demo', 'DVVNL Domestic Flat — Demo', {
                fixedCharge: 105, flatRate: 5.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
              demoSchedule('dvvnl-ib-domestic-tou-demo', 'DVVNL Domestic TOU — Demo', {
                tariffType: 'tou',
                fixedCharge: 130, flatRate: 5.00,
                offPeakRate: 3.35, shoulderRate: 5.00, peakRate: 7.50,
                taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'dvvnl-ib-commercial',
            categoryName: 'Commercial (LMV-2)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('dvvnl-ib-commercial-demo', 'DVVNL Commercial — Demo', {
                fixedCharge: 200, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'dvvnl-ib-industrial',
            categoryName: 'Industrial LT (LMV-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('dvvnl-ib-industrial-demo', 'DVVNL Industrial LT — Demo', {
                fixedCharge: 300, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'mvvnl',
        boardName: 'Madhyanchal Vidyut Vitran Nigam Ltd',
        shortName: 'MVVNL',
        officialUrl: 'https://www.mvvnl.in',
        categories: [
          {
            categoryId: 'mvvnl-ib-domestic',
            categoryName: 'Domestic (LMV-1)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('mvvnl-ib-domestic-demo', 'MVVNL Domestic — Demo', {
                fixedCharge: 105, flatRate: 5.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'mvvnl-ib-commercial',
            categoryName: 'Commercial (LMV-2)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('mvvnl-ib-commercial-demo', 'MVVNL Commercial — Demo', {
                fixedCharge: 200, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'mvvnl-ib-industrial',
            categoryName: 'Industrial LT (LMV-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('mvvnl-ib-industrial-demo', 'MVVNL Industrial LT — Demo', {
                fixedCharge: 300, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'pvvnl',
        boardName: 'Paschimanchal Vidyut Vitran Nigam Ltd',
        shortName: 'PVVNL',
        officialUrl: 'https://www.pvvnl.org',
        categories: [
          {
            categoryId: 'pvvnl-ib-domestic',
            categoryName: 'Domestic (LMV-1)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('pvvnl-ib-domestic-demo', 'PVVNL Domestic — Demo', {
                fixedCharge: 105, flatRate: 5.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'pvvnl-ib-commercial',
            categoryName: 'Commercial (LMV-2)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('pvvnl-ib-commercial-demo', 'PVVNL Commercial — Demo', {
                fixedCharge: 200, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'pvvnl-ib-industrial',
            categoryName: 'Industrial LT (LMV-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('pvvnl-ib-industrial-demo', 'PVVNL Industrial LT — Demo', {
                fixedCharge: 300, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'puvvnl',
        boardName: 'Purvanchal Vidyut Vitran Nigam Ltd',
        shortName: 'PuVVNL',
        officialUrl: 'https://www.puvvnl.up.gov.in',
        categories: [
          {
            categoryId: 'puvvnl-ib-domestic',
            categoryName: 'Domestic (LMV-1)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('puvvnl-ib-domestic-demo', 'PuVVNL Domestic — Demo', {
                fixedCharge: 105, flatRate: 5.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'puvvnl-ib-commercial',
            categoryName: 'Commercial (LMV-2)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('puvvnl-ib-commercial-demo', 'PuVVNL Commercial — Demo', {
                fixedCharge: 200, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'puvvnl-ib-industrial',
            categoryName: 'Industrial LT (LMV-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('puvvnl-ib-industrial-demo', 'PuVVNL Industrial LT — Demo', {
                fixedCharge: 300, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'kesco',
        boardName: 'Kanpur Electricity Supply Company Ltd',
        shortName: 'KESCO',
        officialUrl: 'https://www.kesco.co.in',
        categories: [
          {
            categoryId: 'kesco-ib-domestic',
            categoryName: 'Domestic (LMV-1)',
            description: 'Kanpur residential consumers',
            schedules: [
              demoSchedule('kesco-ib-domestic-demo', 'KESCO Domestic — Demo', {
                fixedCharge: 105, flatRate: 5.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'kesco-ib-commercial',
            categoryName: 'Commercial (LMV-2)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('kesco-ib-commercial-demo', 'KESCO Commercial — Demo', {
                fixedCharge: 200, flatRate: 7.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
          {
            categoryId: 'kesco-ib-industrial',
            categoryName: 'Industrial LT (LMV-6)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('kesco-ib-industrial-demo', 'KESCO Industrial LT — Demo', {
                fixedCharge: 300, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.uperc.org',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 27. Uttarakhand ────────────────────────────────────────────────────────
  {
    stateId: 'uk',
    boards: [
      {
        boardId: 'upcl',
        boardName: 'Uttarakhand Power Corporation Ltd',
        shortName: 'UPCL',
        officialUrl: 'https://www.upcl.org',
        categories: [
          {
            categoryId: 'upcl-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('upcl-domestic-demo', 'UPCL Domestic — Demo', {
                fixedCharge: 45, flatRate: 4.50,
                sourceUrl: 'https://www.uerc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 28. West Bengal ────────────────────────────────────────────────────────
  {
    stateId: 'wb',
    boards: [
      {
        boardId: 'wbsedcl',
        boardName: 'West Bengal State Electricity Distribution Company Ltd',
        shortName: 'WBSEDCL',
        officialUrl: 'https://www.wbsedcl.in',
        categories: [
          {
            categoryId: 'wbsedcl-domestic',
            categoryName: 'Domestic (LT-A)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('wbsedcl-domestic-flat-demo', 'WBSEDCL Domestic Flat — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 40, flatRate: 5.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.wberc.gov.in',
              }),
              demoSchedule('wbsedcl-domestic-tou-demo', 'WBSEDCL Domestic TOU — Demo', {
                tariffType: 'tou',
                billingPeriod: 'bimonthly',
                fixedCharge: 60, flatRate: 5.00,
                offPeakRate: 3.30, shoulderRate: 5.00, peakRate: 7.80,
                taxDutyPercent: 5,
                sourceUrl: 'https://www.wberc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'wbsedcl-commercial',
            categoryName: 'Commercial (LT-B)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('wbsedcl-commercial-demo', 'WBSEDCL Commercial — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 100, flatRate: 7.00, taxDutyPercent: 5,
                sourceUrl: 'https://www.wberc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'wbsedcl-industrial',
            categoryName: 'Industrial LT (LT-C)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('wbsedcl-industrial-demo', 'WBSEDCL Industrial LT — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 200, flatRate: 8.50, taxDutyPercent: 5,
                sourceUrl: 'https://www.wberc.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'cesc',
        boardName: 'CESC Ltd — Kolkata',
        shortName: 'CESC',
        officialUrl: 'https://www.cesc.co.in',
        categories: [
          {
            categoryId: 'cesc-domestic',
            categoryName: 'Domestic (LT-A)',
            description: 'Residential consumers in Kolkata area',
            schedules: [
              demoSchedule('cesc-domestic-demo', 'CESC Domestic — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 45, flatRate: 5.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.cesc.co.in',
              }),
            ],
          },
          {
            categoryId: 'cesc-commercial',
            categoryName: 'Commercial (LT-B)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('cesc-commercial-demo', 'CESC Commercial — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 110, flatRate: 7.20, taxDutyPercent: 5,
                sourceUrl: 'https://www.cesc.co.in',
              }),
            ],
          },
          {
            categoryId: 'cesc-industrial',
            categoryName: 'Industrial LT (LT-C)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('cesc-industrial-demo', 'CESC Industrial LT — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 220, flatRate: 8.80, taxDutyPercent: 5,
                sourceUrl: 'https://www.cesc.co.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 29. Andaman and Nicobar Islands ────────────────────────────────────────
  {
    stateId: 'an',
    boards: [
      {
        boardId: 'andaman-ded',
        boardName: 'Electricity Department, Andaman and Nicobar Administration',
        shortName: 'ED A&N',
        officialUrl: 'https://electricity.andaman.gov.in',
        categories: [
          {
            categoryId: 'ed-an-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('ed-an-domestic-demo', 'ED A&N Domestic — Demo', {
                fixedCharge: 30, flatRate: 4.00,
                sourceUrl: 'https://electricity.andaman.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 30. Chandigarh ─────────────────────────────────────────────────────────
  {
    stateId: 'ch',
    boards: [
      {
        boardId: 'ced',
        boardName: 'Chandigarh Electricity Department',
        shortName: 'CED',
        officialUrl: 'https://chdelectricity.nic.in',
        categories: [
          {
            categoryId: 'ced-domestic',
            categoryName: 'Domestic (DS)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('ced-domestic-demo', 'CED Domestic — Demo', {
                fixedCharge: 50, flatRate: 4.00,
                sourceUrl: 'https://chdelectricity.nic.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 31. Dadra and Nagar Haveli and Daman and Diu ───────────────────────────
  {
    stateId: 'dd',
    boards: [
      {
        boardId: 'dnh-ded',
        boardName: 'Department of Electricity, Dadra and Nagar Haveli and Daman and Diu',
        shortName: 'DE DNH&DD',
        officialUrl: 'https://www.daman.nic.in',
        categories: [
          {
            categoryId: 'de-dd-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('de-dd-domestic-demo', 'DE DNH&DD Domestic — Demo', {
                fixedCharge: 30, flatRate: 3.50,
                sourceUrl: 'https://www.daman.nic.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 32. Delhi ──────────────────────────────────────────────────────────────
  {
    stateId: 'dl',
    boards: [
      {
        boardId: 'bses-rajdhani',
        boardName: 'BSES Rajdhani Power Ltd',
        shortName: 'BRPL',
        officialUrl: 'https://www.bsesdelhi.com',
        categories: [
          {
            categoryId: 'brpl-domestic',
            categoryName: 'Domestic (DS)',
            description: 'Residential consumers in South/West Delhi',
            schedules: [
              demoSchedule('brpl-domestic-flat-demo', 'BRPL Domestic Flat — Demo', {
                fixedCharge: 50, flatRate: 5.00, taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
              demoSchedule('brpl-domestic-tou-demo', 'BRPL Domestic TOU — Demo', {
                tariffType: 'tou',
                fixedCharge: 70, flatRate: 5.00,
                offPeakRate: 3.50, shoulderRate: 5.00, peakRate: 8.00,
                taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'brpl-commercial',
            categoryName: 'Commercial (NDS)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('brpl-commercial-demo', 'BRPL Commercial — Demo', {
                fixedCharge: 150, flatRate: 8.50, taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'brpl-industrial',
            categoryName: 'Industrial LT (IS)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('brpl-industrial-demo', 'BRPL Industrial LT — Demo', {
                fixedCharge: 250, flatRate: 9.50, taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'bses-yamuna',
        boardName: 'BSES Yamuna Power Ltd',
        shortName: 'BYPL',
        officialUrl: 'https://www.bsesdelhi.com',
        categories: [
          {
            categoryId: 'bypl-domestic',
            categoryName: 'Domestic (DS)',
            description: 'Residential consumers in East/Central Delhi',
            schedules: [
              demoSchedule('bypl-domestic-flat-demo', 'BYPL Domestic Flat — Demo', {
                fixedCharge: 50, flatRate: 5.00, taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
              demoSchedule('bypl-domestic-tou-demo', 'BYPL Domestic TOU — Demo', {
                tariffType: 'tou',
                fixedCharge: 70, flatRate: 5.00,
                offPeakRate: 3.50, shoulderRate: 5.00, peakRate: 8.00,
                taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'bypl-commercial',
            categoryName: 'Commercial (NDS)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('bypl-commercial-demo', 'BYPL Commercial — Demo', {
                fixedCharge: 150, flatRate: 8.50, taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'bypl-industrial',
            categoryName: 'Industrial LT (IS)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('bypl-industrial-demo', 'BYPL Industrial LT — Demo', {
                fixedCharge: 250, flatRate: 9.50, taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
            ],
          },
        ],
      },
      {
        boardId: 'tpddl',
        boardName: 'Tata Power Delhi Distribution Ltd',
        shortName: 'TPDDL',
        officialUrl: 'https://www.tatapower-ddl.com',
        categories: [
          {
            categoryId: 'tpddl-domestic',
            categoryName: 'Domestic (DS)',
            description: 'Residential consumers in North/Northwest Delhi',
            schedules: [
              demoSchedule('tpddl-domestic-flat-demo', 'TPDDL Domestic Flat — Demo', {
                fixedCharge: 50, flatRate: 5.00, taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
              demoSchedule('tpddl-domestic-tou-demo', 'TPDDL Domestic TOU — Demo', {
                tariffType: 'tou',
                fixedCharge: 70, flatRate: 5.00,
                offPeakRate: 3.50, shoulderRate: 5.00, peakRate: 8.00,
                taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'tpddl-commercial',
            categoryName: 'Commercial (NDS)',
            description: 'Commercial consumers',
            schedules: [
              demoSchedule('tpddl-commercial-demo', 'TPDDL Commercial — Demo', {
                fixedCharge: 150, flatRate: 8.50, taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
            ],
          },
          {
            categoryId: 'tpddl-industrial',
            categoryName: 'Industrial LT (IS)',
            description: 'LT industrial consumers',
            schedules: [
              demoSchedule('tpddl-industrial-demo', 'TPDDL Industrial LT — Demo', {
                fixedCharge: 250, flatRate: 9.50, taxDutyPercent: 8,
                sourceUrl: 'https://www.derc.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 33. Jammu and Kashmir ──────────────────────────────────────────────────
  {
    stateId: 'jk',
    boards: [
      {
        boardId: 'jkpdd',
        boardName: 'Jammu and Kashmir Power Distribution Corporation Ltd',
        shortName: 'JKPDCL',
        officialUrl: 'https://jkpdcl.nic.in',
        categories: [
          {
            categoryId: 'jkpdcl-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('jkpdcl-domestic-demo', 'JKPDCL Domestic — Demo', {
                fixedCharge: 40, flatRate: 3.80,
                sourceUrl: 'https://jkpdcl.nic.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 34. Ladakh ─────────────────────────────────────────────────────────────
  {
    stateId: 'la',
    boards: [
      {
        boardId: 'ladakh-pdd',
        boardName: 'Power Development Department, Ladakh',
        shortName: 'PDD Ladakh',
        officialUrl: 'https://ladakh.gov.in',
        categories: [
          {
            categoryId: 'pdd-la-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('pdd-la-domestic-demo', 'PDD Ladakh Domestic — Demo', {
                fixedCharge: 30, flatRate: 3.00,
                sourceUrl: 'https://ladakh.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 35. Lakshadweep ────────────────────────────────────────────────────────
  {
    stateId: 'ld',
    boards: [
      {
        boardId: 'lakshadweep-ed',
        boardName: 'Electricity Department, Lakshadweep Administration',
        shortName: 'ED Lakshadweep',
        officialUrl: 'https://lakshadweep.gov.in',
        categories: [
          {
            categoryId: 'ed-ld-domestic',
            categoryName: 'Domestic (LT)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('ed-ld-domestic-demo', 'ED Lakshadweep Domestic — Demo', {
                fixedCharge: 20, flatRate: 2.50,
                sourceUrl: 'https://lakshadweep.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },

  // ── 36. Puducherry ─────────────────────────────────────────────────────────
  {
    stateId: 'py',
    boards: [
      {
        boardId: 'pned',
        boardName: 'Electricity Department, Puducherry',
        shortName: 'ED Puducherry',
        officialUrl: 'https://electricity.py.gov.in',
        categories: [
          {
            categoryId: 'ed-py-domestic',
            categoryName: 'Domestic (LT-I)',
            description: 'Residential consumers',
            schedules: [
              demoSchedule('ed-py-domestic-demo', 'ED Puducherry Domestic — Demo', {
                billingPeriod: 'bimonthly',
                fixedCharge: 25, flatRate: 3.50,
                sourceUrl: 'https://electricity.py.gov.in',
              }),
            ],
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Returns all boards for the given stateId.
 * Returns an empty array for unknown states.
 */
export function getBoardsByState(stateId: string): BoardEntry[] {
  const entry = INDIA_BOARDS.find((s) => s.stateId === stateId);
  return entry ? entry.boards : [];
}

/**
 * Returns all consumer categories for a given state + board combination.
 * Returns an empty array when the board is not found.
 */
export function getCategoriesByBoard(stateId: string, boardId: string): ConsumerCategory[] {
  const boards = getBoardsByState(stateId);
  const board = boards.find((b) => b.boardId === boardId);
  return board ? board.categories : [];
}

/**
 * Returns all tariff schedules for a given state + board + category combination.
 * Returns an empty array when the category is not found.
 */
export function getSchedulesByCategory(
  stateId: string,
  boardId: string,
  categoryId: string
): TariffSchedule[] {
  const categories = getCategoriesByBoard(stateId, boardId);
  const category = categories.find((c) => c.categoryId === categoryId);
  return category ? category.schedules : [];
}

// ---------------------------------------------------------------------------
// Converter — TariffSchedule → TariffPlan
// ---------------------------------------------------------------------------

/**
 * Converts a TariffSchedule from indiaBoards.ts to the TariffPlan interface
 * expected by the billing engine and comparison page.
 *
 * The returned description records the verification status and board name so
 * callers can always trace which board/schedule was used.
 */
export function scheduleToTariffPlan(
  schedule: TariffSchedule,
  boardName: string
): TariffPlan {
  return {
    id: schedule.scheduleId,
    name: schedule.scheduleName,
    fixedCharge: schedule.fixedCharge,
    offPeakRate: schedule.offPeakRate,
    shoulderRate: schedule.shoulderRate,
    peakRate: schedule.peakRate,
    taxDutyPercent: schedule.taxDutyPercent,
    surcharge: schedule.surcharge,
    description: `${schedule.verificationStatus} (${boardName})`,
  };
}
