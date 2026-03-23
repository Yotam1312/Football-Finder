import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Users, Phone } from 'lucide-react';
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
    // sticky + top-0 + z-50 keeps the navbar pinned to the top as the user scrolls
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left: Logo — inline SVG (map pin with football) + stacked brand text */}
        <Link to="/" className="flex items-center gap-2.5 min-h-[48px]">
          {/* Map-pin shape with a football (soccer ball) inside, matching the brand logo */}
          <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Pin / teardrop body */}
            <path
              d="M17 1C9.268 1 3 7.268 3 15C3 25.75 17 41 17 41C17 41 31 25.75 31 15C31 7.268 24.732 1 17 1Z"
              fill="#16a34a"
              stroke="#1e3a5f"
              strokeWidth="1.5"
            />
            {/* White circle — football background */}
            <circle cx="17" cy="15" r="9.5" fill="white" stroke="#1e3a5f" strokeWidth="1.2" />
            {/* Central pentagon (dark spot) */}
            <circle cx="17" cy="15" r="3.2" fill="#1e3a5f" />
            {/* Seam lines radiating from center spot — gives football texture */}
            <line x1="17" y1="11.8" x2="14.2" y2="8.8"  stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" />
            <line x1="17" y1="11.8" x2="19.8" y2="8.8"  stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" />
            <line x1="13.5" y1="17" x2="10"   y2="16.5" stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" />
            <line x1="20.5" y1="17" x2="24"   y2="16.5" stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" />
            <line x1="14.5" y1="20" x2="13.2" y2="23.5" stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" />
            <line x1="19.5" y1="20" x2="20.8" y2="23.5" stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" />
          </svg>
          {/* "Football" on top line, "Finder" below — matches the stacked layout of the original */}
          <div className="leading-tight">
            <span className="block text-[15px] font-bold text-[#1e3a5f] tracking-tight">Football</span>
            <span className="block text-[15px] font-bold text-[#1e3a5f] tracking-tight">Finder</span>
          </div>
        </Link>

        {/* Center: Nav links with icons — hidden on mobile (BottomNav handles navigation there)
            flex-1 + justify-center keeps them truly centered on desktop */}
        <div className="flex-1 hidden md:flex items-center justify-center">
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

        {/* Right: Auth section — hidden on mobile (use Profile tab in BottomNav instead) */}
        <div className="hidden md:flex items-center">
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
