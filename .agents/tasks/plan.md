# Implementation Plan — WattWise Electricity Tariff Intelligence

## Codebase Audit Summary

**What exists and works (96 tests pass, build succeeds):**
- React 19 + Vite 8, all `.jsx`/`.js` — must migrate to `.tsx`/`.ts`
- `package.json`: firebase ^12.4.0, react-router-dom ^7.18.4, recharts ^3.10.1, lucide-react ^1.55.0, vitest, @testing-library/react — all present
- TypeScript is NOT installed — must add `typescript@5.7.3`, `@types/react@19`, `@types/react-dom@19`
- `src/firebase/firebase.js`: correct guard pattern; replace with `src/firebase/config.ts`
- `src/lib/tariffEngine.js`: slab-based engine — keep; existing tests depend on it
- `src/lib/demoTariffs.js`: DEMO_STATE/DISCOM/CATEGORY/TARIFFS — keep; existing tests import it
- `src/utils/calculateBill.js`, `comparePlans.js`, `formatRupees.js` — keep; existing tests pass
- `src/data/samplePlans.js` — keep; existing comparePlans.test.js uses it
- `src/data/discoms.js`, `indiaRegions.js`, `tariffCatalogue.js` — keep; catalogue.test.js uses them
- `src/styles.css`: comprehensive CSS, 730+ lines — extend with WattWise palette, do not replace
- `tests/setup.js` — rename to `tests/setup.ts` and update vite.config.ts reference
- `vite.config.js` — rename to `vite.config.ts`; no `tsconfig.json` exists yet

**What must be built (new WattWise features):**
- TypeScript toolchain setup (tsconfig.json, rename config files)
- `src/types/index.ts` — all 11 TypeScript interfaces
- `src/utils/billingEngine.ts` — TOU billing with bimonthly support
- `src/utils/digitalTwin.ts` — consumption fingerprint
- `src/utils/breakEvenEngine.ts` — binary-search crossover
- `src/utils/riskShield.ts` — 25-scenario risk simulation
- `src/utils/regretGuard.ts` — regret calculation
- `src/utils/shiftAdvisor.ts` — peak-shift scenarios
- `src/utils/recommendationEngine.ts` — orchestration
- `src/utils/formatCurrency.ts`, `validation.ts`
- `src/data/samplePlans.ts` — WattWise SAMPLE_PLANS (two plans that switch recommendation)
- `src/firebase/config.ts` — replaces firebase.js
- `src/lib/firestore.ts` — WattWise Firestore paths (users/{uid}/comparisons, customPlans)
- `src/contexts/AuthContext.tsx` — Google Auth with all 9 error codes
- All 14 shared components as `.tsx`
- All 11 pages as `.tsx`
- 8 new test files (billingEngine, digitalTwin, breakEven, riskShield, regretGuard, shiftAdvisor, auth, firestore)
- `.kiro/specs/wattwise/` (requirements.md, design.md, tasks.md)
- `firestore.rules` update, `.env.example` update, `README.md` update

**Build/test commands:**
- `npm run test` — `vitest run` (currently 96 tests passing)
- `npm run build` — `vite build`
- After adding TypeScript: `npm run typecheck` — `tsc --noEmit`

---

## FEAT-001 — TypeScript Infrastructure & Kiro Specs

- [ ] 1. Install TypeScript and type definitions.
      `npm install --save-dev typescript@5.7.3 @types/react@19 @types/react-dom@19`
      Files: `package.json` (devDependencies updated)
      Verify: `npm run test` — all 96 existing tests still pass.

- [ ] 2. Create `tsconfig.json` with exact spec compiler options: target ES2020, lib [ES2020, DOM, DOM.Iterable], module ESNext, moduleResolution bundler, allowImportingTsExtensions true, resolveJsonModule true, isolatedModules true, noEmit true, jsx react-jsx, strict true, noFallthroughCasesInSwitch true, include [src, tests].
      Files: `tsconfig.json` (create)
      Verify: `npm run build` — build still succeeds.

