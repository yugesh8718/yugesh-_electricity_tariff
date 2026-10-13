# WattWise — Implementation Tasks

Tasks are ordered by dependency. Each task references the requirements it satisfies.

---

## FEAT-001 — TypeScript Infrastructure and Kiro Specs

**Status:** Pending  
**Requirements:** REQ-TEST-04, REQ-TEST-05

1. Install `typescript@5.7.3`, `@types/react@19`, `@types/react-dom@19` as devDependencies.
2. Create `tsconfig.json` with strict mode and the compiler options from design.md.
3. Rename `tests/setup.js` → `tests/setup.ts` (same content).
4. Rename `vite.config.js` → `vite.config.ts`; update `setupFiles` to `./tests/setup.ts`.
5. Add `typecheck` script to `package.json`; verify `test` script runs `vitest run`.
6. Update `.env.example` to six `VITE_FIREBASE_*` keys with empty values.
7. Verify `.gitignore` has `.env`, `.env.*`, `!.env.example`.
8. Update `index.html`: WattWise title, meta description, theme-color, `main.tsx` entry.
9. Create `.kiro/specs/wattwise/requirements.md`, `design.md`, `tasks.md`.
10. Update `README.md` for WattWise.

**Acceptance:** All 96 existing tests pass; `npm run build` succeeds.

---

## FEAT-002 — TypeScript Types and Firebase Config

**Status:** Pending  
**Requirements:** REQ-SEC-03, REQ-SEC-04, REQ-ERR-03

1. Create `src/types/index.ts` with all interfaces from design.md section 4.
2. Create `src/firebase/config.ts` replacing `firebase.js` — Firebase guard pattern.
3. Update any existing imports of `firebase.js` to reference `config.ts`.
4. Ensure guest mode works when Firebase is not configured.

**Acceptance:** `npm run build` and `npm run test` both pass; Firebase null guard works.

---

## FEAT-003 — Authentication Context and Login Page

**Status:** Pending  
**Requirements:** REQ-AUTH-01 through REQ-AUTH-08, REQ-GUEST-02

1. Create `src/contexts/AuthContext.tsx` with `useAuth` hook, `onAuthStateChanged`, loading state.
2. Create `src/pages/LoginPage.tsx` with "Continue with Google" button.
3. Implement `signInWithPopup` + `GoogleAuthProvider`; handle all 9 error codes.
4. Add redirect-back-to-intended-page logic using React Router `useLocation`.
5. Create `src/components/RequireAuth.tsx` for protected routes.
6. Update `src/App.tsx` to wrap app in `AuthProvider` and add `/login` route.
7. Write tests: `tests/components/AuthButton.test.tsx`, `tests/pages/LoginPage.test.tsx`.

**Acceptance:** Login flow works end-to-end; duplicate-click prevented; all tests pass.

---

## FEAT-004 — Layout and Navigation

**Status:** Pending  
**Requirements:** REQ-A11Y-01 through REQ-A11Y-05, REQ-ERR-04

1. Create `src/components/Layout.tsx` replacing `Layout.jsx` — TopBar, Footer, Outlet.
2. Create `src/components/TopBar.tsx` with navigation links and auth button.
3. Create `src/pages/NotFoundPage.tsx` (404 page with home link).
4. Apply WattWise color palette tokens to `styles.css`.
5. Ensure keyboard navigation and ARIA labels are present.
6. Write test: `tests/components/Layout.test.tsx`.

**Acceptance:** All routes render inside Layout; 404 page works; ARIA labels present.

---

## FEAT-005 — Calculator Input Page

**Status:** Pending  
**Requirements:** REQ-BILL-01 through REQ-BILL-05, REQ-GUEST-01, REQ-GUEST-03

1. Create `src/pages/CalculatorPage.tsx` with consumer details form and consumption form.
2. Validate all inputs (non-negative, numeric); show field-level errors.
3. Calculate total kWh and percentages live as the user types.
4. Store consumption state in React Router location state for use by downstream pages.
5. Write tests: `tests/pages/CalculatorPage.test.tsx`.

