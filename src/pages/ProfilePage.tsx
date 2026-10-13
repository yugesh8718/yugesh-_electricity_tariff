/**
 * ProfilePage.tsx — Protected route
 *
 * Shows user info, saved comparison count, and custom plan count.
 * Sign Out redirects to /.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getComparisons, getCustomPlans } from '../lib/firestore';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [comparisonCount, setComparisonCount] = useState<number | null>(null);
  const [planCount, setPlanCount] = useState<number | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login?redirect=/profile', { replace: true });
      return;
    }
    getComparisons(user.uid)
      .then((list) => setComparisonCount(list.length))
      .catch(() => setComparisonCount(0));
    getCustomPlans(user.uid)
      .then((list) => setPlanCount(list.length))
      .catch(() => setPlanCount(0));
  }, [user, loading, navigate]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading profile…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="page profile-page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Your WattWise account.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void handleSignOut()}
        >
          Sign Out
        </button>
      </div>

      <div className="panel ww-card" style={{ maxWidth: 480 }}>
        {/* ── Avatar ──────────────────────────────────────────────────── */}
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={`${user.displayName ?? 'User'} profile photo`}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              marginBottom: '1rem',
              display: 'block',
            }}
            referrerPolicy="no-referrer"
          />
        )}

        {/* ── User info ────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 4px' }}>{user.displayName ?? 'Signed-in user'}</h2>
          <p style={{ color: 'var(--color-neutral-600)', margin: 0 }}>{user.email}</p>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <span className="field-hint">Saved comparisons</span>
            <strong style={{ display: 'block', fontSize: '1.5rem' }}>
              {comparisonCount ?? '—'}
            </strong>
          </div>
          <div>
            <span className="field-hint">Custom plans</span>
            <strong style={{ display: 'block', fontSize: '1.5rem' }}>
              {planCount ?? '—'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
