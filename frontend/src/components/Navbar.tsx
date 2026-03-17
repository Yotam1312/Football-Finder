import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Users, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Top navigation bar — shown on every page.
// Shows auth-aware content on the right side based on the current user's level.
export const Navbar: React.FC = () => {
  const { user, isLoading, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left: Logo with green pin icon + brand name */}
        <Link to="/" className="flex items-center gap-2 min-h-[48px]">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-green-600">Football Finder</span>
        </Link>

        {/* Center: Nav links with icons — flex-1 + justify-center keeps them truly centered
            regardless of how wide the auth section on the right is */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-12">
            <Link
              to="/transport"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors min-h-[48px]"
            >
              <Navigation className="w-4 h-4" />
              Transportation &amp; Navigation
            </Link>
            <Link
              to="/fanbase"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors min-h-[48px]"
            >
              <Users className="w-4 h-4" />
              FanBase Hub
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors min-h-[48px]"
            >
              <Phone className="w-4 h-4" />
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right: Auth section — rendered based on login state */}
        <div className="flex items-center">
          {isLoading ? (
            // Placeholder shown briefly while /api/auth/me is in flight
            // Prevents flickering between guest and logged-in states
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          ) : user === null ? (
            // Guest (Level 1) — show Login and Register buttons
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors min-h-[48px] flex items-center"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors min-h-[48px] flex items-center"
              >
                Register
              </Link>
            </div>
          ) : user.level === 2 ? (
            // Level 2: email-verified but no password set yet
            // No logout button — they have no password to log back in with
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Hi, {user.name}</span>
              <Link
                to="/set-password"
                className="text-sm text-green-600 hover:underline min-h-[48px] flex items-center"
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
                className="text-sm text-gray-600 hover:text-red-600 transition-colors min-h-[48px] flex items-center"
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
