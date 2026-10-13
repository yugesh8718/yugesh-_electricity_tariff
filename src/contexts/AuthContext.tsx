/**
 * AuthContext.tsx
 *
 * Google-only authentication context for WattWise.
 *
 * Provides:
 *   - user (User | null) — current Firebase User
 *   - loading (boolean) — auth state not yet resolved
 *   - signInWithGoogle() — opens popup; prevents duplicate clicks
 *   - signOut() — signs out and clears user
 *
 * Gracefully handles auth === null (Firebase not configured) and all 9
 * specified Firebase error codes with friendly user-facing messages.
 *
 * Usage:
 *   import { useAuth, AuthProvider } from '../contexts/AuthContext';
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase/config';

// ---------------------------------------------------------------------------
// Error code → friendly message
// ---------------------------------------------------------------------------

function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this project. Please contact support.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised in Firebase. Add it under Authentication → Settings → Authorised domains.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this page and try again.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'A sign-in popup is already open. Please complete or close it first.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/invalid-api-key':
      return 'Firebase API key is invalid. Please check your environment configuration.';
    case 'auth/configuration-not-found':
      return 'Firebase configuration was not found. Please verify your project settings.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with a different sign-in method. Please use the original sign-in method.';
    default:
      return (error as { message?: string })?.message ?? 'Authentication failed. Please try again.';
  }
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** True when the current user authenticated via phone OTP */
  isPhoneUser: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  // Busy flag prevents duplicate popup clicks
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!auth) {
      // Firebase not configured — resolve immediately with no user
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setAuthError(
        'Firebase is not configured. Fill in VITE_FIREBASE_* in .env and restart the dev server.',
      );
      return;
    }
    if (busy) return;
    setBusy(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      const code = (error as { code?: string })?.code ?? '';
      // cancelled-popup-request is benign — suppress it
      if (code !== 'auth/cancelled-popup-request') {
        setAuthError(friendlyAuthError(error));
      }
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const signOut = useCallback(async () => {
    if (!auth) return;
    setAuthError(null);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    }
  }, []);

  // Detect phone-authenticated user (providerData contains 'phone' provider)
  const isPhoneUser = !!(user?.providerData?.some((p) => p.providerId === 'phone'));

  return (
    <AuthContext.Provider value={{ user, loading, authError, signInWithGoogle, signOut, isPhoneUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
