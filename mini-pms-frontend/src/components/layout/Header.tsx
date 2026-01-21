import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Organization } from '../../types';

interface HeaderProps {
  organization?: Organization | null;
  onMenuToggle?: () => void;
}

export function Header({ organization, onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 -ml-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 touch-manipulation"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="flex items-center">
              <span className="text-lg sm:text-xl font-bold text-blue-600">Mini PMS</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {organization && (
              <div className="hidden sm:block text-sm">
                <span className="text-gray-500">Organization:</span>
                <span className="ml-2 font-medium text-gray-900">{organization.name}</span>
              </div>
            )}

            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm text-right">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">
                    {user.isOrgAdmin ? 'Admin' : 'Member'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
