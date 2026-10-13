# WattWise — Explainable Electricity Tariff Intelligence

A competition-ready web application that compares electricity tariff plans, estimates bills, and explains the lowest-cost option using a **Consumption Digital Twin** of the user's electricity-usage pattern.

> ⚠️ **All sample tariff rates are for demonstration only. They are not official electricity tariffs and must not be used for actual billing or financial decisions.**

---

## What makes WattWise different

Beyond a standard tariff calculator, WattWise offers five original features:

| Feature | Description |
|---------|-------------|
| **Consumption Digital Twin** | Assigns a usage fingerprint (e.g. Off-Peak Optimiser, Peak-Heavy Household) from actual consumption percentages |
| **Tariff Break-Even Explorer** | Finds the exact peak-usage percentage at which the cheapest plan changes |
| **Tariff Risk Shield** | Simulates 25 future scenarios and scores how stable the recommendation is |
| **Plan Regret Guard** | Shows how much more you could pay if your consumption changes |
| **Peak Shift Advisor** | Estimates savings from moving peak consumption to off-peak hours |

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Routing | React Router DOM v7 |
| Styling | Plain CSS with design tokens |
| Icons | Lucide React |
| Charts | Recharts |
| Auth + DB | Firebase Authentication + Cloud Firestore |
| Tests | Vitest + @testing-library/react |

---

## Routes

| URL | Page | Auth |
|-----|------|------|
| `/` | Landing page | No |
| `/login` | Google sign-in | No |
| `/calculator` | Consumption input | No |
| `/comparison` | Plan comparison results | No |
| `/digital-twin` | Usage fingerprint | No |
| `/risk-shield` | Scenario risk simulation | No |
| `/shift-advisor` | Peak Shift Advisor | No |
| `/plans` | Tariff plan library | No |
| `/saved` | Saved comparisons | Yes |
| `/profile` | User profile | Yes |

---

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy `.env.example` to `.env`:

```bash
# PowerShell
Copy-Item .env.example .env
```

Fill in the values from Firebase Console → Project settings → Your apps → Web app:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> The calculator and comparison features work without Firebase. Only saved comparisons and Google sign-in require it.

### 3. Run in development mode

```bash
npm run dev
```

Open http://localhost:5173

### 4. Run tests

```bash
npm run test
```

### 5. Type-check

```bash
npm run typecheck
```

### 6. Build for production

```bash
npm run build
```

Output goes to the `dist/` folder.

---

## Firebase setup

### Enable Google Authentication

1. Firebase Console → Build → Authentication → Get started
2. Sign-in method → Google → Enable → Save
3. Add `localhost` to Authorised domains (Authentication → Settings)

### Create Cloud Firestore

1. Firebase Console → Build → Firestore Database → Create database
2. Start in production mode
3. Deploy security rules: `firebase deploy --only firestore:rules`

### Firestore security rules

```
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

## Project structure

```
src/
  components/   Shared UI components
  contexts/     AuthContext (Firebase auth state)
  data/         Static plan and rate data
  firebase/     Firebase initialisation and guard
  lib/          Firestore operations, i18n, auth helpers
  pages/        Page components (one per route)
  types/        TypeScript interfaces
  utils/        Pure calculation utilities (no React)
  styles.css    All CSS — tokens, layout, components
  App.tsx       Router shell
  main.tsx      Application entry point

tests/          Unit and component tests (Vitest)
.kiro/specs/    Requirements, design, and task specs
.env.example    Firebase config template (committed)
.env            Your local Firebase config (NOT committed)
firestore.rules Firestore security rules
```

---

## Disclaimer

All sample tariff rates, plan names, and billing figures shown in this application are illustrative demonstration data only. They are not affiliated with or endorsed by any electricity distribution company. Do not use these figures for actual billing, financial, or energy planning decisions.
