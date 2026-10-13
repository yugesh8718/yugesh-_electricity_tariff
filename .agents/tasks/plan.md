# Implementation Plan — State-wise Electricity Tariff Comparator

> Baseline: 163 tests pass, `npm run build` succeeds.
> Goal: add 9 features without breaking any existing test or build step.

---

## Codebase findings and key decisions

**Existing data layer:**
- `src/data/indiaRegions.js` already defines all 36 region IDs (2-letter codes: 'tn', 'ka', etc.)
- `src/data/discoms.js` already lists every DISCOM with matching `regionId` values
- `src/data/tariffCatalogue.js` has CATEGORIES (discomId FK) and TARIFF_SCHEDULES (categoryId FK)
- `catalogue.test.js` already tests these files — new tests must NOT re-import them

**Shape conflict to resolve:**
The task spec's `TariffSchedule` has `verificationStatus`, `offPeakRate`, `shoulderRate`, `peakRate` — a _different_ shape than the existing `TariffPlan` interface (which the comparison engine uses). Solution: `scheduleToTariffPlan()` converter in `indiaBoards.ts`.

**Notification context placement:**
`NotificationProvider` goes in `main.tsx` (not inside `Layout.tsx`) so all routes access it. The notification container renders inside the provider, fixed-positioned — no change to `<Outlet />` or `Layout.tsx` structure needed.

**CalculatorPage rewrite approach:**
The existing page uses raw kWh inputs (offPeak, shoulder, peak). The new design switches to total+percentages. Both map to the same `ConsumptionInput` fields (`offPeak`, `shoulder`, `peak`, `total`) so the downstream comparison engine is unchanged.

**Test isolation:**
`tests/statewise.test.ts` imports only from `src/data/indiaBoards.ts`. It does NOT import `tariffCatalogue.js`, `discoms.js`, or `indiaRegions.js` to avoid duplicate describe blocks with `catalogue.test.js`.

---

## Files to create

| File | Purpose |
|------|---------|
| `src/data/indiaBoards.ts` | 36-entry data file with interfaces + helpers |
| `src/components/Notification.tsx` | Presentational notification component |
| `src/hooks/useNotifications.ts` | Queue hook with auto-dismiss |
| `src/contexts/NotificationContext.tsx` | Global notification provider + hook |
| `tests/statewise.test.ts` | New tests for state-wise features |

## Files to modify

| File | Change |
|------|--------|
| `src/main.tsx` | Wrap App in NotificationProvider |
| `src/lib/lang.jsx` | Add 10 bilingual notification keys |
| `src/pages/CalculatorPage.tsx` | Full rewrite with state/board/% controls |
| `src/pages/ComparisonPage.tsx` | Add badges, notifications, state context display |
| `src/pages/PlansPage.tsx` | Show state schedule section when context set |
| `src/styles.css` | Append new CSS rules (never remove existing) |
| `README.md` | Append state-wise tariff section |

---

## Implementation order (dependency-safe)

- [ ] 1. Create `src/data/indiaBoards.ts` — interfaces, 36-entry INDIA_BOARDS array, getBoardsByState / getCategoriesByBoard / getSchedulesByCategory helpers, scheduleToTariffPlan converter.
      All other files depend on this.
      Files: `src/data/indiaBoards.ts`
      Verify: `npm run typecheck` — 0 errors.

- [ ] 2. Create `src/components/Notification.tsx` and `src/hooks/useNotifications.ts` — pure, no context dependency.
      Files: `src/components/Notification.tsx`, `src/hooks/useNotifications.ts`
      Verify: `npm run typecheck` — 0 errors.

- [ ] 3. Create `src/contexts/NotificationContext.tsx` — imports Notification + useNotifications.
      Files: `src/contexts/NotificationContext.tsx`
      Verify: `npm run typecheck` — 0 errors.

- [ ] 4. Update `src/lib/lang.jsx` — add 10 bilingual notification keys to TRANSLATIONS.en and TRANSLATIONS.ta.
      Files: `src/lib/lang.jsx`
      Verify: `npm run test` — 163 tests still pass.

