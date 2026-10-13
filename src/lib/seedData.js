/**
 * seedData.js
 *
 * Exports DEMO_* constants (re-exported from demoTariffs.js for convenience)
 * and the seedDemoData() function that writes them to Firestore.
 *
 * ⚠️  DEMO DATA — NOT VERIFIED OFFICIAL RATES ⚠️
 */

import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';

// Re-export the pure data so callers only need one import
import { DEMO_STATE, DEMO_DISCOM, DEMO_CATEGORY, DEMO_TARIFFS } from './demoTariffs.js';
export { DEMO_STATE, DEMO_DISCOM, DEMO_CATEGORY, DEMO_TARIFFS };

/**
 * seedDemoData
 *
 * Writes DEMO_STATE, DEMO_DISCOM, DEMO_CATEGORY, and DEMO_TARIFFS to Firestore.
 * Uses setDoc with merge:true — safe to run multiple times.
 *
 * Throws if db is null (Firebase not configured).
 * @returns {Promise<void>}
 */
export async function seedDemoData() {
  if (!db) {
    throw new Error(
      'Firebase is not configured. Add your VITE_ values to .env before seeding.'
    );
  }

  await setDoc(doc(db, 'states', DEMO_STATE.id), DEMO_STATE, { merge: true });
  await setDoc(doc(db, 'discoms', DEMO_DISCOM.id), DEMO_DISCOM, { merge: true });
  await setDoc(doc(db, 'categories', DEMO_CATEGORY.id), DEMO_CATEGORY, { merge: true });

  for (const tariff of DEMO_TARIFFS) {
    const { id, ...fields } = tariff;
    await setDoc(doc(db, 'tariffs', id), fields, { merge: true });
  }
}
