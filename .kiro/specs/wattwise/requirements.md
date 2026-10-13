# WattWise — Requirements Specification

> All acceptance criteria are written in EARS (Easy Approach to Requirements Syntax) format.
> Sample tariff rates are for demonstration only and must not be used for actual billing decisions.

---

## 1. Google Authentication

**REQ-AUTH-01** — While the user is on any page, the system shall display a "Continue with Google" button that initiates Firebase `signInWithPopup` with `GoogleAuthProvider`.

**REQ-AUTH-02** — When Firebase authentication is not configured, the system shall display a configuration message instead of the sign-in button, and the application shall not crash.

**REQ-AUTH-03** — When the user successfully authenticates, the system shall persist the Firebase session across page refreshes using `onAuthStateChanged`.

**REQ-AUTH-04** — When the user clicks "Sign out", the system shall call Firebase `signOut` and clear the authenticated state without reloading the page.

**REQ-AUTH-05** — While authentication is loading, the system shall display a loading indicator and shall not render protected content.

**REQ-AUTH-06** — When a popup error occurs, the system shall display a human-readable message for each of these error codes: `auth/operation-not-allowed`, `auth/unauthorized-domain`, `auth/popup-blocked`, `auth/popup-closed-by-user`, `auth/cancelled-popup-request`, `auth/network-request-failed`, `auth/invalid-api-key`, `auth/configuration-not-found`, `auth/account-exists-with-different-credential`.

**REQ-AUTH-07** — When the user navigates to a protected route while unauthenticated, the system shall redirect to `/login` and shall redirect back to the intended page after successful sign-in.

**REQ-AUTH-08** — When the "Continue with Google" button is clicked while a popup is already open, the system shall not open a second popup.

---

## 2. Guest Calculator

**REQ-GUEST-01** — While Firebase is not configured, the system shall allow unauthenticated users to access `/calculator` and `/comparison` and perform all bill calculations.

**REQ-GUEST-02** — When an unauthenticated user attempts to save a comparison, the system shall prompt the user to sign in without losing the current input data.

**REQ-GUEST-03** — When the guest calculator completes a calculation, the system shall display the full bill breakdown including fixed charges, energy charges per period, and total bill.

---

## 3. Consumption Digital Twin

**REQ-CDT-01** — When the user submits consumption inputs, the system shall calculate off-peak, shoulder, and peak percentages from the entered kWh values.

**REQ-CDT-02** — When the percentages are computed, the system shall assign a usage fingerprint according to these rules (evaluated in order):
- Peak share ≥ 45% → "Peak-Heavy Household"
- Off-peak share ≥ 45% → "Off-Peak Optimiser"
- Shoulder share ≥ 50% → "Daytime Dominant"
- Otherwise → "Balanced Household"
- When consumer type is "Small Business" and daytime conditions apply → "Daytime Small Business"
- When fixed load is dominant (off-peak ≥ 40% and peak ≤ 20%) → "High Fixed-Load Consumer"

**REQ-CDT-03** — When a fingerprint is assigned, the system shall display the fingerprint label alongside a plain-language explanation of why the label was chosen.

**REQ-CDT-04** — When any consumption input changes, the system shall recalculate the fingerprint without requiring a page reload.

**REQ-CDT-05** — The fingerprint calculation shall be implemented as a pure TypeScript function with no React imports.

---

## 4. Bill Calculation

**REQ-BILL-01** — When the user enters off-peak, shoulder, and peak kWh values along with a tariff plan, the system shall calculate:
```
Bill = Fixed Charge + (Off-peak kWh × Off-peak Rate) + (Shoulder kWh × Shoulder Rate) + (Peak kWh × Peak Rate)
```

**REQ-BILL-02** — When the calculated bill is displayed, the system shall format all monetary values as ₹ with two decimal places.

**REQ-BILL-03** — When any input is negative or non-numeric, the system shall display a validation error and shall not perform the calculation.

