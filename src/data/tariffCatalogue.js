/**
 * tariffCatalogue.js
 *
 * Consumer categories and tariff schedules for the local catalogue.
 *
 * IMPORTANT — DATA INTEGRITY POLICY:
 *   dataStatus: 'verified'           — rates sourced from an official tariff order.
 *   dataStatus: 'needs-verification' — schedule exists but numeric rates are NOT confirmed.
 *                                       The UI will show the schedule but block calculation.
 *   dataStatus: 'not-configured'     — placeholder only.
 *
 * Do NOT invent rates. All numeric values in 'verified' schedules come from
 * official SERC / DISCOM tariff orders; the source URL and effectiveFrom date
 * are recorded. When a source could not be confirmed, needsVerification is set
 * and rates are omitted so no misleading bill can be calculated.
 *
 * Currently verified data:
 *   - DVVNL (UP) Domestic LMV-1 FY 2023-24 and FY 2024-25
 *     (illustrative rates used in the demo; marked 'demo' in demoTariffs.js;
 *      these entries here use dataStatus: 'needs-verification' because the
 *      exact UPERC slab figures have not been independently confirmed.)
 *
 * All other schedules use dataStatus: 'needs-verification'.
 */

// ── Consumer category definitions ────────────────────────────────────────────

/**
 * @typedef {{ id: string, discomId: string, name: string, description: string }} Category
 */
export const CATEGORIES = [
  // DVVNL (UP)
  { id: 'dvvnl-domestic',     discomId: 'dvvnl',    name: 'Domestic / Residential (LMV-1)',  description: 'Residential consumers, single-phase, up to 2 kW sanctioned load' },
  { id: 'dvvnl-commercial',   discomId: 'dvvnl',    name: 'Commercial / Non-Domestic (LMV-2)', description: 'Shops, offices, and other non-domestic consumers' },
  { id: 'dvvnl-industrial-lt',discomId: 'dvvnl',    name: 'Industrial — Low Tension (LMV-6)', description: 'Small industrial units on LT supply' },
  { id: 'dvvnl-agricultural', discomId: 'dvvnl',    name: 'Agricultural (LMV-5)',             description: 'Irrigation pumpsets and agricultural use' },

  // PVVNL (UP)
  { id: 'pvvnl-domestic',     discomId: 'pvvnl',    name: 'Domestic / Residential (LMV-1)',  description: 'Residential consumers, single-phase, up to 2 kW sanctioned load' },
  { id: 'pvvnl-commercial',   discomId: 'pvvnl',    name: 'Commercial / Non-Domestic (LMV-2)', description: 'Shops, offices' },

  // MVVNL (UP)
  { id: 'mvvnl-domestic',     discomId: 'mvvnl',    name: 'Domestic / Residential (LMV-1)',  description: 'Residential consumers' },

  // PuVVNL (UP)
  { id: 'puvvnl-domestic',    discomId: 'puvvnl',   name: 'Domestic / Residential (LMV-1)',  description: 'Residential consumers' },

  // KESCO (UP)
  { id: 'kesco-domestic',     discomId: 'kesco',    name: 'Domestic / Residential',          description: 'Kanpur domestic consumers' },

  // BESCOM (Karnataka)
  { id: 'bescom-domestic',    discomId: 'bescom',   name: 'Domestic (LT-2)',                 description: 'LT domestic consumers in Bangalore circle' },
  { id: 'bescom-commercial',  discomId: 'bescom',   name: 'Commercial (LT-5)',               description: 'LT commercial consumers' },

  // MSEDCL (Maharashtra)
  { id: 'msedcl-domestic',    discomId: 'mahadiscom', name: 'Domestic (LT-1)',               description: 'LT domestic residential consumers' },
  { id: 'msedcl-commercial',  discomId: 'mahadiscom', name: 'Commercial (LT-2)',             description: 'LT commercial consumers' },

  // KSEB (Kerala)
  { id: 'kseb-domestic',      discomId: 'kseb',     name: 'Domestic (LT-I)',                 description: 'LT domestic consumers' },

  // TANGEDCO (Tamil Nadu)
  { id: 'tangedco-domestic',  discomId: 'tangedco', name: 'Domestic (LT-I)',                 description: 'LT domestic consumers' },

  // BSES Rajdhani (Delhi)
  { id: 'brpl-domestic',      discomId: 'bses-rajdhani', name: 'Domestic',                  description: 'Residential domestic consumers' },

  // TPDDL (Delhi)
  { id: 'tpddl-domestic',     discomId: 'tpddl',    name: 'Domestic',                        description: 'Residential domestic consumers' },

  // BSES Yamuna (Delhi)
  { id: 'bypl-domestic',      discomId: 'bses-yamuna', name: 'Domestic',                     description: 'Residential domestic consumers' },

  // PSPCL (Punjab)
  { id: 'pspcl-domestic',     discomId: 'pspcl',    name: 'Domestic (DS)',                   description: 'Domestic supply consumers' },

  // JVVNL (Rajasthan)
  { id: 'jvvnl-domestic',     discomId: 'jvvnl',    name: 'Domestic (LV-1)',                 description: 'Domestic residential consumers' },

  // WBSEDCL (West Bengal)
  { id: 'wbsedcl-domestic',   discomId: 'wbsedcl',  name: 'Domestic (LT-A)',                 description: 'LT domestic consumers' },
];

