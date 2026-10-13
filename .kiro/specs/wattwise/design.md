# WattWise — Design Specification

---

## 1. Architecture Overview

WattWise is a single-page application (SPA) built with React 19 + TypeScript + Vite. All business logic lives in pure TypeScript utility functions that are independent of React. Firebase provides authentication and cloud persistence. The app operates fully in guest/demo mode when Firebase is not configured.

```
┌─────────────────────────────────────────────────────┐
│  Browser SPA (React 19 + TypeScript + Vite)         │
│                                                     │
│  src/pages/        ← Route components               │
│  src/components/   ← Shared UI components           │
│  src/contexts/     ← AuthContext (Firebase state)   │
│  src/utils/        ← Pure TS calculation utilities  │
│  src/types/        ← TypeScript interfaces          │
│  src/data/         ← Static plan/rate data          │
│  src/lib/          ← Firebase wrappers, i18n        │
│  src/firebase/     ← Firebase config + guard        │
└───────────────────┬─────────────────────────────────┘
                    │ Firebase SDK (modular)
          ┌─────────┴──────────┐
          │  Firebase Auth     │  (Google sign-in)
          │  Cloud Firestore   │  (user data)
          └────────────────────┘
```

**Key constraints:**
- No Express backend.
- No external AI APIs.
- No auth state in localStorage.
- All monetary values displayed as ₹ with 2 decimal places.
- Currency symbol: ₹ (Indian Rupee).

---

## 2. Routes

| Path | Component | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/` | `LandingPage` | No | Hero + feature highlights |
| `/login` | `LoginPage` | No | Google sign-in |
| `/calculator` | `CalculatorPage` | No | Consumption input form |
| `/comparison` | `ComparisonPage` | No | Plan comparison results |
| `/digital-twin` | `DigitalTwinPage` | No | Usage fingerprint display |
| `/risk-shield` | `RiskShieldPage` | No | Scenario risk simulation |
| `/shift-advisor` | `ShiftAdvisorPage` | No | Peak Shift Advisor |
| `/plans` | `PlansPage` | No | Tariff plan library |
| `/saved` | `SavedPage` | Yes | Saved comparisons |
| `/profile` | `ProfilePage` | Yes | User profile |
| `*` | `NotFoundPage` | No | 404 page |

---

## 3. Component Tree

```
App.tsx
└── AuthProvider (AuthContext)
    └── Router
        └── Layout.tsx
            ├── TopBar.tsx
            │   ├── Logo
            │   ├── NavLinks
            │   └── AuthButton.tsx
            ├── <Outlet />
            │   ├── LandingPage.tsx
            │   ├── LoginPage.tsx
            │   ├── CalculatorPage.tsx
            │   │   ├── ConsumerDetailsForm.tsx
            │   │   └── ConsumptionForm.tsx
            │   ├── ComparisonPage.tsx
            │   │   ├── PlanCard.tsx
            │   │   └── ComparisonChart.tsx (Recharts BarChart)
            │   ├── DigitalTwinPage.tsx
            │   │   └── FingerprintBadge.tsx
            │   ├── RiskShieldPage.tsx
            │   │   ├── ScenarioTable.tsx
            │   │   └── ConfidenceGauge.tsx
            │   ├── ShiftAdvisorPage.tsx
            │   │   └── ShiftScenarioCard.tsx
            │   ├── PlansPage.tsx
            │   │   └── PlanLibraryCard.tsx
            │   ├── SavedPage.tsx (protected)
            │   │   └── SavedComparisonCard.tsx
            │   ├── ProfilePage.tsx (protected)
            │   └── NotFoundPage.tsx
            └── Footer.tsx
```

---

## 4. TypeScript Models

```typescript
// src/types/index.ts

export interface TariffPlan {
  id: string;
  name: string;
  provider?: string;
  fixedCharge: number;       // ₹ per billing period
  peakRate: number;          // ₹ per kWh
  shoulderRate: number;      // ₹ per kWh
  offPeakRate: number;       // ₹ per kWh
  isCustom?: boolean;
}

