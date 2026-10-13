/**
 * ProfilePage.tsx — stub (full implementation in FEAT-004)
 * Protected route — requires authentication.
 */
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>Signed in as {user?.displayName ?? user?.email ?? 'user'}.</p>
        </div>
      </div>
      <p className="field-hint">Profile page coming soon.</p>
    </div>
  );
}
