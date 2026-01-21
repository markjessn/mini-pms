import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingOverlay } from '../components/ui';

export function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingOverlay />;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, redirect to their organization
  if (user?.organization?.slug) {
    return <Navigate to={`/${user.organization.slug}`} replace />;
  }

  // Fallback - shouldn't happen normally
  return <Navigate to="/login" replace />;
}