// ── Tariff schedule definitions ───────────────────────────────────────────────

/**
 * @typedef {Object} TariffSchedule
 * @property {string}  id
 * @property {string}  discomId
 * @property {string}  categoryId
 * @property {string}  code
 * @property {string}  displayName
 * @property {string}  [description]
 * @property {'monthly'|'bimonthly'} billingPeriod
 * @property {string}  [effectiveFrom]
 * @property {string}  [effectiveTo]
 * @property {'verified'|'needs-verification'|'not-configured'} dataStatus
 * @property {Array}   [slabs]        present only when dataStatus === 'verified'
 * @property {Array}   [fixedCharges]
 * @property {Array}   [taxes]
 * @property {string}  [officialSourceUrl]
 */
export const TARIFF_SCHEDULES = [
  // ── DVVNL — Domestic LMV-1 ────────────────────────────────────────────────
  // Official schedule entries — rates not independently confirmed; calculation blocked.
  {
    id: 'dvvnl-lmv1-fy2324',
    discomId: 'dvvnl',
    categoryId: 'dvvnl-domestic',
    code: 'LMV-1',
    displayName: 'DVVNL Domestic LMV-1 — FY 2023-24',
    description: 'Domestic residential, single-phase, up to 2 kW',
    billingPeriod: 'monthly',
    effectiveFrom: '2023-04-01',
    effectiveTo: '2024-03-31',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.uperc.org',
    notes: 'Rates need confirmation from the official UPERC tariff order. Use the Demo schedule to try the calculator.',
  },
  {
    id: 'dvvnl-lmv1-fy2425',
    discomId: 'dvvnl',
    categoryId: 'dvvnl-domestic',
    code: 'LMV-1',
    displayName: 'DVVNL Domestic LMV-1 — FY 2024-25',
    description: 'Domestic residential, single-phase, up to 2 kW',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    effectiveTo: '2025-03-31',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.uperc.org',
    notes: 'Rates need confirmation from the official UPERC tariff order. Use the Demo schedule to try the calculator.',
  },
  // Demonstration schedule for DVVNL — sample rates from demoTariffs.js.
  // ⚠️ DEMO DATA — NOT OFFICIAL UPERC RATES.
  {
    id: 'dvvnl-lmv1-demo',
    discomId: 'dvvnl',
    categoryId: 'dvvnl-domestic',
    code: 'LMV-1 (Demo)',
    displayName: 'DVVNL Domestic LMV-1 — DEMO (Sample rates)',
    description: 'Demonstration schedule with illustrative slab rates. NOT official UPERC rates.',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'demo',
    isDemoOnly: true,
    officialSourceUrl: 'https://www.uperc.org',
    notes:
      '⚠️ DEMO DATA — NOT VERIFIED OFFICIAL UPERC/DVVNL RATES. ' +
      'Sample rates for demonstration only. Do not use for actual billing.',
    slabs: [
      { from: 0,   to: 100,  ratePerUnit: 3.35 },
      { from: 100, to: 150,  ratePerUnit: 4.20 },
      { from: 150, to: 300,  ratePerUnit: 5.50 },
      { from: 300, to: null, ratePerUnit: 6.20 },
    ],
    fixedCharges: [
      { label: 'Fixed Charge (Demo)', amount: 105, basis: 'monthly' },
    ],
    dutyPercent: 5,
  },

  // ── DVVNL — Commercial LMV-2 ─────────────────────────────────────────────
  {
    id: 'dvvnl-lmv2-fy2425',
    discomId: 'dvvnl',
    categoryId: 'dvvnl-commercial',
    code: 'LMV-2',
    displayName: 'DVVNL Commercial LMV-2 — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    effectiveTo: '2025-03-31',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.uperc.org',
    notes: 'Rates need confirmation from the official UPERC tariff order.',
  },

  // ── DVVNL — Industrial LT LMV-6 ──────────────────────────────────────────
  {
    id: 'dvvnl-lmv6-fy2425',
    discomId: 'dvvnl',
    categoryId: 'dvvnl-industrial-lt',
    code: 'LMV-6',
    displayName: 'DVVNL Industrial LT LMV-6 — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.uperc.org',
    notes: 'Rates need confirmation from the official UPERC tariff order.',
  },

  // ── DVVNL — Agricultural LMV-5 ───────────────────────────────────────────
  {
    id: 'dvvnl-lmv5-fy2425',
    discomId: 'dvvnl',
    categoryId: 'dvvnl-agricultural',
    code: 'LMV-5',
    displayName: 'DVVNL Agricultural LMV-5 — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.uperc.org',
    notes: 'Rates need confirmation from the official UPERC tariff order.',
  },

  // ── PVVNL Domestic ────────────────────────────────────────────────────────
  {
    id: 'pvvnl-lmv1-fy2425',
    discomId: 'pvvnl',
    categoryId: 'pvvnl-domestic',
    code: 'LMV-1',
    displayName: 'PVVNL Domestic LMV-1 — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.uperc.org',
    notes: 'Rates need confirmation from the official UPERC tariff order.',
  },

  // ── MVVNL Domestic ────────────────────────────────────────────────────────
  {
    id: 'mvvnl-lmv1-fy2425',
    discomId: 'mvvnl',
    categoryId: 'mvvnl-domestic',
    code: 'LMV-1',
    displayName: 'MVVNL Domestic LMV-1 — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.uperc.org',
    notes: 'Rates need confirmation from the official UPERC tariff order.',
  },

  // ── PuVVNL Domestic ───────────────────────────────────────────────────────
  {
    id: 'puvvnl-lmv1-fy2425',
    discomId: 'puvvnl',
    categoryId: 'puvvnl-domestic',
    code: 'LMV-1',
    displayName: 'PuVVNL Domestic LMV-1 — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.uperc.org',
    notes: 'Rates need confirmation from the official UPERC tariff order.',
  },

  // ── KESCO Domestic ────────────────────────────────────────────────────────
  {
    id: 'kesco-domestic-fy2425',
    discomId: 'kesco',
    categoryId: 'kesco-domestic',
    code: 'LMV-1',
    displayName: 'KESCO Domestic — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.kesco.co.in',
    notes: 'Rates need confirmation from the official UPERC / KESCO tariff order.',
  },

  // ── BESCOM Domestic ───────────────────────────────────────────────────────
  {
    id: 'bescom-lt2-fy2425',
    discomId: 'bescom',
    categoryId: 'bescom-domestic',
    code: 'LT-2',
    displayName: 'BESCOM Domestic LT-2 — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.bescom.co.in',
    notes: 'Rates need confirmation from the official KERC tariff order.',
  },

  // ── MSEDCL Domestic ───────────────────────────────────────────────────────
  {
    id: 'msedcl-lt1-fy2425',
    discomId: 'mahadiscom',
    categoryId: 'msedcl-domestic',
    code: 'LT-1',
    displayName: 'MSEDCL Domestic LT-1 — FY 2024-25',
    billingPeriod: 'bimonthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.mahadiscom.in',
    notes: 'Rates need confirmation from the official MERC tariff order.',
  },

  // ── KSEB Domestic ─────────────────────────────────────────────────────────
  {
    id: 'kseb-lti-fy2425',
    discomId: 'kseb',
    categoryId: 'kseb-domestic',
    code: 'LT-I',
    displayName: 'KSEB Domestic LT-I — FY 2024-25',
    billingPeriod: 'bimonthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.kseb.in',
    notes: 'Rates need confirmation from the official KSERC tariff order.',
  },

  // ── TANGEDCO Domestic ─────────────────────────────────────────────────────
  // Official schedule — rates not yet independently confirmed from TNERC order.
  {
    id: 'tangedco-lti-fy2425',
    discomId: 'tangedco',
    categoryId: 'tangedco-domestic',
    code: 'LT-I',
    displayName: 'TANGEDCO Domestic LT-I — FY 2024-25',
    billingPeriod: 'bimonthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.tangedco.gov.in',
    notes: 'Rates need confirmation from the official TNERC tariff order. Use the Demo schedule below to try the calculator.',
  },
  // Demonstration schedule — clearly labelled sample rates for learning and testing.
  // ⚠️ DEMO DATA — NOT OFFICIAL TANGEDCO RATES. Do not use for actual billing.
  // These slab boundaries and rates are illustrative only. They do not represent
  // any past, present, or future TANGEDCO/TNERC tariff order.
  {
    id: 'tangedco-lti-demo',
    discomId: 'tangedco',
    categoryId: 'tangedco-domestic',
    code: 'LT-I (Demo)',
    displayName: 'TANGEDCO Domestic LT-I — DEMO (Sample rates)',
    description: 'Demonstration schedule with sample slab rates. NOT official TANGEDCO rates.',
    billingPeriod: 'bimonthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'demo',
    isDemoOnly: true,
    officialSourceUrl: 'https://www.tangedco.gov.in',
    notes:
      '⚠️ DEMO DATA — NOT VERIFIED OFFICIAL TANGEDCO RATES. ' +
      'These are sample slab rates for demonstration and learning only. ' +
      'They do not represent an official TNERC tariff order. ' +
      'Do not use this for actual electricity bill calculations.',
    // Sample slabs: bimonthly (2-month) consumption bands with illustrative rates
    slabs: [
      { from: 0,   to: 100,  ratePerUnit: 0.00 },  // first 100 units free (illustrative)
      { from: 100, to: 200,  ratePerUnit: 1.50 },
      { from: 200, to: 500,  ratePerUnit: 3.00 },
      { from: 500, to: null, ratePerUnit: 5.00 },
    ],
    fixedCharges: [
      { label: 'Fixed Charge (Demo)', amount: 30, basis: 'monthly' },
    ],
    dutyPercent: 5,
    minimumCharge: 0,
  },

  // ── BRPL Domestic (Delhi) ─────────────────────────────────────────────────
  {
    id: 'brpl-domestic-fy2425',
    discomId: 'bses-rajdhani',
    categoryId: 'brpl-domestic',
    code: 'Domestic',
    displayName: 'BSES Rajdhani Domestic — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.derc.gov.in',
    notes: 'Rates need confirmation from the official DERC tariff order.',
  },

  // ── TPDDL Domestic (Delhi) ────────────────────────────────────────────────
  {
    id: 'tpddl-domestic-fy2425',
    discomId: 'tpddl',
    categoryId: 'tpddl-domestic',
    code: 'Domestic',
    displayName: 'TPDDL Domestic — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.derc.gov.in',
    notes: 'Rates need confirmation from the official DERC tariff order.',
  },

  // ── BYPL Domestic (Delhi) ─────────────────────────────────────────────────
  {
    id: 'bypl-domestic-fy2425',
    discomId: 'bses-yamuna',
    categoryId: 'bypl-domestic',
    code: 'Domestic',
    displayName: 'BSES Yamuna Domestic — FY 2024-25',
    billingPeriod: 'monthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.derc.gov.in',
    notes: 'Rates need confirmation from the official DERC tariff order.',
  },

  // ── PSPCL Domestic (Punjab) ───────────────────────────────────────────────
  {
    id: 'pspcl-ds-fy2425',
    discomId: 'pspcl',
    categoryId: 'pspcl-domestic',
    code: 'DS',
    displayName: 'PSPCL Domestic Supply — FY 2024-25',
    billingPeriod: 'bimonthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.pserc.gov.in',
    notes: 'Rates need confirmation from the official PSERC tariff order.',
  },

  // ── JVVNL Domestic (Rajasthan) ────────────────────────────────────────────
  {
    id: 'jvvnl-lv1-fy2425',
    discomId: 'jvvnl',
    categoryId: 'jvvnl-domestic',
    code: 'LV-1',
    displayName: 'JVVNL Domestic LV-1 — FY 2024-25',
    billingPeriod: 'bimonthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://rerc.rajasthan.gov.in',
    notes: 'Rates need confirmation from the official RERC tariff order.',
  },

  // ── WBSEDCL Domestic (West Bengal) ───────────────────────────────────────
  {
    id: 'wbsedcl-lta-fy2425',
    discomId: 'wbsedcl',
    categoryId: 'wbsedcl-domestic',
    code: 'LT-A',
    displayName: 'WBSEDCL Domestic LT-A — FY 2024-25',
    billingPeriod: 'bimonthly',
    effectiveFrom: '2024-04-01',
    dataStatus: 'needs-verification',
    officialSourceUrl: 'https://www.wbreda.org',
    notes: 'Rates need confirmation from the official WBERC tariff order.',
  },
];

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Get all categories for a DISCOM */
export function getCategoriesForDiscom(discomId) {
  return CATEGORIES.filter((c) => c.discomId === discomId);
}

/** Get all tariff schedules for a category */
export function getSchedulesForCategory(categoryId) {
  return TARIFF_SCHEDULES.filter((s) => s.categoryId === categoryId);
}

/** Get a schedule by ID */
export function getScheduleById(id) {
  return TARIFF_SCHEDULES.find((s) => s.id === id) ?? null;
}

/** True when a schedule can produce a calculation.
 *  Accepts:
 *    - dataStatus === 'verified'  (official confirmed rates)
 *    - dataStatus === 'demo'      (clearly labelled sample rates for demonstration)
 *  Both require at least one slab to be defined.
 */
export function isScheduleCalculable(schedule) {
  return (
    (schedule.dataStatus === 'verified' || schedule.dataStatus === 'demo') &&
    Array.isArray(schedule.slabs) &&
    schedule.slabs.length > 0
  );
}

/** True when the schedule uses demo/sample rates (not official verified data). */
export function isScheduleDemo(schedule) {
  return schedule.dataStatus === 'demo' || schedule.isDemoOnly === true;
}