export type ConsumerType = 'household' | 'small-business';
export type BillingPeriod = 'monthly' | 'bimonthly';

export interface ConsumptionInput {
  offPeak: number;           // kWh
  shoulder: number;          // kWh
  peak: number;              // kWh
  consumerType: ConsumerType;
  billingPeriod: BillingPeriod;
  providerName?: string;
  tariffScheduleCode?: string;
}

export interface ConsumptionSummary extends ConsumptionInput {
  total: number;             // kWh
  offPeakPct: number;        // 0–100
  shoulderPct: number;       // 0–100
  peakPct: number;           // 0–100
}

export type UsageFingerprint =
  | 'Peak-Heavy Household'
  | 'Off-Peak Optimiser'
  | 'Daytime Dominant'
  | 'Daytime Small Business'
  | 'High Fixed-Load Consumer'
  | 'Balanced Household';

export interface FingerprintResult {
  fingerprint: UsageFingerprint;
  explanation: string;
}

export interface BillResult {
  planId: string;
  planName: string;
  fixedCharge: number;
  offPeakCharge: number;
  shoulderCharge: number;
  peakCharge: number;
  total: number;
}

export interface ComparisonResult {
  bills: BillResult[];
  cheapest: BillResult;
  savings: Record<string, number>;  // planId → savings vs cheapest
}

export interface BreakEvenResult {
  crossoverPct: number | null;      // null = no crossover
  cheaperBelowId: string | null;
  cheaperAboveId: string | null;
  message: string;
}

export interface RiskScenario {
  consumptionMultiplier: number;    // 0.8 | 0.9 | 1.0 | 1.1 | 1.2
  peakShiftPp: number;              // pp = percentage points
  bills: Record<string, number>;   // planId → bill
  cheapestPlanId: string;
}

export interface RiskPlanStats {
  planId: string;
  planName: string;
  scenariosWon: number;
  stabilityPct: number;
  avgCost: number;
  worstCost: number;
  bestCost: number;
  maxExtraCost: number;
}

export interface RiskShieldResult {
  scenarios: RiskScenario[];
  planStats: RiskPlanStats[];
  cheapestTodayId: string;
  mostStablePlanId: string;
  lowestWorstCasePlanId: string;
  confidenceScore: number;          // 0–100
  recommendedPlanId: string;
}

export interface RegretResult {
  avgRegret: number;
  maxRegret: number;
  maxRegretScenario: RiskScenario;
  isAlwaysOptimal: boolean;
}

export interface ShiftScenario {
  shiftPct: number;                 // 10 | 20 | 30
  unitsShifted: number;             // kWh
  newPeakPct: number;
  bills: Record<string, number>;   // planId → new bill
  savings: Record<string, number>; // planId → savings vs original bill
  recommendationChanges: boolean;
}

export interface SavedComparison {
  id: string;
  uid: string;
  createdAt: number;               // Unix timestamp ms
  consumption: ConsumptionInput;
  results: ComparisonResult;
  fingerprintResult: FingerprintResult;
}

export interface CustomPlan extends TariffPlan {
  uid: string;
  createdAt: number;
}
```

---

## 5. Mathematical Formulas

### 5.1 Bill Calculation

```
Bill = Fixed Charge
     + (offPeak × offPeakRate)
     + (shoulder × shoulderRate)
     + (peak × peakRate)
```

### 5.2 Consumption Percentages

```
total = offPeak + shoulder + peak
offPeakPct  = (offPeak  / total) × 100   (0 if total = 0)
shoulderPct = (shoulder / total) × 100   (0 if total = 0)
peakPct     = (peak     / total) × 100   (0 if total = 0)
```

### 5.3 Usage Fingerprint Logic

Evaluated in order; first matching rule wins:

```
IF consumerType = 'small-business' AND shoulderPct >= 50  → 'Daytime Small Business'
ELSE IF peakPct >= 45                                      → 'Peak-Heavy Household'
ELSE IF offPeakPct >= 45                                   → 'Off-Peak Optimiser'
ELSE IF offPeakPct >= 40 AND peakPct <= 20                 → 'High Fixed-Load Consumer'
ELSE IF shoulderPct >= 50                                  → 'Daytime Dominant'
ELSE                                                       → 'Balanced Household'
```

### 5.4 Break-Even Binary Search

```
Input: two plans A and B, total kWh T, shoulder kWh S
Constraint: offPeak + peak = T − S  (shoulder held constant)

