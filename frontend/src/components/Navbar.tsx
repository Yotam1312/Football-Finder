import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Users, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Top navigation bar — shown on every page.
// Shows auth-aware content on the right side based on the current user's login state.
export const Navbar: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when the user clicks anywhere outside of it.
  // This is a common UX pattern for dropdown menus.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Right: Auth section */}
        <div className="flex items-center">
          {isLoading ? (
            // Brief loading placeholder — prevents flicker between guest and logged-in states
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          ) : user === null ? (
            // Guest — show Login and Register links
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
          ) : (
            // Logged in (Level 3) — "Hi, {name}" dropdown
            // Level 2 is removed; all authenticated users are Level 3
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(open => !open)}
                className="text-sm text-gray-700 hover:text-green-600 transition-colors min-h-[48px] flex items-center gap-1"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                Hi, {user.name}
                {/* Small chevron to indicate dropdown */}
                <svg
                  className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      await logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
