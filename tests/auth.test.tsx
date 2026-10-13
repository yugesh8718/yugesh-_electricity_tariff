/**
 * auth.test.ts
 *
 * Tests for AuthContext / AuthProvider using mocked Firebase auth.
 */
import { describe, it, expect, vi, afterEach, type Mock } from 'vitest';
import { render, screen, act, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// ─── Mock Firebase ───────────────────────────────────────────────────────────

const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockFirebaseSignOut = vi.fn();

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  // GoogleAuthProvider must be a class (constructable)
  GoogleAuthProvider: class GoogleAuthProvider {
    constructor() {}
  },
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

vi.mock('../src/firebase/config', () => ({
  auth: { /* non-null mock auth object */ uid: 'mock-auth' },
  db: null,
  isConfigured: true,
  isFirebaseConfigured: true,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => null),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => null),
}));

vi.mock('../src/lib/lang.jsx', () => ({
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
  useLang: () => ({ lang: 'en', toggle: () => {}, t: (k: string) => k }),
}));

// ─── Import after mocks ───────────────────────────────────────────────────────

import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

// ─── Test component ────────────────────────────────────────────────────────────

function AuthTestConsumer() {
  const { user, loading, authError, signInWithGoogle, signOut } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? user.displayName ?? user.uid : 'null'}</div>
      <div data-testid="error">{authError ?? ''}</div>
      <button onClick={() => void signInWithGoogle()}>Sign In</button>
      <button onClick={() => void signOut()}>Sign Out</button>
    </div>
  );
}

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthTestConsumer />
      </AuthProvider>
    </MemoryRouter>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('loading state starts true and becomes false after onAuthStateChanged resolves', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: null) => void) => {
      setTimeout(() => cb(null), 0);
      return () => {};
    });

    renderWithProviders();
    // Initially loading
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // After callback fires
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('user is null in guest mode (onAuthStateChanged fires with null)', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: null) => void) => {
      cb(null);
      return () => {};
    });

    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('login success sets user', async () => {
    const fakeUser = { uid: 'u1', displayName: 'Alice', email: 'alice@example.com' };
    let authCallback: ((u: typeof fakeUser | null) => void) | null = null;

    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, cb: (u: typeof fakeUser | null) => void) => {
        authCallback = cb;
        cb(null);
        return () => {};
      }
    );
    // When signInWithPopup resolves, fire the authStateChanged callback
    mockSignInWithPopup.mockImplementation(() => {
      return Promise.resolve({ user: fakeUser }).then((result) => {
        authCallback?.(fakeUser);
        return result;
      });
    });

    renderWithProviders();
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      await userEvent.click(screen.getByText('Sign In'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Alice');
    });
  });

  it('popup-closed-by-user error shows friendly message', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: null) => void) => {
      cb(null);
      return () => {};
    });
    mockSignInWithPopup.mockRejectedValue({ code: 'auth/popup-closed-by-user' });

    renderWithProviders();
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      await userEvent.click(screen.getByText('Sign In'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toMatch(/closed before completing/i);
    });
  });

  it('signOut clears user', async () => {
    const fakeUser = { uid: 'u2', displayName: 'Bob', email: 'bob@example.com' };
    let authCallback: ((u: typeof fakeUser | null) => void) | null = null;

    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, cb: (u: typeof fakeUser | null) => void) => {
        authCallback = cb;
        cb(fakeUser); // start signed in
        return () => {};
      }
    );
    mockFirebaseSignOut.mockImplementation(() => {
      authCallback?.(null);
      return Promise.resolve();
    });

    renderWithProviders();
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Bob'));

    await act(async () => {
      await userEvent.click(screen.getByText('Sign Out'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('onAuthStateChanged restores auth state on reload (user present from the start)', async () => {
    const fakeUser = { uid: 'u3', displayName: 'Carol', email: 'carol@example.com' };
    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, cb: (u: typeof fakeUser) => void) => {
        cb(fakeUser);
        return () => {};
      }
    );

    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Carol');
    });
  });
});
