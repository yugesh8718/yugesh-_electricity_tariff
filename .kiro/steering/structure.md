---
inclusion: always
---

# WattWise — Project Structure

## Directory layout

```
electricity-tariff-comparator/          ← APPLICATION ROOT (run npm here)
├── .env                                ← Firebase credentials (not in git)
├── .env.example                        ← Template (no values)
├── .kiro/
│   ├── steering/
│   │   ├── tech.md                     ← Technology stack (always included)
│   │   ├── structure.md                ← This file (always included)
│   │   └── project-completion.md       ← Run/deploy guide (manual inclusion)
│   └── specs/wattwise/
│       ├── requirements.md             ← EARS-format requirements
│       ├── design.md                   ← Technical design
│       └── tasks.md                    ← Implementation tasks
├── src/
│   ├── App.tsx                         ← Router (10 routes)
│   ├── main.tsx                        ← App entry point
│   ├── styles.css                      ← Global CSS
│   ├── pages/                          ← One file per route
│   │   ├── LandingPage.tsx
│   │   ├── CalculatorPage.tsx          ← State/board/category/schedule + consumption
│   │   ├── ComparisonPage.tsx          ← Results + PDF/Print export
│   │   ├── LoginPage.tsx               ← Google + Phone OTP
│   │   ├── ProfilePage.tsx             ← Protected
│   │   ├── SavedPage.tsx               ← Protected
│   │   ├── PlansPage.tsx
│   │   ├── DigitalTwinPage.tsx
│   │   ├── RiskShieldPage.tsx
│   │   └── ShiftAdvisorPage.tsx
│   ├── components/                     ← Shared UI components
│   │   ├── Layout.tsx                  ← Nav + footer
│   │   ├── AuthPanel.tsx               ← Google sign-in UI
│   │   ├── PhoneAuthPanel.tsx          ← Phone OTP UI
│   │   ├── ProtectedRoute.tsx          ← Auth guard
│   │   ├── ComparisonTable.tsx         ← Side-by-side plan table
│   │   ├── ComparisonExportActions.tsx ← Download PDF + Print buttons
│   │   ├── BillBreakdownTable.tsx
│   │   ├── SavingsCard.tsx
│   │   ├── PlanEditor.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Notification.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx             ← Firebase auth state + signInWithGoogle
│   │   └── NotificationContext.tsx
│   ├── utils/
│   │   ├── billingEngine.ts            ← Core bill calculation (do not change formula)
│   │   ├── recommendationEngine.ts     ← Orchestrates all 5 analyses
│   │   ├── breakEvenEngine.ts
│   │   ├── riskShield.ts
│   │   ├── regretGuard.ts
│   │   ├── shiftAdvisor.ts
│   │   ├── digitalTwin.ts
│   │   ├── exportComparisonPdf.ts      ← jsPDF A4 PDF generator
│   │   ├── formatCurrency.ts
│   │   └── validation.ts
│   ├── data/
│   │   ├── indiaBoards.ts              ← 36 states/UTs, all DEMO rates
│   │   ├── samplePlans.ts
│   │   └── indiaRegions.js
│   ├── lib/
│   │   ├── firestore.ts                ← Firestore data access
│   │   ├── lang.jsx                    ← Tamil/English i18n
│   │   ├── auth.js                     ← Admin auth helpers
│   │   └── seedData.js
│   ├── firebase/
│   │   ├── config.ts                   ← PRIMARY Firebase initializer
│   │   └── firebase.js                 ← Legacy, keep for backward compat
│   └── types/index.ts                  ← All TypeScript interfaces
├── tests/                              ← 17 test files, 287 tests
├── firebase.json                       ← Hosting: dist/, Firestore rules
├── firestore.rules                     ← Security rules
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

## Workspace context

The parent folder `electricity-tariff-comparator-firebase/` is a Firebase CLI
workspace. It contains:
- `.claude/skills/` — Firebase Agent Skills (documentation for Claude CLI, not application code)
- `skills-lock.json` — Claude skill hashes
- `public/` — Firebase Hosting placeholder (not the app)
- Its own `firebase.json` pointing to the outer `public/` folder

**Do not confuse the outer folder with the application root.**
All application code, tests, and npm scripts live inside `electricity-tariff-comparator/`.
