/**
 * demoTariffs.js
 *
 * Pure in-memory demo tariff data — NO Firebase imports.
 * Imported by both seedData.js (which adds the Firestore write functions)
 * and by tests (which must not require a Firebase connection).
 *
 * ⚠️  DEMO DATA — NOT VERIFIED OFFICIAL RATES ⚠️
 */

export const DEMO_STATE = {
  id: 'up',
  name: 'Uttar Pradesh',
  code: 'UP',
  active: true,
};

export const DEMO_DISCOM = {
  id: 'dvvnl',
  name: 'Dakshinanchal Vidyut Vitran Nigam Ltd',
  shortName: 'DVVNL',
  stateId: 'up',
  active: true,
};

export const DEMO_CATEGORY = {
  id: 'lmv1',
  name: 'Domestic LMV-1',
  description: 'Domestic residential consumers with sanctioned load up to 2 kW (single-phase)',
  discomId: 'dvvnl',
  active: true,
};

export const DEMO_TARIFFS = [
  {
    id: 'dvvnl-lmv1-2023',
    name: 'DVVNL Domestic LMV-1 — FY 2023-24',
    discomId: 'dvvnl',
    categoryId: 'lmv1',
    effectiveFrom: '2023-04-01',
    effectiveTo: '2024-03-31',
    status: 'demo',
    calculationMethod: 'progressive',
    slabs: [
      { upTo: 100,  ratePerUnit: 3.35 },
      { upTo: 150,  ratePerUnit: 4.20 },
      { upTo: 300,  ratePerUnit: 5.50 },
      { upTo: null, ratePerUnit: 6.20 },
    ],
    fixedCharges: [
      { label: 'Fixed Charge', amount: 105, basis: 'monthly' },
    ],
    otherCharges: [],
    taxes: [
      { label: 'Electricity Duty', percent: 5 },
    ],
    subsidies: [],
    sourceTitle: 'DEMO DATA — NOT VERIFIED OFFICIAL RATES',
    sourceUrl: '',
    sourceRef: 'Illustrative only — not from a UPERC official tariff order',
    notes:
      'DEMO DATA — NOT VERIFIED OFFICIAL RATES. ' +
      'Replace with data from the current UPERC tariff order before use.',
    lastVerified: null,
  },
  {
    id: 'dvvnl-lmv1-2024',
    name: 'DVVNL Domestic LMV-1 — FY 2024-25',
    discomId: 'dvvnl',
    categoryId: 'lmv1',
    effectiveFrom: '2024-04-01',
    effectiveTo: '2025-03-31',
    status: 'demo',
    calculationMethod: 'progressive',
    slabs: [
      { upTo: 100,  ratePerUnit: 3.55 },
      { upTo: 150,  ratePerUnit: 4.45 },
      { upTo: 300,  ratePerUnit: 5.80 },
      { upTo: null, ratePerUnit: 6.55 },
    ],
    fixedCharges: [
      { label: 'Fixed Charge', amount: 115, basis: 'monthly' },
    ],
    otherCharges: [],
    taxes: [
      { label: 'Electricity Duty', percent: 5 },
    ],
    subsidies: [],
    sourceTitle: 'DEMO DATA — NOT VERIFIED OFFICIAL RATES',
    sourceUrl: '',
    sourceRef: 'Illustrative only — not from a UPERC official tariff order',
    notes:
      'DEMO DATA — NOT VERIFIED OFFICIAL RATES. ' +
      'Replace with data from the current UPERC tariff order before use.',
    lastVerified: null,
  },
];