- [ ] 3. Rename `vite.config.js` → `vite.config.ts`. Update setupFiles to `./tests/setup.ts`. Remove the old firebase server.deps.inline block (not needed for TS).
      Rename `tests/setup.js` → `tests/setup.ts` (content unchanged).
      Files: `vite.config.ts` (new), `vite.config.js` (delete), `tests/setup.ts` (new), `tests/setup.js` (delete)
      Verify: `npm run test` — all 96 tests still pass.

- [ ] 4. Update `package.json` scripts: add `"typecheck": "tsc --noEmit"`. Update `.env.example` to have empty values (not placeholder text). Update `.gitignore` to verify the `.env`/`.env.*`/`!.env.example` pattern is present.
      Files: `package.json`, `.env.example`, `.gitignore`
      Verify: `npm run build` succeeds.

- [ ] 5. Update `index.html`: title → `WattWise — Electricity Tariff Intelligence`, meta description updated, theme-color → `#0A1628`, script src → `/src/main.tsx`.
      Files: `index.html`
      Verify: `npm run build` succeeds.

- [ ] 6. Create `.kiro/specs/wattwise/requirements.md` with EARS-format acceptance criteria for all 15 areas: Google authentication, Guest calculator, Consumption Digital Twin (all 4 fingerprint labels testable), Bill calculation (formulas, bimonthly), Tariff comparison, Break-even analysis (binary search, no hard-coding), Risk simulation (25 scenarios, confidence score), Regret calculation (avgRegret, maxRegret), Peak Shift Advisor (3 shift %, savings, recommendation change), Saving comparisons, Custom tariffs, Firestore security (user-owned paths), Accessibility (WCAG 2.1 AA, chart summaries), Error handling (all 9 auth codes, Firebase-not-configured graceful degradation), Tests and build (all tests pass, TypeScript strict).
      Files: `.kiro/specs/wattwise/requirements.md` (create)
      Verify: file exists and is non-empty.

- [ ] 7. Create `.kiro/specs/wattwise/design.md` covering architecture, routes table (10 routes + 404), component tree, all 11 TypeScript interfaces, billing/fingerprint/break-even/risk/regret/shift mathematical formulas, scenario-generation algorithm, break-even binary search pseudocode, Firebase integration pattern, Firestore data model, security rules, testing strategy.
      Files: `.kiro/specs/wattwise/design.md` (create)
      Verify: file exists and is non-empty.

- [ ] 8. Create `.kiro/specs/wattwise/tasks.md` with ordered implementation tasks mapped to requirement IDs.
      Update `README.md` with WattWise project description, setup instructions, routes reference, tech stack, and disclaimer.
      Files: `.kiro/specs/wattwise/tasks.md` (create), `README.md` (replace)
      Verify: `npm run test` — all 96 tests pass; `npm run build` — succeeds.

---

## FEAT-002 — Core TypeScript Utilities, Types, Firebase Config

- [ ] 9. Create `src/types/index.ts` with all 11 interfaces/types exactly as specified: `ConsumptionInput`, `TariffPlan`, `BillBreakdown`, `FingerprintLabel` (union), `UsageFingerprint`, `BreakEvenResult`, `RiskScenario`, `RiskShieldResult`, `RegretResult`, `ShiftScenario`, `ComparisonResult`.
      Files: `src/types/index.ts` (create)
      Verify: `npm run build` — no TypeScript errors on the types file.

- [ ] 10. Create `src/utils/formatCurrency.ts` exporting `formatCurrency(value: number): string` (₹ with 2 decimal places, en-IN locale) and `formatRupees` as an alias. Create `src/utils/validation.ts` exporting `validateConsumption` and `validateTariffPlan` returning `Record<string, string>` error maps.
       Files: `src/utils/formatCurrency.ts`, `src/utils/validation.ts` (create)
       Verify: `npm run build` — no TypeScript errors.

- [ ] 11. Create `src/data/samplePlans.ts` with exactly two SAMPLE_PLANS and three DEMO_PROFILES matching the spec. Verify mentally: Balanced (offPeak=120,shoulder=150,peak=80,total=350) → Smart TOU wins; Peak-Heavy (offPeak=70,shoulder=110,peak=170,total=350) → Flat Saver wins. The rates ensure the crossover is around peak%≈35-40%.
       Files: `src/data/samplePlans.ts` (create)
       Verify: `npm run build` — succeeds.