**REQ-BILL-04** — When total consumption is zero, the system shall display a zero bill showing only the fixed charge.

**REQ-BILL-05** — The bill calculation shall be implemented as a pure TypeScript utility function independent of React components.

---

## 5. Tariff Comparison

**REQ-COMP-01** — When the user submits consumption inputs, the system shall calculate and display the estimated bill for every available tariff plan.

**REQ-COMP-02** — When plans are displayed, the system shall sort them by estimated cost from lowest to highest.

**REQ-COMP-03** — When comparing plans, the system shall highlight the lowest-cost plan and display the savings versus each other plan.

**REQ-COMP-04** — When plans have identical costs, the system shall display a tie indicator rather than selecting one arbitrarily.

**REQ-COMP-05** — When a bar chart is displayed, each bar shall represent one plan's estimated bill and shall be labelled with the plan name and cost.

---

## 6. Break-Even Analysis (Tariff Break-Even Explorer)

**REQ-BEA-01** — When the user requests break-even analysis, the system shall calculate the peak-usage percentage at which the cheapest plan changes, keeping total consumption and shoulder consumption constant and shifting units only between off-peak and peak.

**REQ-BEA-02** — When the break-even point is found, the system shall display: which plan is cheaper below the crossover, which plan is cheaper above it, and the crossover percentage rounded to one decimal place.

**REQ-BEA-03** — When no crossover exists within the 0–100% range, the system shall display a message stating that one plan remains cheaper throughout the tested range.

**REQ-BEA-04** — The break-even calculation shall use a binary-search algorithm and shall not hard-code any crossover value.

**REQ-BEA-05** — The break-even utility shall be a pure TypeScript function accepting plan definitions and returning a result object, not a component.

---

## 7. Risk Simulation (Tariff Risk Shield)

**REQ-RISK-01** — When risk simulation is requested, the system shall generate scenarios by combining:
- Total consumption multipliers: −20%, −10%, current, +10%, +20%
- Peak share shifts: −15, −10, current, +10, +15 percentage points
- All scenarios shall maintain non-negative consumption values.

**REQ-RISK-02** — For each scenario and each plan, the system shall calculate the estimated bill.

**REQ-RISK-03** — When results are displayed, the system shall show per-plan: scenarios won, recommendation stability percentage, average cost, worst-case cost, best-case cost, and maximum extra cost versus the cheapest plan.

**REQ-RISK-04** — When results are displayed, the system shall identify and label: "Cheapest today", "Most stable plan", and "Lowest worst-case plan".

**REQ-RISK-05** — The system shall calculate a confidence score:
```
Confidence = (scenarios won by recommended plan / total valid scenarios) × 100
```
The system shall not present this score as a statistical guarantee.

**REQ-RISK-06** — The risk simulation shall be implemented as a pure TypeScript function.

---

## 8. Regret Calculation (Plan Regret Guard)

**REQ-REG-01** — When the user selects a plan, the system shall calculate regret for every simulated scenario:
```
Regret = selected plan cost − cheapest available plan cost
```

**REQ-REG-02** — When regret results are displayed, the system shall show: average regret, maximum regret, and the scenario that produces maximum regret.

**REQ-REG-03** — When maximum regret is zero, the system shall indicate that the selected plan remains optimal across all scenarios.

**REQ-REG-04** — The regret display shall include a plain-language example such as: "Plan A saves ₹84 today, but could cost up to ₹230 more if peak usage rises significantly."

---

## 9. Peak Shift Advisor

**REQ-PSA-01** — When the user requests peak shift advice, the system shall simulate shifting 10%, 20%, and 30% of current peak units to off-peak, without changing total consumption.

**REQ-PSA-02** — For each shift scenario, the system shall display: units shifted, new peak percentage, new estimated bill under each plan, estimated savings versus current bill, and whether the recommended plan changes.

