/**
 * NotFoundPage.tsx
 *
 * Real 404 implementation — shown for any unmatched route.
 */
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 64 }}>
      <h1 style={{ fontSize: '4rem', marginBottom: 8 }}>404</h1>
      <h2 style={{ marginBottom: 16 }}>Page not found</h2>
      <p className="field-hint" style={{ marginBottom: 32 }}>
        The page you were looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
