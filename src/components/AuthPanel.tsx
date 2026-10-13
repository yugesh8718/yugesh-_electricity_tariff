/**
 * AuthPanel.tsx
 *
 * Google-only authentication panel.
 * Replaces the old phone-OTP AuthPanel.jsx.
 *
 * - Shows "Continue with Google" button
 * - Shows signed-in user name + Sign Out when authenticated
 * - Handles Firebase-not-configured state with a clear message
 * - Shows auth errors inline
 * - Prevents duplicate clicks via AuthContext busy state
 */
import { isConfigured } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPanel() {
  const { user, authError, signInWithGoogle, signOut } = useAuth();

  // ── Not configured ─────────────────────────────────────────────────────────
  if (!isConfigured) {
    return (
      <section className="auth-panel" aria-labelledby="auth-panel-heading">
        <div className="auth-copy">
          <p className="eyebrow">OPTIONAL CLOUD FEATURES</p>
          <h2 id="auth-panel-heading">Firebase is not connected</h2>
          <p>
            The calculator works in guest mode without Firebase. To enable Google sign-in
            and cloud saving, fill in your <code>VITE_FIREBASE_*</code> values in the{' '}
            <code>.env</code> file and restart the dev server.
          </p>
        </div>
        <span className="auth-status">Guest mode — no account required</span>
      </section>
    );
  }

  // ── Signed in ─────────────────────────────────────────────────────────────
  if (user) {
    return (
      <section className="auth-panel" aria-labelledby="auth-panel-heading">
        <div className="auth-copy">
          <p className="eyebrow">ACCOUNT</p>
          <h2 id="auth-panel-heading">
            {user.displayName ? `Signed in as ${user.displayName}` : 'Signed in'}
          </h2>
          <p>Your comparisons are saved to your private Firestore collection.</p>
        </div>
        <div className="auth-actions">
          <button
            className="auth-button quiet"
            onClick={() => void signOut()}
            type="button"
          >
            Sign out
          </button>
        </div>
        {authError && (
          <p className="auth-message" role="alert" aria-live="assertive">
            {authError}
          </p>
        )}
      </section>
    );
  }

  // ── Sign-in ────────────────────────────────────────────────────────────────
  return (
    <section className="auth-panel" aria-labelledby="auth-panel-heading">
      <div className="auth-copy">
        <p className="eyebrow">ACCOUNT &amp; CLOUD SAVE</p>
        <h2 id="auth-panel-heading">Sign in to save your comparison</h2>
        <p>The calculator works without signing in. Sign in to save results to the cloud.</p>
      </div>

      <div className="auth-actions">
        <button
          className="auth-button primary"
          onClick={() => void signInWithGoogle()}
          type="button"
        >
          Continue with Google
        </button>
      </div>

      {authError && (
        <p className="auth-message" role="alert" aria-live="assertive">
          {authError}
        </p>
      )}
    </section>
  );
}
