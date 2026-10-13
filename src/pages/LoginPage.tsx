/**
 * LoginPage.tsx — stub (full implementation in FEAT-004)
 */
import AuthPanel from '../components/AuthPanel';

export default function LoginPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Sign in</h1>
          <p>Sign in to save comparisons and access your profile.</p>
        </div>
      </div>
      <AuthPanel />
    </div>
  );
}