**Acceptance:** Validation errors shown; total and percentages update in real time.

---

## FEAT-006 — Bill Calculation Utilities

**Status:** Pending  
**Requirements:** REQ-BILL-01 through REQ-BILL-05, REQ-COMP-01 through REQ-COMP-05

1. Create `src/utils/billCalculator.ts` — pure `calculateBill(plan, consumption)` function.
2. Create `src/utils/planComparator.ts` — pure `comparePlans(plans, consumption)` function.
3. Create `src/data/samplePlans.ts` with WattWise SAMPLE_PLANS array (TariffPlan[]).
4. Create `src/utils/formatCurrency.ts` wrapping `formatRupees.js` for ₹ formatting.
5. Write tests: `tests/utils/billCalculator.test.ts`, `tests/utils/planComparator.test.ts`.

**Acceptance:** All utility tests pass; existing `.js` test files continue to pass.

---

## FEAT-007 — Comparison Page and Charts

**Status:** Pending  
**Requirements:** REQ-COMP-01 through REQ-COMP-05

1. Create `src/pages/ComparisonPage.tsx` using `comparePlans` utility.
2. Create `src/components/PlanCard.tsx` showing bill breakdown per plan.
3. Create `src/components/ComparisonChart.tsx` using Recharts `BarChart`.
4. Sort plans by cost; highlight cheapest; display savings amounts.
5. Write tests: `tests/pages/ComparisonPage.test.tsx`.

**Acceptance:** Plans sorted correctly; cheapest highlighted; chart renders.

---

## FEAT-008 — Consumption Digital Twin

**Status:** Pending  
**Requirements:** REQ-CDT-01 through REQ-CDT-05

1. Create `src/utils/digitalTwin.ts` with `classifyConsumption(summary)` pure function.
2. Implement fingerprint logic from design.md section 5.3.
3. Create `src/pages/DigitalTwinPage.tsx` displaying fingerprint badge and explanation.
4. Create `src/components/FingerprintBadge.tsx`.
5. Write tests: `tests/utils/digitalTwin.test.ts`.

**Acceptance:** Each fingerprint rule covered by at least one test; explanation text shown.

---

## FEAT-009 — Tariff Break-Even Explorer

**Status:** Pending  
**Requirements:** REQ-BEA-01 through REQ-BEA-05

1. Create `src/utils/breakEven.ts` with `findBreakEven` pure function (binary search).
2. Verify no crossover returns correct message.
3. Create UI section on ComparisonPage or a dedicated panel.
4. Write tests: `tests/utils/breakEven.test.ts` covering crossover and no-crossover cases.

**Acceptance:** Binary search converges to < 0.1% error; no hard-coded values; tests pass.

---

## FEAT-010 — Tariff Risk Shield

**Status:** Pending  
**Requirements:** REQ-RISK-01 through REQ-RISK-06

1. Create `src/utils/riskShield.ts` with `generateRiskScenarios` and `computeRiskStats`.
2. Generate 25 scenarios (5 multipliers × 5 peak shifts); skip invalid ones.
3. Compute per-plan stats: scenarios won, stability %, avg/worst/best/maxExtra.
4. Create `src/pages/RiskShieldPage.tsx` with scenario table and confidence score.
5. Create `src/components/ConfidenceGauge.tsx`.
6. Write tests: `tests/utils/riskShield.test.ts`.

**Acceptance:** 25 scenarios generated for valid inputs; confidence score in 0–100; tests pass.

---

## FEAT-011 — Plan Regret Guard

**Status:** Pending  
**Requirements:** REQ-REG-01 through REQ-REG-04

1. Create `src/utils/regretGuard.ts` with `calculateRegret(selectedPlanId, scenarios)`.
2. Return avg regret, max regret, and the scenario producing max regret.
3. Display regret results on RiskShieldPage alongside risk simulation.
4. Write tests: `tests/utils/regretGuard.test.ts`.

