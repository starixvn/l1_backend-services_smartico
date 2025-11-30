import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Root layout component with header navigation
 */
export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-secondary-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">SabaONE</h1>
                <p className="text-xs text-secondary-500">Back Office</p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-6">
                <Link
                  to="/tournaments"
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive('/tournaments')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-100'
                    }
                  `}
                >
                  Tournaments
                </Link>

                <Link
                  to="/missions"
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive('/missions')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-100'
                    }
                  `}
                >
                  Missions
                </Link>

                <Link
                  to="/bonuses"
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive('/bonuses')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-100'
                    }
                  `}
                >
                  Bonuses
                </Link>

                <Link
                  to="/levels"
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive('/levels')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-100'
                    }
                  `}
                >
                  Levels
                </Link>

                <Link
                  to="/badges"
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive('/badges')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-100'
                    }
                  `}
                >
                  Badges
                </Link>
              </nav>

              {/* User Info & Logout */}
              <div className="flex items-center gap-3 border-l border-secondary-200 pl-6">
                <div className="text-right">
                  <div className="text-sm font-medium text-secondary-900">
                    {user?.fullName}
                  </div>
                  <div className="text-xs text-secondary-500">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-secondary-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-secondary-600">
            <p>&copy; 2025 SabaONE. Back Office Campaign Management.</p>
            <p>Tournament Builder MVP - Demo</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