- [ ] 12. Create `src/utils/billingEngine.ts` implementing `calculateBill(consumption: ConsumptionInput, plan: TariffPlan): BillBreakdown` with exact formulas. Also export `compareAllPlans(consumption, plans): BillBreakdown[]` sorted ascending by estimatedTotal. Use the TariffPlan types from step 9.
       Files: `src/utils/billingEngine.ts` (create)
       Verify: `npm run build` — succeeds.

- [ ] 13. Create `src/utils/digitalTwin.ts` implementing `generateFingerprint(consumption: ConsumptionInput): UsageFingerprint`. Exact thresholds: peak% ≥ 45 → Peak-Heavy Household; offPeak% ≥ 45 → Off-Peak Optimiser; shoulder% ≥ 50 → Daytime Dominant/Daytime Small Business; else → Balanced Household. Each label includes an explanation string. Guard: handle total=0 gracefully.
       Files: `src/utils/digitalTwin.ts` (create)
       Verify: `npm run build` — succeeds.

- [ ] 14. Create `src/utils/breakEvenEngine.ts` implementing `findBreakEven(consumption: ConsumptionInput, plans: TariffPlan[]): BreakEvenResult`. Binary search between peak%=0 and peak%=100 (keeping total and shoulder constant, shifting only between off-peak and peak). Convergence tolerance: 0.01%, max 50 iterations. Never hardcode the result — derive from plan rates. Return `crossoverExists: false` with explanation if no crossover found.
       Files: `src/utils/breakEvenEngine.ts` (create)
       Verify: `npm run build` — succeeds.

- [ ] 15. Create `src/utils/riskShield.ts` implementing `generateRiskShield(consumption, plans, recommendedPlanId): RiskShieldResult`. 25 scenarios: consumptionMultipliers [0.8, 0.9, 1.0, 1.1, 1.2] × peakShiftDeltas [-15, -10, 0, +10, +15]. For each: clamp peak%, redistribute off-peak and shoulder proportionally (maintain original off-peak:shoulder ratio), no negatives. Aggregate planStats, confidence, cheapestToday, mostStablePlan, lowestWorstCasePlan.
       Files: `src/utils/riskShield.ts` (create)
       Verify: `npm run build` — succeeds.

- [ ] 16. Create `src/utils/regretGuard.ts` implementing `calculateRegret(riskShield: RiskShieldResult, selectedPlanId: string): RegretResult`. For each scenario: regret = bills[selectedPlanId] - min(bills). Compute avgRegret, maxRegret, maxRegretScenario. Generate explanation string.
       Create `src/utils/shiftAdvisor.ts` implementing `generateShiftScenarios(consumption, plans, originalBills): ShiftScenario[]`. Shift percents [10, 20, 30]. unitsShifted = peak × (shiftPercent/100); newPeak = peak - unitsShifted; newOffPeak = offPeak + unitsShifted; total unchanged.
       Files: `src/utils/regretGuard.ts`, `src/utils/shiftAdvisor.ts` (create)
       Verify: `npm run build` — succeeds.

- [ ] 17. Create `src/utils/recommendationEngine.ts` implementing `generateComparison(consumption, plans): ComparisonResult`. Orchestrates: compareAllPlans → fingerprint → breakEven → riskShield → regretGuard → shiftAdvisor. Builds explanation string. Sets timestamp.
       Files: `src/utils/recommendationEngine.ts` (create)
       Verify: `npm run build` — succeeds.

- [ ] 18. Create `src/firebase/config.ts` with the exact Firebase initialization pattern from spec. Guard: `const isConfigured = !!(apiKey && projectId)`. App singleton using getApps()/getApp()/initializeApp(). Export `auth`, `db`, `isConfigured`.
       Create `src/lib/firestore.ts` with WattWise Firestore functions: `saveComparison`, `getComparisons`, `deleteComparison`, `saveCustomPlan`, `getCustomPlans`, `deleteCustomPlan`. Paths: `users/{uid}/comparisons/{id}` and `users/{uid}/customPlans/{planId}`. Null-db guards on all functions.
       Update `firestore.rules` to the spec's exact rules (user-owned paths, catch-all deny).
       Files: `src/firebase/config.ts` (create), `src/lib/firestore.ts` (create), `firestore.rules` (update)
       Verify: `npm run test` — all 96 tests still pass; `npm run build` — succeeds.