Function billAt(plan, peakPct):
  peak    = peakPct / 100 × T
  offPeak = T − S − peak
  IF offPeak < 0: offPeak = 0
  return plan.fixedCharge
       + offPeak × plan.offPeakRate
       + S × plan.shoulderRate
       + peak × plan.peakRate

Binary search for peakPct in [0, 100] where billAt(A, p) = billAt(B, p):
  lo = 0, hi = 100
  FOR 60 iterations:
    mid = (lo + hi) / 2
    IF (billAt(A, mid) − billAt(B, mid)) × sign(lo) <= 0:
      hi = mid
    ELSE:
      lo = mid
  crossoverPct = (lo + hi) / 2

If sign does not change across [0, 100]: no crossover exists.
```

### 5.5 Risk Scenario Generation

```
consumptionMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2]
peakShiftPps = [−15, −10, 0, +10, +15]

For each (m, d) pair:
  newTotal   = originalTotal × m
  newPeakPct = clamp(originalPeakPct + d, 0, 100)
  newPeak    = newTotal × newPeakPct / 100
  newShoulder_ratio = originalShoulder / originalTotal   (if originalTotal > 0)
  newShoulder = min(newTotal × shoulderRatio, newTotal − newPeak)
  newOffPeak  = newTotal − newShoulder − newPeak
  IF any value < 0: skip scenario
  Calculate bill for each plan using (newOffPeak, newShoulder, newPeak)

Total scenarios = 5 × 5 = 25 (minus any skipped)
```

### 5.6 Regret Formula

```
For each scenario s and selected plan P:
  regret(s) = bill(P, s) − min over all plans Q of bill(Q, s)
  regret(s) >= 0 always

avgRegret = mean(regret over all scenarios)
maxRegret = max(regret over all scenarios)
```

### 5.7 Peak Shift Formula

```
shiftFractions = [0.10, 0.20, 0.30]

For each fraction f:
  unitsShifted = originalPeak × f
  newPeak      = originalPeak − unitsShifted
  newOffPeak   = originalOffPeak + unitsShifted
  newShoulder  = originalShoulder  (unchanged)
  newTotal     = newPeak + newOffPeak + newShoulder  (= originalTotal)
  Calculate bill for each plan
  savings = originalBill(plan) − newBill(plan)
