/**
 * AuthPanel.tsx
 *
 * Authentication panel with two sign-in methods:
 *   1. Continue with Google (popup)
 *   2. Sign in with Phone Number (OTP via Firebase Phone Auth)
 *
 * - Shows signed-in state with user details and Sign Out button
 * - Handles Firebase-not-configured state gracefully
 * - Phone user: shows phone number; Google user: shows display name
 * - Neither method grants admin access
 */
import { useState } from 'react';
import { isConfigured } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import PhoneAuthPanel from './PhoneAuthPanel';

type AuthTab = 'google' | 'phone';

export default function AuthPanel() {
  const { user, authError, signInWithGoogle, signOut, isPhoneUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>('google');

  // ── Not configured ────────────────────────────────────────────────────────
  if (!isConfigured) {
    return (
      <section className="auth-panel" aria-labelledby="auth-panel-heading">
        <div className="auth-copy">
          <p className="eyebrow">OPTIONAL CLOUD FEATURES</p>
          <h2 id="auth-panel-heading">Firebase இணைக்கப்படவில்லை (Firebase not connected)</h2>
          <p>
            The calculator works in guest mode without Firebase. To enable sign-in and
            cloud saving, fill in <code>VITE_FIREBASE_*</code> in <code>.env</code> and
            restart the dev server.
          </p>
        </div>
        <span className="auth-status">Guest mode — no account required</span>
      </section>
    );
  }

  // ── Signed in ─────────────────────────────────────────────────────────────
  if (user) {
    const displayLabel = isPhoneUser
      ? (user.phoneNumber ?? 'Phone user')
      : (user.displayName ?? user.email ?? 'Signed in');

    return (
      <section className="auth-panel" aria-labelledby="auth-panel-heading">
        <div className="auth-copy">
          <p className="eyebrow">ACCOUNT</p>
          <h2 id="auth-panel-heading">
            {isPhoneUser ? '📱' : '🔑'} {displayLabel}
          </h2>
          <p>உங்கள் ஒப்பீடுகள் Firebase-ல் சேமிக்கப்படுகின்றன. (Your comparisons are saved to Firebase.)</p>
        </div>
        <div className="auth-actions">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={displayLabel}
              style={{ width: 40, height: 40, borderRadius: '50%', marginBottom: '0.5rem' }}
            />
          )}
          <button
            className="auth-button quiet"
            onClick={() => void signOut()}
            type="button"
          >
            வெளியேறு (Sign out)
          </button>
        </div>
        {authError && (
          <p className="auth-message" role="alert" aria-live="assertive">{authError}</p>
        )}
      </section>
    );
  }

  // ── Sign-in tabs ──────────────────────────────────────────────────────────
  return (
    <section className="auth-panel" aria-labelledby="auth-panel-heading">
      <div className="auth-copy">
        <p className="eyebrow">ACCOUNT &amp; CLOUD SAVE</p>
        <h2 id="auth-panel-heading">உள்நுழையவும் (Sign in)</h2>
        <p>கணக்கீடுகளை சேமிக்க உள்நுழையவும். (Sign in to save your comparisons to the cloud.)</p>
      </div>

      {/* Tab switcher */}
      <div className="auth-tabs" role="tablist" aria-label="Sign-in method">
        <button
          role="tab"
          type="button"
          aria-selected={activeTab === 'google'}
          className={`auth-tab ${activeTab === 'google' ? 'auth-tab--active' : ''}`}
          onClick={() => setActiveTab('google')}
        >
          🔑 Google
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={activeTab === 'phone'}
          className={`auth-tab ${activeTab === 'phone' ? 'auth-tab--active' : ''}`}
          onClick={() => setActiveTab('phone')}
        >
          📱 Phone OTP
        </button>
      </div>

      {/* Google tab */}
      {activeTab === 'google' && (
        <div className="auth-actions" role="tabpanel">
          <button
            className="auth-button primary"
            onClick={() => void signInWithGoogle()}
            type="button"
          >
            Continue with Google
          </button>
          {authError && (
            <p className="auth-message" role="alert" aria-live="assertive">{authError}</p>
          )}
        </div>
      )}

      {/* Phone tab */}
      {activeTab === 'phone' && (
        <div role="tabpanel">
          <PhoneAuthPanel />
        </div>
      )}
    </section>
  );
}
