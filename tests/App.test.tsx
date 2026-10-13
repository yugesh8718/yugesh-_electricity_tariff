/**
 * App.test.tsx
 *
 * Tests for the WattWise application shell.
 * Firebase is mocked (not configured) so the app runs in guest/demo mode.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Mock Firebase config (not configured → guest mode)
// ---------------------------------------------------------------------------
vi.mock('../src/firebase/config', () => ({
  auth: null,
  db: null,
  isConfigured: false,
  isFirebaseConfigured: false,
}));

vi.mock('../src/firebase/firebase.js', () => ({
  auth: null,
  db: null,
  googleProvider: null,
  isFirebaseConfigured: false,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => null),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => null),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => null),
  GoogleAuthProvider: vi.fn(() => ({})),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, cb) => {
    // Immediately resolve with no user (guest mode)
    cb(null);
    return () => {};
  }),
}));

// Mock lang so tests don't need localStorage or a Provider
vi.mock('../src/lib/lang.jsx', () => ({
  LangProvider: ({ children }: { children: React.ReactNode }) => children,
  useLang: () => ({
    lang: 'en',
    toggle: () => {},
    t: (key: string) => key,
  }),
}));

// ---------------------------------------------------------------------------
// Import pages for direct rendering
// ---------------------------------------------------------------------------
import LandingPage from '../src/pages/LandingPage';
import NotFoundPage from '../src/pages/NotFoundPage';

// ---------------------------------------------------------------------------
// Import AuthProvider to wrap components that call useAuth
// ---------------------------------------------------------------------------
import { AuthProvider } from '../src/contexts/AuthContext';

function renderInProviders(ui: React.ReactElement, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// LandingPage tests
// ---------------------------------------------------------------------------
describe('LandingPage', () => {
  afterEach(() => cleanup());

  it('renders the WattWise tagline heading', () => {
    renderInProviders(<LandingPage />);
    // WattWise brand name appears as eyebrow text; h1 contains the product tagline
    expect(
      screen.getByRole('heading', { name: /Know Your Electricity Plan/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('has a "Start Comparing" call-to-action link', () => {
    renderInProviders(<LandingPage />);
    expect(screen.getByRole('link', { name: /start comparing/i })).toBeInTheDocument();
  });

  it('has a "View Plans" call-to-action link', () => {
    renderInProviders(<LandingPage />);
    expect(screen.getByRole('link', { name: /view plans/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// NotFoundPage tests
// ---------------------------------------------------------------------------
describe('NotFoundPage', () => {
  afterEach(() => cleanup());

  it('renders a 404 heading', () => {
    renderInProviders(<NotFoundPage />);
    expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument();
  });

  it('has a link back to home', () => {
    renderInProviders(<NotFoundPage />);
    const homeLink = screen.getByRole('link', { name: /back to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