```

---

## 6. Scenario-Generation Algorithm

```typescript
function generateRiskScenarios(
  base: ConsumptionInput,
  plans: TariffPlan[]
): RiskScenario[] {
  const multipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
  const peakShifts  = [-15, -10, 0, 10, 15];
  const scenarios: RiskScenario[] = [];

  const baseTotal = base.offPeak + base.shoulder + base.peak;
  const baseShoulderRatio = baseTotal > 0 ? base.shoulder / baseTotal : 0;
  const basePeakPct = baseTotal > 0 ? (base.peak / baseTotal) * 100 : 0;

  for (const m of multipliers) {
    for (const d of peakShifts) {
      const newTotal = baseTotal * m;
      const newPeakPct = Math.min(100, Math.max(0, basePeakPct + d));
      const newPeak = (newPeakPct / 100) * newTotal;
      const newShoulder = Math.min(baseShoulderRatio * newTotal, newTotal - newPeak);
      const newOffPeak = newTotal - newShoulder - newPeak;

      if (newOffPeak < 0 || newShoulder < 0 || newPeak < 0) continue;

      const bills: Record<string, number> = {};
      for (const plan of plans) {
        bills[plan.id] = calculateBill(plan, { ...base, offPeak: newOffPeak, shoulder: newShoulder, peak: newPeak }).total;
      }
      const cheapestPlanId = Object.entries(bills).sort((a, b) => a[1] - b[1])[0][0];
      scenarios.push({ consumptionMultiplier: m, peakShiftPp: d, bills, cheapestPlanId });
    }
  }
  return scenarios;
}
```

---

## 7. Break-Even Algorithm

```typescript
function findBreakEven(
  planA: TariffPlan,
  planB: TariffPlan,
  totalKwh: number,
  shoulderKwh: number
): BreakEvenResult {
  const remainingKwh = totalKwh - shoulderKwh;

  function diff(peakPct: number): number {
    const peak = (peakPct / 100) * totalKwh;
    const offPeak = Math.max(0, remainingKwh - peak);
    const billA = planA.fixedCharge + offPeak * planA.offPeakRate
                + shoulderKwh * planA.shoulderRate + peak * planA.peakRate;
    const billB = planB.fixedCharge + offPeak * planB.offPeakRate
                + shoulderKwh * planB.shoulderRate + peak * planB.peakRate;
    return billA - billB;
  }

  const diffAt0 = diff(0);
  const diffAt100 = diff(100);

  if (Math.sign(diffAt0) === Math.sign(diffAt100) && diffAt0 !== 0) {
    // No crossover
    const cheaperId = diffAt0 < 0 ? planA.id : planB.id;
    return { crossoverPct: null, cheaperBelowId: cheaperId, cheaperAboveId: cheaperId, message: `${cheaperId === planA.id ? planA.name : planB.name} remains cheaper throughout the tested range.` };
  }

  let lo = 0, hi = 100;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(diff(lo)) !== Math.sign(diff(mid))) hi = mid;
    else lo = mid;
  }
  const crossoverPct = (lo + hi) / 2;
  return {
    crossoverPct: Math.round(crossoverPct * 10) / 10,
    cheaperBelowId: diffAt0 < 0 ? planA.id : planB.id,
    cheaperAboveId: diffAt0 < 0 ? planB.id : planA.id,
    message: `Plans cross at approximately ${crossoverPct.toFixed(1)}% peak usage.`,
  };
}
```

---

## 8. Firebase Integration Pattern

```typescript
// src/firebase/config.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey) && Boolean(firebaseConfig.projectId);

const app = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;
export const db   = app ? getFirestore(app) : null;
```

---

## 9. Firestore Data Model

```
users/{uid}/
  comparisons/{comparisonId}
    - id:              string
    - uid:             string
    - createdAt:       number  (Unix ms)
    - consumption:     ConsumptionInput
    - results:         ComparisonResult
    - fingerprintResult: FingerprintResult

  customPlans/{planId}
    - id:              string
    - uid:             string
    - createdAt:       number  (Unix ms)
    - name:            string
    - provider:        string?
    - fixedCharge:     number
    - peakRate:        number
    - shoulderRate:    number
    - offPeakRate:     number
    - isCustom:        true
```

---

## 10. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == uid;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 11. Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Pure utility functions | Vitest | Unit tests; no mocks needed |
| React components | Vitest + RTL | Firebase mocked with `vi.mock` |
| Integration | Vitest + RTL | Full page render, user interactions |
| Accessibility | Manual + axe | Screen reader, keyboard navigation |
| Build | `npm run build` | TypeScript errors, bundle generation |

**Mock pattern for Firebase in component tests:**

```typescript
vi.mock('../src/firebase/config', () => ({
  auth: null,
  db: null,
  isFirebaseConfigured: false,
}));
```

**Test file conventions:**
- `tests/utils/*.test.ts` — pure function tests
- `tests/components/*.test.tsx` — component tests
- `tests/pages/*.test.tsx` — page-level integration tests

---

## 12. Color Palette (CSS Design Tokens)

```css
:root {
  --color-navy:    #0A1628;
  --color-blue:    #1E40AF;
  --color-cyan:    #06B6D4;
  --color-green:   #10B981;
  --color-amber:   #F59E0B;
  --color-red:     #EF4444;
  --color-surface: #F8FAFC;
  --color-border:  #E2E8F0;
  --color-text:    #1E293B;
  --color-muted:   #64748B;
}
```