**REQ-PSA-03** — When shift results are displayed, the system shall show an explainable suggestion such as: "Moving 24 kWh from peak to off-peak hours could reduce the Smart TOU estimate by ₹114 without reducing total consumption."

**REQ-PSA-04** — The system shall not claim that every appliance can safely be rescheduled.

**REQ-PSA-05** — The Peak Shift Advisor shall be implemented as a pure TypeScript utility function.

---

## 10. Saving Comparisons

**REQ-SAVE-01** — When an authenticated user clicks "Save comparison", the system shall write the comparison data to Firestore at `users/{uid}/comparisons/{id}`.

**REQ-SAVE-02** — When the user navigates to `/saved`, the system shall retrieve and display all saved comparisons for the authenticated user.

**REQ-SAVE-03** — When the user deletes a saved comparison, the system shall remove it from Firestore and update the list without a page reload.

**REQ-SAVE-04** — When Firestore is unavailable, the system shall display a friendly error message and shall not crash.

---

## 11. Custom Tariffs

**REQ-CUST-01** — When an authenticated user creates a custom tariff plan, the system shall save it to Firestore at `users/{uid}/customPlans/{planId}`.

**REQ-CUST-02** — When the user opens the calculator, custom tariff plans shall appear alongside the built-in sample plans.

**REQ-CUST-03** — When the user deletes a custom plan, the system shall remove it from Firestore immediately.

**REQ-CUST-04** — When creating a custom plan, the system shall validate that fixed charge, peak rate, shoulder rate, and off-peak rate are non-negative numbers.

---

## 12. Firestore Security

**REQ-SEC-01** — Firestore security rules shall allow a user to read and write only their own data at `users/{uid}/comparisons/{id}` and `users/{uid}/customPlans/{planId}` when `request.auth.uid == uid`.

**REQ-SEC-02** — Firestore security rules shall deny read and write access to any path not explicitly allowed.

**REQ-SEC-03** — The application shall never expose Firebase service-account credentials in the frontend code.

**REQ-SEC-04** — The `.env` file shall never be committed to version control; `.env.example` with empty values shall be committed.

---

## 13. Accessibility

**REQ-A11Y-01** — All interactive controls shall have accessible labels (aria-label or associated `<label>` elements).

**REQ-A11Y-02** — All form fields shall display error messages in an element associated via `aria-describedby` or rendered adjacent to the field.

**REQ-A11Y-03** — The application shall be keyboard-navigable: all interactive elements shall be reachable via Tab and activatable via Enter or Space.

**REQ-A11Y-04** — Colour contrast for text on backgrounds shall meet WCAG 2.1 AA minimum ratio of 4.5:1 for normal text.

**REQ-A11Y-05** — All images and icons that convey meaning shall have `alt` text or `aria-label`; decorative icons shall have `aria-hidden="true"`.

---

## 14. Error Handling

**REQ-ERR-01** — When any unhandled error occurs during rendering, the application shall display a friendly error boundary message and shall not show a blank screen.

**REQ-ERR-02** — When a network request to Firestore fails, the system shall display an inline error message near the affected feature rather than crashing.

**REQ-ERR-03** — When Firebase is not configured, the system shall detect missing environment variables at startup and operate in guest/demo mode without throwing unhandled exceptions.

**REQ-ERR-04** — When the user navigates to an unknown path, the system shall display a 404 page with a link back to the home page.

---

## 15. Tests and Build

**REQ-TEST-01** — Running `npm run test` shall execute all tests and all tests shall pass.

**REQ-TEST-02** — All pure calculation utilities (bill, comparison, break-even, risk, regret, shift) shall have unit tests covering normal cases, edge cases, and boundary conditions.

**REQ-TEST-03** — Component tests shall mock Firebase modules so tests can run without a real `.env` file.

**REQ-TEST-04** — Running `npm run build` shall complete without TypeScript errors and produce `dist/index.html`.

**REQ-TEST-05** — The build output shall include all application routes and assets.
