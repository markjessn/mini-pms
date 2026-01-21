import { useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingOverlay } from '../ui';
import type { Organization } from '../../types';

interface LayoutProps {
  children: ReactNode;
  organization?: Organization | null;
  orgSlug?: string;
}

export function Layout({ children, organization, orgSlug }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();

  // Wait for auth check to complete
  if (isLoading) {
    return <LoadingOverlay />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Ensure user can only access their own organization
  if (orgSlug && user?.organization?.slug && user.organization.slug !== orgSlug) {
    return <Navigate to={`/${user.organization.slug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        organization={organization}
        onMenuToggle={() => setSidebarOpen(true)}
      />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