- [ ] 5. Update `src/main.tsx` — add NotificationProvider wrapping.
      Files: `src/main.tsx`
      Verify: `npm run test` — 163 tests still pass.

- [ ] 6. Rewrite `src/pages/CalculatorPage.tsx` — state/board/category/schedule dropdowns, total + percentage inputs, pattern bar, preset buttons, notification calls, submit stores new ConsumptionInput format.
      Files: `src/pages/CalculatorPage.tsx`
      Verify: `npm run test` — 163 tests still pass (no CalculatorPage unit tests exist, but App.test.tsx and other tests must not break).

- [ ] 7. Update `src/pages/ComparisonPage.tsx` — success notification after comparison, verification badges, state context display, tie detection.
      Files: `src/pages/ComparisonPage.tsx`
      Verify: `npm run test` — 163 tests still pass.

- [ ] 8. Update `src/pages/PlansPage.tsx` — read ww-state-ctx, show state schedule section when present.
      Files: `src/pages/PlansPage.tsx`
      Verify: `npm run test` — 163 tests still pass.

- [ ] 9. Append CSS rules to `src/styles.css` — .state-selector, .board-selector, .pattern-bar variants, .notification variants, .notification-container, .badge-demo/verified/unverified.
      Files: `src/styles.css`
      Verify: `npm run build` — build succeeds.

- [ ] 10. Create `tests/statewise.test.ts` — 10 test cases covering 36-state count, board/category coverage, threshold logic (pure), percentage validation, kWh calc, getBoardsByState results.
      Files: `tests/statewise.test.ts`
      Verify: `npm run test` — all tests (163 + new) pass.

- [ ] 11. Append state-wise tariff section to `README.md`.
      Files: `README.md`
      Verify: `npm run build` — build succeeds with no errors.

---

## Potential conflicts identified

1. **`NotificationContext` in tests**: `App.test.tsx` mocks `lang.jsx` and `firebase/config`. It does NOT wrap in `NotificationProvider`. Any test that renders a component calling `useNotification()` will throw. Mitigation: add a `vi.mock('../src/contexts/NotificationContext', ...)` in any test file that renders CalculatorPage/ComparisonPage if needed, OR make `useNotification` return a no-op if context is null (add a null-safe guard in the hook).

2. **`samplePlans.ts` import path**: `billingEngine.test.ts` imports from `'../src/data/samplePlans.ts'` with `.ts` extension — the project uses `"type": "module"` with Vite, and Vitest handles `.ts` imports fine. New files should follow the same import-with-extension pattern.

3. **CalculatorPage rewrite**: existing tests don't directly test CalculatorPage, but `App.test.tsx` renders `LandingPage` and `NotFoundPage` only. No conflict. However, the rewrite must preserve the `sessionStorage.setItem('ww-consumption', ...)` and `sessionStorage.setItem('ww-plans', ...)` keys exactly, otherwise `ComparisonPage` breaks.

4. **Tamil translations**: `lang.jsx` currently has no notification keys. Adding them is additive only — existing `t()` calls are unaffected.

5. **`indiaBoards.ts` stateId uniqueness**: `stateId` values must exactly match the `id` field from `INDIA_REGIONS` in `indiaRegions.js`. Use the two-letter codes already established: 'ap', 'ar', 'as', 'br', 'cg', 'ga', 'gj', 'hr', 'hp', 'jh', 'ka', 'kl', 'mp', 'mh', 'mn', 'ml', 'mz', 'nl', 'od', 'pb', 'rj', 'sk', 'tn', 'tg', 'tr', 'up', 'uk', 'wb', 'an', 'ch', 'dd', 'dl', 'jk', 'la', 'ld', 'py'.

---

## FEAT decomposition

This work decomposes into 3 sequential features:
- **FEAT-001**: `indiaBoards.ts` data file (pure data, no React)
- **FEAT-002**: Notification system + CalculatorPage rewrite (depends on FEAT-001)
- **FEAT-003**: CSS, ComparisonPage/PlansPage updates, README (depends on FEAT-001 and FEAT-002)

See `.agents/tasks/task-statewise-tariff/features/` for the full FEAT artifact files.