---

## FEAT-003 — Application Shell: Auth, Layout, Shared Components, Routing

*Depends on: FEAT-001 (TypeScript), FEAT-002 (types, utilities)*

- [ ] 19. Create `src/contexts/AuthContext.tsx`. Exports `AuthProvider` and `useAuth()` hook. Implements `onAuthStateChanged`, `signInWithGoogle()` via `signInWithPopup`, `signOut()`. Maps all 9 specified error codes to friendly messages. Busy-state flag prevents duplicate sign-in clicks. Handles `auth === null` (Firebase not configured) gracefully — user stays null, loading resolves to false.
       Files: `src/contexts/AuthContext.tsx` (create)
       Verify: `npm run build` — no TypeScript errors.

- [ ] 20. Create `src/components/LoadingSpinner.tsx` (accessible spinner, role='status'). Create `src/components/ErrorBoundary.tsx` (class component, catches render errors, shows fallback). Create `src/components/ProtectedRoute.tsx` (reads useAuth(), redirects to `/login?redirect=<path>` when unauthenticated, renders `<Outlet />` when authenticated).
       Files: `src/components/LoadingSpinner.tsx`, `src/components/ErrorBoundary.tsx`, `src/components/ProtectedRoute.tsx` (create)
       Verify: `npm run build` — succeeds.

- [ ] 21. Extend `src/styles.css` by appending WattWise design tokens and component classes. Add to `:root`: `--color-navy: #0A1628`, `--color-electric-blue: #1E40AF`, `--color-cyan: #06B6D4`, `--color-green: #10B981`, `--color-amber: #F59E0B`, `--color-red: #EF4444`. Update `--color-primary` to `#1E40AF` and `--color-accent` to `#10B981`. Append new classes: `.ww-card`, `.ww-badge-fingerprint`, `.ww-fingerprint-label`, `.ww-risk-grid`, `.ww-shift-card`, `.ww-break-even`, `.ww-confidence-score`, `.ww-regret-display`. Do not remove any existing rules.
       Files: `src/styles.css` (extend)
       Verify: `npm run build` — succeeds.

- [ ] 22. Create `src/main.tsx` (replace main.jsx): wrap in BrowserRouter, AuthProvider, LangProvider (from src/lib/lang.jsx), StrictMode. Import styles.css. Point at App.tsx.
       Create `src/App.tsx` (replace App.jsx): define all routes with `<Routes>/<Route>`. Use `<ProtectedRoute>` for /saved and /profile. Import all 11 page stubs (created in step 23). Wrap all in `<Layout>`.
       Files: `src/main.tsx` (create), `src/App.tsx` (create)
       Verify: `npm run build` — succeeds.

- [ ] 23. Create stub pages — each renders a placeholder heading and note. Files: `src/pages/LandingPage.tsx`, `LoginPage.tsx`, `CalculatorPage.tsx`, `ComparisonPage.tsx`, `DigitalTwinPage.tsx`, `RiskShieldPage.tsx`, `ShiftAdvisorPage.tsx`, `PlansPage.tsx`, `SavedPage.tsx`, `ProfilePage.tsx`. Create `NotFoundPage.tsx` with real implementation: 404 heading, description, and Link back to /.
       Files: all 11 page files in `src/pages/` (create)
       Verify: `npm run build` — succeeds.

- [ ] 24. Create `src/components/Layout.tsx` (replace Layout.jsx): WattWise brand name, Zap icon, nav links for all WattWise routes (Home, Calculator, Plans, Saved, Profile/Login). Mobile hamburger toggle. Language toggle (useLang from lang.jsx). Footer with Firebase status. Update nav items to WattWise routes.
       Create `src/components/AuthPanel.tsx` (replace AuthPanel.jsx): renders 'Continue with Google' button via useAuth().signInWithGoogle; shows user name when signed in; Sign Out button; handles isConfigured=false gracefully; shows inline auth errors.
       Files: `src/components/Layout.tsx`, `src/components/AuthPanel.tsx` (create)
       Verify: `npm run build` — succeeds.

