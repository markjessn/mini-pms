import { Link } from 'react-router-dom';
import { Organization } from '../../types';

interface HeaderProps {
  organization?: Organization | null;
  onMenuToggle?: () => void;
}

export function Header({ organization, onMenuToggle }: HeaderProps) {
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

          {organization && (
            <div className="flex items-center">
              <div className="text-sm hidden sm:block">
                <span className="text-gray-500">Organization:</span>
                <span className="ml-2 font-medium text-gray-900">{organization.name}</span>
              </div>
              <div className="text-sm sm:hidden">
                <span className="font-medium text-gray-900 truncate max-w-30 block">
                  {organization.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
