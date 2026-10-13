/**
 * LoginPage.tsx
 *
 * Wraps AuthPanel. Reads redirect param from URL. Redirects after login.
 */
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthPanel from '../components/AuthPanel';
import { isConfigured } from '../firebase/config';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/profile';

  // If already signed in, redirect immediately
  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  return (
    <div className="page login-page">
      <div className="page-header">
        <div>
          <h1>Sign in</h1>
          <p>Sign in to save comparisons and access your profile.</p>
        </div>
      </div>

      {!isConfigured && (
        <div className="notice demo-notice" role="note" style={{ marginBottom: '1.5rem' }}>
          Firebase is not configured. Google sign-in and cloud saving are unavailable.
          The calculator works in guest mode without an account.
        </div>
      )}

      <div style={{ maxWidth: 480 }}>
        <AuthPanel />
      </div>
    </div>
  );
}
