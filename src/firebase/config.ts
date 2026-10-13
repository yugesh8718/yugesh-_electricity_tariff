/**
 * config.ts
 *
 * Firebase SDK initialisation for WattWise.
 *
 * Guard rules:
 *   - Reads all six VITE_FIREBASE_* variables from import.meta.env.
 *   - isConfigured is true only when both apiKey AND projectId are present and non-empty.
 *   - When not configured: auth and db are null; the app runs in guest/demo mode.
 *   - Uses getApps() guard to prevent duplicate initialisation on hot-reload.
 *   - Never hardcodes or logs credential values.
 *
 * Usage:
 *   import { auth, db, isConfigured } from './config';
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const apiKey            = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const authDomain        = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const projectId         = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const storageBucket     = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
const appId             = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

/**
 * Firebase is considered configured only when the two most-critical env vars
 * (apiKey and projectId) are present and non-empty strings.
 */
export const isConfigured = !!(apiKey && projectId);

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

const app = isConfigured
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;

// Re-export isFirebaseConfigured for components that use the older name
export const isFirebaseConfigured = isConfigured;