**Acceptance:** Regret ≥ 0 for every scenario; always-optimal case returns isAlwaysOptimal: true.

---

## FEAT-012 — Peak Shift Advisor

**Status:** Pending  
**Requirements:** REQ-PSA-01 through REQ-PSA-05

1. Create `src/utils/peakShiftAdvisor.ts` with `calculateShiftScenarios` pure function.
2. Implement 10%, 20%, 30% shift scenarios per formula in design.md.
3. Create `src/pages/ShiftAdvisorPage.tsx` with ShiftScenarioCard components.
4. Show explainable suggestion; note that not all appliances can be rescheduled.
5. Write tests: `tests/utils/peakShiftAdvisor.test.ts`.

**Acceptance:** Total kWh unchanged in all shift scenarios; tests cover all three fractions.

---

## FEAT-013 — Tariff Plan Library

**Status:** Pending  
**Requirements:** REQ-CUST-01 through REQ-CUST-04

1. Create `src/pages/PlansPage.tsx` showing all built-in and custom plans.
2. Implement custom plan creation form with validation.
3. Save custom plans to Firestore (`users/{uid}/customPlans/{planId}`) when authenticated.
4. Show custom plans alongside built-in plans in calculator.
5. Write tests: `tests/pages/PlansPage.test.tsx`.

**Acceptance:** Custom plan saved to Firestore; validation errors shown; unauthenticated users see sign-in prompt.

---

## FEAT-014 — Firestore Save and Load

**Status:** Pending  
**Requirements:** REQ-SAVE-01 through REQ-SAVE-04, REQ-SEC-01 through REQ-SEC-04

1. Create `src/lib/firestore.ts` replacing `firestore.js` with typed Firestore operations.
2. Implement `saveComparison`, `getComparisons`, `deleteComparison` functions.
3. Implement `saveCustomPlan`, `getCustomPlans`, `deleteCustomPlan` functions.
4. Apply null-db guard: read returns `[]` when `db` is null; write throws informative error.
5. Create `src/pages/SavedPage.tsx` listing saved comparisons.
6. Write tests: `tests/lib/firestore.test.ts` (mocked Firestore).
7. Update `firestore.rules` to match design.md section 10.

**Acceptance:** Users see only their own data; null-db guard prevents crashes; tests pass.

---

## FEAT-015 — User Profile Page

**Status:** Pending  
**Requirements:** REQ-AUTH-07, REQ-SAVE-01

1. Create `src/pages/ProfilePage.tsx` showing user name, email, photo, and account actions.
2. Display count of saved comparisons and custom plans.
3. Implement sign-out button.
4. Write test: `tests/pages/ProfilePage.test.tsx`.

**Acceptance:** Profile page shows user data; sign-out navigates to home; protected route.

---

## FEAT-016 — Landing Page

**Status:** Pending  
**Requirements:** REQ-A11Y-01, REQ-A11Y-03

1. Create `src/pages/LandingPage.tsx` with hero section and feature highlights.
2. Highlight the five novelty features (Digital Twin, Break-Even, Risk Shield, Regret Guard, Shift Advisor).
3. Include a CTA button navigating to `/calculator`.
4. Write test: `tests/pages/LandingPage.test.tsx`.

**Acceptance:** CTA button navigates to calculator; feature list renders; keyboard accessible.

---

## FEAT-017 — Error Boundaries and Polish

**Status:** Pending  
**Requirements:** REQ-ERR-01 through REQ-ERR-04, REQ-A11Y-01 through REQ-A11Y-05

1. Create `src/components/ErrorBoundary.tsx` wrapping main content.
2. Wrap each page route in an error boundary or a top-level one in App.tsx.
3. Review all pages for ARIA labels, keyboard focus, and colour contrast.
4. Final `npm run test` and `npm run build` verification.

**Acceptance:** Throwing a component shows error boundary message; all tests pass; build clean.