- [ ] 25. Create remaining shared components: `src/components/PlanCard.tsx`, `BillBreakdownTable.tsx`, `FingerprintCard.tsx`, `BreakEvenCard.tsx`, `RiskSummaryCard.tsx`, `RegretCard.tsx`, `ShiftCard.tsx`, `PlanEditor.tsx`, `SavingsCard.tsx`. Each accepts the appropriate TypeScript props. All Recharts charts inside these components must have accessible summaries (aria-label on container, visually-hidden data table sibling).
       Files: 9 component files in `src/components/` (create)
       Verify: `npm run build` — succeeds; `npm run test` — all 96 existing tests still pass.

---

## FEAT-004 — Full Page Implementations and Test Suite

*Depends on: FEAT-002 (utilities), FEAT-003 (components, routing stubs)*

- [ ] 26. Implement `src/pages/LandingPage.tsx`: hero section, five novelty feature cards, DEMO_PROFILES quick-start buttons, 'Start Comparing' and 'View Plans' CTAs, demo disclaimer banner.
       Implement `src/pages/LoginPage.tsx`: AuthPanel centered, reads `?redirect=` param, redirects when already logged in.
       Files: `src/pages/LandingPage.tsx`, `src/pages/LoginPage.tsx` (replace stubs)
       Verify: `npm run build` — succeeds.

- [ ] 27. Implement `src/pages/CalculatorPage.tsx`: ConsumptionInput form with consumer type, billing period, optional provider/schedule, off-peak/shoulder/peak kWh fields, auto-calculated totals and percentages. Plan selection from SAMPLE_PLANS + custom plans. PlanEditor for custom plan creation. On submit: stores ConsumptionInput in sessionStorage as 'ww-consumption', navigates to /comparison.
       Files: `src/pages/CalculatorPage.tsx` (replace stub)
       Verify: `npm run build` — succeeds.

- [ ] 28. Implement `src/pages/ComparisonPage.tsx`: reads 'ww-consumption' from sessionStorage (redirects to /calculator if absent). Calls recommendationEngine.generateComparison. Shows SavingsCard, BillBreakdownTable per plan, grouped Recharts BarChart. 'Save' button (saveComparison if auth, else prompt login). Stores ComparisonResult in sessionStorage as 'ww-result'.
       Files: `src/pages/ComparisonPage.tsx` (replace stub)
       Verify: `npm run build` — succeeds.

- [ ] 29. Implement `src/pages/DigitalTwinPage.tsx`: reads 'ww-result', shows FingerprintCard, consumption percentage Recharts PieChart, BreakEvenCard. Explain fingerprint relevance.
       Implement `src/pages/RiskShieldPage.tsx`: reads 'ww-result', shows RiskSummaryCard, scenario chart, RegretCard (embedded here), confidence score with disclaimer.
       Files: `src/pages/DigitalTwinPage.tsx`, `src/pages/RiskShieldPage.tsx` (replace stubs)
       Verify: `npm run build` — succeeds.

- [ ] 30. Implement `src/pages/ShiftAdvisorPage.tsx`: reads 'ww-result', shows ShiftCard, BarChart of original vs shifted bills, advisor text, disclaimer.
       Implement `src/pages/PlansPage.tsx`: shows SAMPLE_PLANS and user custom plans as PlanCards. Add/delete custom plan via PlanEditor. Persists to Firestore if authenticated else sessionStorage.
       Files: `src/pages/ShiftAdvisorPage.tsx`, `src/pages/PlansPage.tsx` (replace stubs)
       Verify: `npm run build` — succeeds.

- [ ] 31. Implement `src/pages/SavedPage.tsx`: protected; calls getComparisons(uid) on mount; renders saved ComparisonResult cards; delete button. 'No saved comparisons' empty state.
       Implement `src/pages/ProfilePage.tsx`: protected; shows user displayName, email, photo; saved comparison count; custom plan count; Sign Out button.
       Files: `src/pages/SavedPage.tsx`, `src/pages/ProfilePage.tsx` (replace stubs)
       Verify: `npm run build` — succeeds.

