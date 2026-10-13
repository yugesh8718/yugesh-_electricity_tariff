/**
 * auth.js
 *
 * Administrator authentication helpers for the Electricity Tariff Comparator.
 *
 * Security model:
 *   - Only Email + Password sign-in is supported for admins.
 *   - After sign-in, the UID is checked against /admins/{uid} in Firestore.
 *   - If the document does not exist, the user is signed out immediately.
 *   - There is NO public sign-up path. The first admin record must be created
 *     manually in the Firebase Console (see README for instructions).
 *   - Authorization is also enforced by Firestore Security Rules — hiding the
 *     admin UI is not the sole protection.
 */

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase/firebase.js';
import { isAdmin } from './firestore.js';

/**
 * Sign in with email and password, then verify admin role.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object}>} Resolves if admin; rejects with descriptive error otherwise.
 */
export async function signInAdmin(email, password) {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Add your .env values and restart.');
  }

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    // Translate Firebase error codes into user-friendly messages
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      throw new Error('Incorrect email or password. Please try again.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please wait a few minutes and try again.');
    }
    throw new Error(error.message || 'Sign-in failed. Please try again.');
  }

  // Check admin role in Firestore
  const adminRecord = await isAdmin(credential.user.uid);
  if (!adminRecord) {
    // Sign out immediately — this user is authenticated but not an admin
    await signOut(auth);
    throw new Error(
      'You are not authorised as an administrator. Contact the project owner to be added.'
    );
  }

  return { user: credential.user };
}

/**
 * Sign out the current administrator.
 * @returns {Promise<void>}
 */
export async function signOutAdmin() {
  if (!auth) return;
  await signOut(auth);
}

/**
 * Subscribe to auth state changes, enriched with an admin-role check.
 *
 * @param {function} callback - Called with {user, isAdminUser} or {user: null, isAdminUser: false}
 * @returns {function} Unsubscribe function
 */
export function onAdminAuthStateChanged(callback) {
  if (!auth) {
    callback({ user: null, isAdminUser: false });
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ user: null, isAdminUser: false });
      return;
    }
    const adminRecord = await isAdmin(user.uid);
    callback({ user, isAdminUser: adminRecord });
  });
}
