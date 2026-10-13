/**
 * ProtectedRoute.tsx
 *
 * Wraps a set of routes that require authentication.
 * - While auth state is loading → renders LoadingSpinner
 * - If no user → redirects to /login?redirect=<current-path>
 * - If signed in → renders nested <Outlet />
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}
