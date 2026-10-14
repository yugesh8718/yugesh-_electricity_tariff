---
inclusion: manual
name: project-completion
description: Reusable Kiro instructions for finishing, testing, and deploying the WattWise Electricity Tariff Comparator
---

# WattWise — Project Completion Steering Document

## Project identity

- **Name:** WattWise — Electricity Tariff Plan Comparator
- **Repo:** https://github.com/yugesh8718/ELECTRICITY-TARIFF
- **Branch:** master
- **Tech stack:** React 18 + TypeScript, Vite, Firebase (Auth + Firestore), jsPDF, Recharts, Lucide React

## Key directories

```
src/
  App.tsx                 — router (10 routes)
  pages/                  — LandingPage, CalculatorPage, ComparisonPage, LoginPage, ProfilePage, SavedPage, PlansPage, DigitalTwinPage, RiskShieldPage, ShiftAdvisorPage
  components/             — AuthPanel, PhoneAuthPanel, ComparisonTable, ComparisonExportActions, BillBreakdownTable, SavingsCard, PlanEditor, ProtectedRoute, Layout, LoadingSpinner, Notification
  contexts/               — AuthContext, NotificationContext
  utils/                  — billingEngine, recommendationEngine, breakEvenEngine, riskShield, regretGuard, shiftAdvisor, digitalTwin, exportComparisonPdf, formatCurrency, validation
  data/                   — indiaBoards (36 states/UTs, all DEMO data), samplePlans, indiaRegions
  lib/                    — firestore, lang (Tamil/English), auth, seedData, demoTariffs
  firebase/               — config.ts (primary), firebase.js (legacy, keep for old imports)
  types/index.ts          — ConsumptionInput, TariffPlan, BillBreakdown, ComparisonResult, …
tests/                    — 17 test files, 287 tests
```

## Important rules for future Kiro sessions

1. **Never invent tariff rates.** All rates in `indiaBoards.ts` are `verificationStatus: 'demo'`. Do not change this to `'verified'` without a real official source.
2. **Never expose `.env` values** in any output, commit, or log.
3. **Never push `.env`, `dist/`, or `node_modules/`** — all are gitignored.
4. **Firebase config.ts** (`src/firebase/config.ts`) is the primary initializer. `firebase.js` is a legacy file kept for backward compatibility with older `.js` imports.
5. **Firestore security rules** are in `firestore.rules`. Never set `allow read, write: if true`.
6. **Admin access** is checked via `/admins/{uid}` in Firestore — not just by Google login.

## Run commands

```bash
cd electricity-tariff-comparator
npm run dev          # start dev server → http://localhost:5173 (or 5174 if busy)
npm run test         # run all 287 tests
npm run build        # production build → dist/
npm run typecheck    # TypeScript check, no emit
firebase deploy --only hosting   # deploy to Firebase Hosting (requires firebase login)
```

## Firebase Console actions still required

1. **Authorized domains:** Add `electricity-tariff.web.app` (or current deployed domain) under Authentication → Settings → Authorized domains.
2. **Firestore rules:** Publish the rules from `firestore.rules` via Firebase Console or `firebase deploy --only firestore:rules`.
3. **First admin:** Create document `/admins/{your-uid}` manually in Firestore Console.
4. **Phone OTP test numbers:** Authentication → Sign-in method → Phone → Phone numbers for testing (e.g. +91 9999999999 / OTP 123456).

## Billing formula (verified, do not change)

```
offPeakCharge   = offPeak × offPeakRate
shoulderCharge  = shoulder × shoulderRate
peakCharge      = peak × peakRate
energyCharge    = sum of above
fixedCharge     = plan.fixedCharge × (billingPeriod === 'bimonthly' ? 2 : 1)
subtotal        = energyCharge + fixedCharge + surcharge
duty            = subtotal × taxDutyPercent / 100
estimatedTotal  = subtotal + duty
```

## Known limitations (as of last audit)

- All tariff rates are demo data, not verified official rates.
- Phone OTP requires real Firebase credentials and Blaze plan for production SMS.
- GitHub push requires manual `git push origin master` from your terminal.
- Firebase Hosting deployment requires `firebase login` and `firebase deploy`.
- The admin dashboard does not exist as a separate page — admin actions are in the developer console.

## Deployment checklist

- [ ] `npm run build` — confirm `dist/` is created
- [ ] `firebase login` — authenticate Firebase CLI
- [ ] `firebase deploy --only hosting` — deploy to Firebase Hosting
- [ ] Add deployed domain to Firebase Auth authorized domains
- [ ] Run `firebase deploy --only firestore:rules` to publish security rules
- [ ] Create `/admins/{uid}` in Firestore for the first admin user

## GitHub checklist

- [ ] `git add -A` (check `git status` first to ensure no secrets are staged)
- [ ] `git commit -m "feat: <description>"`
- [ ] `git push origin master`
- [ ] Verify at https://github.com/yugesh8718/ELECTRICITY-TARIFF
