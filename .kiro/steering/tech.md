---
inclusion: always
---

# WattWise — Technology Stack

## Project root

The application root is the `electricity-tariff-comparator/` subfolder.
All `npm` commands must be run from inside this folder:

```bash
cd electricity-tariff-comparator
npm run dev        # development server → http://localhost:5173
npm run test       # Vitest test suite (287 tests)
npm run build      # production build → dist/
npm run typecheck  # TypeScript check without emit
```

## Stack

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript | ^5.7.3 |
| UI framework | React | latest (18+) |
| Build tool | Vite | latest |
| Routing | React Router DOM | ^7.18.4 |
| Styling | Plain CSS (CSS custom properties) | — |
| Icons | Lucide React | ^1.55.0 |
| Charts | Recharts | ^3.10.1 |
| PDF export | jsPDF + jsPDF-AutoTable | 2.5.1 / 3.8.4 |
| Backend | Firebase (Auth + Firestore) | ^12.4.0 |
| Tests | Vitest + @testing-library/react | latest |

## Entry points

- `src/main.tsx` — application entry point, wraps app in BrowserRouter + AuthProvider + LangProvider + NotificationProvider
- `src/App.tsx` — router with 10 routes
- `index.html` — Vite HTML template
- `src/firebase/config.ts` — Firebase initializer (primary)

## Key patterns

- Firebase config reads from `VITE_FIREBASE_*` environment variables in `.env`
- The app runs in **demo mode** when `.env` is missing or has placeholder values — no crash
- All tariff rates in `src/data/indiaBoards.ts` have `verificationStatus: 'demo'` — never change to `'verified'` without a real official source
- Admin authorization is checked via Firestore `/admins/{uid}`, not just Google login
- The billing formula must not be changed — see `project-completion.md`
