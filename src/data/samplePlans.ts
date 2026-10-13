/**
 * samplePlans.ts
 *
 * WattWise demonstration tariff plans and usage profiles.
 * These are FICTIONAL rates — not official electricity tariffs.
 *
 * Recommendation-switching verification (no taxes/surcharges):
 *
 * Balanced Household (offPeak=120, shoulder=150, peak=80, total=350):
 *   Flat Saver:  350 × 6.25 + 120 = 2307.50
 *   Smart TOU:   120×4.25 + 150×6.00 + 80×9.00 + 150 = 510+900+720+150 = 2280.00
 *   → Smart TOU wins  ✓
 *
 * Peak-Heavy Household (offPeak=70, shoulder=110, peak=170, total=350):
 *   Flat Saver:  350 × 6.25 + 120 = 2307.50
 *   Smart TOU:   70×4.25 + 110×6.00 + 170×9.00 + 150 = 297.5+660+1530+150 = 2637.50
 *   → Flat Saver wins  ✓
 */

import type { TariffPlan, ConsumptionInput } from '../types/index.js';

// ---------------------------------------------------------------------------
// Sample tariff plans
// ---------------------------------------------------------------------------

export const SAMPLE_PLANS: TariffPlan[] = [
  {
    id: 'plan-flat-saver',
    name: 'Flat Saver',
    fixedCharge: 120,
    offPeakRate: 6.25,
    shoulderRate: 6.25,
    peakRate: 6.25,
    taxDutyPercent: 0,
    surcharge: 0,
    description:
      'A simple flat-rate plan with no time-of-use differentiation. Predictable billing regardless of when you use electricity.',
  },
  {
    id: 'plan-smart-tou',
    name: 'Smart TOU',
    fixedCharge: 150,
    offPeakRate: 4.25,
    shoulderRate: 6.00,
    peakRate: 9.00,
    taxDutyPercent: 0,
    surcharge: 0,
    description:
      'A time-of-use plan with low off-peak rates and higher peak rates. Rewards shifting consumption away from peak hours.',
  },
];

// ---------------------------------------------------------------------------
// Demo consumption profiles
// ---------------------------------------------------------------------------

export interface DemoProfile {
  label: string;
  consumption: ConsumptionInput;
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    label: 'Balanced Household',
    consumption: {
      offPeak: 120,
      shoulder: 150,
      peak: 80,
      total: 350,
      consumerType: 'household',
      billingPeriod: 'monthly',
    },
  },
  {
    label: 'Peak-Heavy Household',
    consumption: {
      offPeak: 70,
      shoulder: 110,
      peak: 170,
      total: 350,
      consumerType: 'household',
      billingPeriod: 'monthly',
    },
  },
  {
    label: 'Small Daytime Business',
    consumption: {
      offPeak: 90,
      shoulder: 300,
      peak: 160,
      total: 550,
      consumerType: 'small-business',
      billingPeriod: 'monthly',
    },
  },
];
