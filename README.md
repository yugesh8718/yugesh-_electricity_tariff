# WattWise — Electricity Tariff Plan Comparator

> ⚠️ **All tariff rates in this application are DEMO DATA only. They are not verified official electricity rates and must not be used for actual billing decisions.**

A full-stack web application that helps Indian electricity consumers compare tariff plans, estimate their monthly bill, and understand which plan suits their usage pattern best.

---

## What this project does

- **State-wise tariff selection** — All 36 Indian states and union territories with multiple DISCOMs and consumer categories.
- **Consumption Pattern Inputs** — Enter total units and distribute by off-peak / normal / peak percentage with a visual bar.
- **Multi-plan comparison** — Compare 2+ tariff plans; shows each plan's estimated bill, cheapest plan, savings, and recommendation reason.
- **Five analytical features:**
  - 🔬 Consumption Digital Twin (usage fingerprint)
  - ⚖️ Tariff Break-Even Explorer (crossover point)
  - 🛡️ Tariff Risk Shield (25 scenario simulation)
  - 😬 Plan Regret Guard (worst-case overpay)
  - 🔄 Peak Shift Advisor (shift savings)
- **PDF/Print export** — Download or print a comparison report.
- **Firebase Authentication** — Google sign-in and Phone OTP (SMS).
- **Firestore cloud save** — Save and retrieve comparisons.
- **Tamil / English toggle** — Language switch in the navigation bar.
- **Demo mode** — Works completely without Firebase credentials.

---

## Technology stack

| Component | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Plain CSS (CSS custom properties) |
| Icons | Lucide React |
| Charts | Recharts |
| Routing | React Router DOM v7 |
| PDF export | jsPDF + jsPDF-AutoTable |
| Backend | Firebase (Auth + Firestore) |
| Tests | Vitest + @testing-library/react |

---

## Project structure

```
src/
  App.tsx                   — Application router (10 routes)
  pages/                    — One file per page/route
  components/               — Shared UI components
  contexts/                 — AuthContext, NotificationContext
  utils/                    — Billing engine, recommendation engine, PDF export
  data/                     — India boards/DISCOMs (36 states), sample plans
  lib/                      — Firestore access, Firebase auth helpers, i18n
  firebase/                 — Firebase initialization (config.ts)
  types/                    — TypeScript interfaces
tests/                      — 17 test files
```

---

## Prerequisites

- **Node.js LTS** (v18 or later) — https://nodejs.org
- **npm** (comes with Node.js)

---

## 1. Install dependencies

```bash
cd electricity-tariff-comparator
npm install
```

---

## 2. Run in demo mode (no Firebase needed)

```bash
npm run dev
```

Open **http://localhost:5173** in your browser. The full calculator works without any Firebase account.

---

## 3. Configure Firebase (to enable sign-in and cloud save)

### Step 1 — Create .env

Copy `.env.example` to a new file called `.env` in the same folder:

```bash
copy .env.example .env
```

Open `.env` and fill in your Firebase project values:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Get these values from: **Firebase Console → Project settings (⚙) → Your apps → Web app → SDK setup → Config**

### Step 2 — Enable authentication providers

In **Firebase Console → Authentication → Sign-in method**:

- **Google** → Enable → choose support email → Save
- **Phone** → Enable → Save

### Step 3 — Enable localhost as an authorized domain

**Firebase Console → Authentication → Settings → Authorized domains**

Confirm `localhost` is listed. Add it if not.

### Step 4 — Create Firestore database

**Firebase Console → Firestore Database → Create database → Production mode → Choose region → Enable**

### Step 5 — Deploy Firestore security rules

```bash
firebase login
firebase deploy --only firestore:rules
```

Or manually paste the contents of `firestore.rules` into the Firebase Console Rules editor and click **Publish**.

### Step 6 — Restart the dev server

```bash
# Press Ctrl+C to stop, then:
npm run dev
```

---

## 4. Phone OTP setup

### For testing (no real SMS, free)

1. Firebase Console → Authentication → Sign-in method → Phone → **Phone numbers for testing**
2. Add: `+91 9999999999` with OTP `123456`
3. Use this number in the app to test without sending real SMS

### For real SMS (requires Blaze billing plan)

Firebase charges for SMS beyond the free tier. Enable billing in Firebase Console → Project settings → Billing before using real phone numbers in production.

---

## 5. Create the first admin user

Admin access is checked via Firestore `/admins/{uid}`.

1. Sign in to the app with Google.
2. Open Firebase Console → Authentication → Users → copy your **User UID**.
3. Open Firebase Console → Firestore → create collection `admins` → document ID = your UID → add field `email: "your@email.com"` → Save.

---

## 6. Run tests

```bash
npm run test
```

Expected: **287 tests passing** across 17 test files.

---

## 7. Production build

```bash
npm run build
```

Output goes to `dist/`. You will see chunk-size advisories for jsPDF and recharts — these are performance suggestions, not errors.

---

## 8. Deploy to Firebase Hosting

```bash
npm run build
firebase login
firebase deploy --only hosting
```

After deploying, add your `.web.app` domain to Firebase Console → Authentication → Authorized domains.

---

## 9. GitHub

Remote: https://github.com/yugesh8718/ELECTRICITY-TARIFF

```bash
git add -A
git commit -m "feat: your changes"
git push origin master
```

---

## 10. Demo mode behavior

When `.env` has placeholder values or is missing:
- Calculator and all five analytical features work fully using sample demo plans.
- Sign-in shows "Firebase not connected" — no error, no crash.
- Comparison PDF and Print still work.
- No network requests are made to Firebase.

---

## 11. Tariff data limitations

All tariff rates in `src/data/indiaBoards.ts` are **illustrative demo values** with `verificationStatus: 'demo'`. They are clearly labelled in the UI. To add verified official rates:

1. Obtain the official tariff order PDF from the relevant SERC website.
2. Update `src/data/indiaBoards.ts` with the verified rate.
3. Change `verificationStatus` to `'verified'` and add the `sourceUrl` and `effectiveDate`.

---

## 12. Common errors and fixes

| Error | Fix |
|---|---|
| `npm : cannot be loaded` (PowerShell) | Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` as Administrator |
| `npm error Missing script: "dev"` | You are in the wrong folder. Run `cd electricity-tariff-comparator` first |
| Firebase welcome page after deploy | `firebase.json` must have `"public": "dist"`, not `"public": "public"` |
| Google popup blocked | Browser is blocking popups — allow popups for localhost in browser settings |
| `auth/unauthorized-domain` | Add your domain to Firebase Console → Authentication → Authorized domains |
| `auth/operation-not-allowed` | Enable Google/Phone provider in Firebase Console → Authentication |

---

## Project report summary

- **Status:** Functional demo with all five original features implemented and tested
- **Tests:** 287/287 passing
- **Build:** Succeeds (chunk-size advisory only, not an error)
- **Deployment:** Firebase Hosting configured (`firebase.json` → `"public": "dist"`)
- **GitHub:** https://github.com/yugesh8718/ELECTRICITY-TARIFF (master branch)
- **Live URL:** Deploy with `firebase deploy --only hosting` to get a live `.web.app` URL

---

*WattWise — Academic project. All demo rates are fictional and not for actual billing.*
