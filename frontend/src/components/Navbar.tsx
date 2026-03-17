import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Top navigation bar — shown on every page.
// Shows auth-aware content on the right side based on the current user's level.
export const Navbar: React.FC = () => {
  const { user, isLoading, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {/* Simple text logo — replace with SVG icon in Phase 5 polish */}
          <span className="text-2xl font-bold text-green-600">Football</span>
          <span className="text-2xl font-bold text-gray-800">Finder</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors">
            Home
          </Link>
          <Link to="/fanbase" className="text-gray-600 hover:text-green-600 transition-colors">
            FanBase
          </Link>
          <Link to="/transport" className="text-gray-600 hover:text-green-600 transition-colors">
            Transport
          </Link>

          {/* Auth section — rendered based on login state */}
          {isLoading ? (
            // Placeholder shown briefly while /api/auth/me is in flight
            // Prevents flickering between guest and logged-in states
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          ) : user === null ? (
            // Guest (Level 1) — no login button; the page is accessible at /login
            null
          ) : user.level === 2 ? (
            // Level 2: email-verified but no password set yet
            // No logout button — they have no password to log back in with
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Hi, {user.name}</span>
              <Link
                to="/set-password"
                className="text-sm text-green-600 hover:underline"
              >
                Set a password
              </Link>
            </div>
          ) : (
            // Level 3: full account with password
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Hi, {user.name}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