- [ ] 32. Create tests for all 8 new test files (replace tests/App.test.jsx with tests/App.test.tsx simultaneously):
       - `tests/billingEngine.test.ts`: flat tariff, TOU tariff, monthly vs bimonthly fixed charge, tax, surcharge, decimals, zero usage, tie, cheapest plan selection.
       - `tests/digitalTwin.test.ts`: all 4 fingerprint labels, small-business type.
       - `tests/breakEven.test.ts`: crossover found, no crossover, total preserved, result computed (not hardcoded).
       - `tests/riskShield.test.ts`: 25 scenarios, no negatives, confidence 0-100, stats correct.
       - `tests/regretGuard.test.ts`: regret=0 when always cheapest, maxRegret>0 on usage change, explanation generated.
       - `tests/shiftAdvisor.test.ts`: total preserved, unitsShifted correct, savings positive, recommendation change detected.
       - `tests/auth.test.ts`: mock Firebase auth; login success, popup error, loading state, sign-out, auth restoration.
       - `tests/firestore.test.ts`: mock Firebase; saveComparison writes correct path, getComparisons returns array, throws when db null.
       - `tests/App.test.tsx`: renders LandingPage in MemoryRouter, asserts WattWise heading present.
       Files: 9 test files in `tests/` (create/replace)
       Verify: `npm run test` — ALL tests pass (96 original + ~50 new).

---

## FEAT-005 — Polish, Accessibility, and Production Readiness

*Depends on: FEAT-001 through FEAT-004 complete*

- [ ] 33. Add accessible text summaries to all Recharts charts: `aria-label` on container div, visually-hidden sibling `<table>` summarising chart data for screen readers. Apply to: BillBreakdownTable, FingerprintCard, BreakEvenCard, RiskSummaryCard, ShiftCard, SavingsCard.
       Files: `src/components/FingerprintCard.tsx`, `BreakEvenCard.tsx`, `RiskSummaryCard.tsx`, `ShiftCard.tsx`, `SavingsCard.tsx`, `BillBreakdownTable.tsx` (update)
       Verify: `npm run build` — succeeds.

- [ ] 34. Remove superseded `.jsx`/`.js` files from src/ that have been replaced by `.tsx`/`.ts`. Do NOT remove src/lib/tariffEngine.js, demoTariffs.js, auth.js, lang.jsx, seedData.js, src/data/*.js, src/utils/calculateBill.js, comparePlans.js, formatRupees.js — these are still needed by passing tests. Remove: src/App.jsx, src/main.jsx, src/components/AuthPanel.jsx, Layout.jsx, PlanEditor.jsx, RequireAdmin.jsx, SavingsSummary.jsx, UsageForm.jsx, PeakUsageDemo.jsx, src/pages/HomePage.jsx, CalculatorPage.jsx, ComparePage.jsx, ResultsPage.jsx, AdminLoginPage.jsx, AdminDashboardPage.jsx.
       Files: remove 14 obsolete files
       Verify: `npm run test` — all tests still pass; `npm run build` — succeeds.

- [ ] 35. Audit and fix production code quality: remove any console.log statements outside import.meta.env.DEV guards; fix any missing React key props in rendered lists; fix any TypeScript strict mode violations caught by `npm run typecheck`. Add print CSS to styles.css: hide nav, footer, buttons; show all comparison data.
       Files: various (fix as found); `src/styles.css` (append print styles)
       Verify: `npm run test` — all tests pass; `npm run build` — succeeds with no TypeScript errors.

- [ ] 36. Final end-to-end verification: run `npm run test` (expect 130+ tests passing). Run `npm run build`. Confirm: (a) all 10 routes render without blank screens, (b) ComparisonPage shows Smart TOU for Balanced Household profile, (c) ComparisonPage shows Flat Saver for Peak-Heavy profile, (d) /saved redirects to /login?redirect=/saved when not authenticated, (e) no console errors in production build.
       Files: none (verification only)
       Verify: `npm run test` — all tests pass; `npm run build` — dist/index.html exists.
