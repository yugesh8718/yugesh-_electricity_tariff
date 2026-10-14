/**
 * config.ts
 *
 * Firebase SDK initialisation for WattWise / Electricity Tariff Comparator.
 *
 * Guard rules:
 *   - Reads all six VITE_FIREBASE_* variables from import.meta.env.
 *   - isConfigured is true only when apiKey AND projectId are present,
 *     non-empty, and not placeholder strings.
 *   - When not configured: auth and db are null; the app runs in guest/demo mode.
 *   - Uses getApps() guard to prevent duplicate initialisation on hot-reload.
 *   - Never hardcodes or logs credential values.
 *   - In development mode, logs missing variable NAMES (never values) to help
 *     developers diagnose configuration problems quickly.
 *
 * Usage:
 *   import { auth, db, isConfigured } from './config';
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// ── Required variable names and their env keys ────────────────────────────────

const REQUIRED_VAR_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

/** Strings that indicate the .env has never been filled in. */
const PLACEHOLDER_PATTERNS = [
  'replace_with',
  'your-project-id',
  'replace_',
  '<',
  'undefined',
];

function isPlaceholderValue(value: string | undefined): boolean {
  if (!value || typeof value !== 'string' || value.trim() === '') return true;
  return PLACEHOLDER_PATTERNS.some((p) => value.includes(p));
}

// ── Read env vars ─────────────────────────────────────────────────────────────

const apiKey            = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const authDomain        = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const projectId         = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const storageBucket     = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
const appId             = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

// ── Determine which required variables are missing or still placeholders ──────

const missingVarNames = REQUIRED_VAR_KEYS.filter(
  (key) => isPlaceholderValue(import.meta.env[key] as string | undefined),
);

/**
 * Firebase is considered configured only when all four critical env vars
 * are present, non-empty, and not placeholder strings.
 */
export const isConfigured: boolean = missingVarNames.length === 0;

// ── Developer diagnostic (names only — never values) ─────────────────────────

if (!isConfigured && import.meta.env.DEV) {
  console.warn(
    '[WattWise] Firebase is not configured — running in guest/demo mode.\n' +
    'To enable Google sign-in, Phone OTP, and cloud saving:\n' +
    '\n' +
    '  1. Open this file:  electricity-tariff-comparator\\.env\n' +
    '  2. Fill in real values for these variables:\n' +
    missingVarNames.map((name) => `       ${name}=<your-value>`).join('\n') + '\n' +
    '\n' +
    '  3. Get the values from:\n' +
    '     Firebase Console → Project settings (⚙) → Your apps → Web app → SDK setup → Config\n' +
    '\n' +
    '  4. Restart the dev server: npm run dev\n' +
    '\n' +
    'See README.md for step-by-step instructions.',
  );
}

// ── Build firebaseConfig ──────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

// ── Initialize Firebase app (safe for hot-reload) ─────────────────────────────

const app = isConfigured
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

// ── Export service instances (null when not configured) ───────────────────────

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;

// Alias for legacy imports from firebase.js that use the older name
export const isFirebaseConfigured: boolean = isConfigured;
