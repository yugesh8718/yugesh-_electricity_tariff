/**
 * firebase.js
 *
 * Firebase SDK initialization for the Electricity Tariff Comparator.
 *
 * Initialization rules:
 *   - Uses getApps() guard to prevent duplicate initialization on hot-reload.
 *   - Reads all configuration from Vite environment variables (VITE_FIREBASE_*).
 *   - If any required variable is missing or still a placeholder, the app
 *     runs in demo mode: auth and db are null, isFirebaseConfigured is false.
 *   - Never crashes the app for missing credentials.
 *   - Never exposes credential values in console output.
 *
 * To connect Firebase:
 *   1. Copy .env.example to .env (in THIS folder, beside package.json).
 *   2. Fill in real values from Firebase Console → Project settings → Your apps → Web app.
 *   3. Restart the dev server (npm run dev).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ── Required variable names ──────────────────────────────────────────────────

const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

// Values that indicate the .env was never filled in
const PLACEHOLDER_PATTERNS = [
  'replace_with',
  'your-project-id',
  'replace_',
  'undefined',
];

function isPlaceholder(value) {
  if (!value || typeof value !== 'string') return true;
  return PLACEHOLDER_PATTERNS.some((p) => value.includes(p));
}

// ── Build the config object from environment variables ───────────────────────

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// ── Validate: check which required variables are missing or still placeholders

const missingVars = REQUIRED_VARS.filter(
  (key) => isPlaceholder(import.meta.env[key])
);

export const isFirebaseConfigured = missingVars.length === 0;

// Log missing variable names (never values) during development
if (!isFirebaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[TariffCompare] Firebase configuration is incomplete.\n' +
    'The app runs in demo mode. To enable Firebase:\n' +
    '  1. Open: electricity-tariff-comparator/.env\n' +
    '  2. Fill in real values for:\n' +
    missingVars.map((v) => `     ${v}`).join('\n') + '\n' +
    '  3. Restart the dev server.\n' +
    'See README.md → Section 3 for step-by-step instructions.'
  );
}

// ── Initialize Firebase app (safe for hot-reload) ────────────────────────────

const app = isFirebaseConfigured
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

// ── Export service instances (null when not configured) ──────────────────────

export const auth          = app ? getAuth(app)      : null;
export const db            = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();

// GoogleAuthProvider does not need a Firebase app instance — it is safe to
// export even in demo mode. The actual sign-in calls check `auth !== null`.
