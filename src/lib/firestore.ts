/**
 * firestore.ts
 *
 * WattWise Firestore data-access layer.
 * Paths:
 *   users/{uid}/comparisons/{id}
 *   users/{uid}/customPlans/{planId}
 *
 * Guard rules:
 *   - Each function checks whether db is null before making network calls.
 *   - Read functions return [] when db is null.
 *   - Write/delete functions throw 'Firebase is not configured' when db is null.
 *   - Uses the Firebase modular SDK (v9+).
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
import type { ComparisonResult, TariffPlan } from '../types/index.js';

// ---------------------------------------------------------------------------
// Guard helper
// ---------------------------------------------------------------------------

function requireDb() {
  if (!db) {
    throw new Error('Firebase is not configured');
  }
  return db;
}

// ---------------------------------------------------------------------------
// Comparisons  —  users/{uid}/comparisons/{id}
// ---------------------------------------------------------------------------

/**
 * Save a comparison result for the given user.
 * @returns The Firestore document ID of the newly created document.
 */
export async function saveComparison(
  uid: string,
  result: ComparisonResult
): Promise<string> {
  const firestore = requireDb();
  const ref = await addDoc(
    collection(firestore, 'users', uid, 'comparisons'),
    { ...result, savedAt: serverTimestamp() }
  );
  return ref.id;
}

/**
 * Retrieve all saved comparisons for the given user.
 * Returns an empty array when Firebase is not configured.
 */
export async function getComparisons(uid: string): Promise<ComparisonResult[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db, 'users', uid, 'comparisons'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ComparisonResult));
}

/**
 * Delete a single comparison document.
 */
export async function deleteComparison(uid: string, id: string): Promise<void> {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, 'users', uid, 'comparisons', id));
}

// ---------------------------------------------------------------------------
// Custom plans  —  users/{uid}/customPlans/{planId}
// ---------------------------------------------------------------------------

/**
 * Save a custom tariff plan for the given user.
 * @returns The Firestore document ID of the newly created document.
 */
export async function saveCustomPlan(
  uid: string,
  plan: TariffPlan
): Promise<string> {
  const firestore = requireDb();
  const ref = await addDoc(
    collection(firestore, 'users', uid, 'customPlans'),
    { ...plan, savedAt: serverTimestamp() }
  );
  return ref.id;
}

/**
 * Retrieve all custom plans for the given user.
 * Returns an empty array when Firebase is not configured.
 */
export async function getCustomPlans(uid: string): Promise<TariffPlan[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db, 'users', uid, 'customPlans'));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as TariffPlan));
}

/**
 * Delete a single custom plan document.
 */
export async function deleteCustomPlan(uid: string, planId: string): Promise<void> {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, 'users', uid, 'customPlans', planId));
}
