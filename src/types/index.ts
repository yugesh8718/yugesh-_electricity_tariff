/**
 * WattWise — Core TypeScript interfaces and types.
 * All pure data shapes; no React imports.
 */

// ---------------------------------------------------------------------------
// Consumption input
// ---------------------------------------------------------------------------

export interface ConsumptionInput {
  offPeak: number;
  shoulder: number;
  peak: number;
  total: number;
  consumerType: 'household' | 'small-business';
  billingPeriod: 'monthly' | 'bimonthly';
  /** Optional electricity provider name */
  providerName?: string;
  /** Optional tariff schedule code */
  tariffCode?: string;
}

// ---------------------------------------------------------------------------
// Tariff plan
// ---------------------------------------------------------------------------

export interface TariffPlan {
  id: string;
  name: string;
  /** Fixed supply / service charge per billing period (monthly) */
  fixedCharge: number;
  offPeakRate: number;
  shoulderRate: number;
  peakRate: number;
  /** Electricity duty / tax as a percentage of subtotal */
  taxDutyPercent: number;
  /** Additional surcharge in rupees */
  surcharge: number;
  /** Optional description */
  description?: string;
}

// ---------------------------------------------------------------------------
// Bill breakdown
// ---------------------------------------------------------------------------

export interface BillBreakdown {
  planId: string;
  planName: string;
  offPeakCharge: number;
  shoulderCharge: number;
  peakCharge: number;
  energyCharge: number;
  fixedCharge: number;
  surcharge: number;
  subtotal: number;
  duty: number;
  estimatedTotal: number;
  effectiveCostPerKwh: number;
}

// ---------------------------------------------------------------------------
// Usage fingerprint
// ---------------------------------------------------------------------------

export type FingerprintLabel =
  | 'Off-Peak Optimiser'
  | 'Balanced Household'
  | 'Peak-Heavy Household'
  | 'Daytime Dominant'
  | 'Daytime Small Business'
  | 'High Fixed-Load Consumer';

export interface UsageFingerprint {
  label: FingerprintLabel;
  offPeakShare: number;
  shoulderShare: number;
  peakShare: number;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Break-even result
// ---------------------------------------------------------------------------

export interface BreakEvenResult {
  crossoverExists: boolean;
  /** Peak share percentage (0–100) at which cheapest plan switches */
  crossoverPeakPercent: number | null;
  /** Plan that is cheaper below the crossover */
  lowerPeakPlanId: string | null;
  /** Plan that is cheaper above the crossover */
  higherPeakPlanId: string | null;
  /** Human-readable explanation */
  explanation: string;
}

// ---------------------------------------------------------------------------
// Risk scenario (single cell in the 5×5 matrix)
// ---------------------------------------------------------------------------

export interface RiskScenario {
  consumptionMultiplier: number;
  peakShiftDelta: number;
  /** Adjusted consumption for this scenario */
  adjustedConsumption: ConsumptionInput;
  /** Bills indexed by planId */
  bills: Record<string, number>;
  /** planId of cheapest plan in this scenario */
  cheapestPlanId: string;
}

// ---------------------------------------------------------------------------
// Risk shield aggregated result
// ---------------------------------------------------------------------------

export interface PlanStats {
  planId: string;
  planName: string;
  scenariosWon: number;
  stabilityPercent: number;
  maxCost: number;
  avgCost: number;
  worstCaseCost: number;
  bestCaseCost: number;
}

export interface RiskShieldResult {
  scenarios: RiskScenario[];
  planStats: PlanStats[];
  recommendationConfidence: number;
  cheapestTodayPlanId: string;
  mostStablePlanId: string;
  lowestWorstCasePlanId: string;
}

// ---------------------------------------------------------------------------
// Regret guard
// ---------------------------------------------------------------------------

export interface RegretResult {
  selectedPlanId: string;
  avgRegret: number;
  maxRegret: number;
  maxRegretScenario: RiskScenario | null;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Peak shift advisor
// ---------------------------------------------------------------------------

export interface ShiftScenario {
  shiftPercent: number;
  unitsShifted: number;
  newPeakPercent: number;
  adjustedConsumption: ConsumptionInput;
  bills: BillBreakdown[];
  /** Savings vs original bill, indexed by planId */
  savings: Record<string, number>;
  /** Whether the recommended plan changes after the shift */
  recommendationChanges: boolean;
  /** New recommended planId after shift */
  newRecommendedPlanId: string;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Comparison result (top-level orchestration output)
// ---------------------------------------------------------------------------

export interface ComparisonResult {
  id?: string;
  timestamp: string;
  consumption: ConsumptionInput;
  plans: TariffPlan[];
  bills: BillBreakdown[];
  recommendedPlanId: string;
  fingerprint: UsageFingerprint;
  breakEven: BreakEvenResult;
  riskShield: RiskShieldResult;
  regret: RegretResult;
  shiftScenarios: ShiftScenario[];
  explanation: string;
}
