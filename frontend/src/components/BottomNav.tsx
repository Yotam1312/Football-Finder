import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Pages where the bottom nav should not appear.
// Auth and onboarding pages have their own full-screen layouts.
const HIDDEN_ROUTES = ['/login', '/register', '/welcome'];

// Each tab definition: label, icon component, default path, and which URL prefixes count as "active".
const tabs = [
  {
    label: 'Search',
    icon: Search,
    path: '/',
    // Active when on the home page, results, or a specific match detail
    matchPrefixes: ['/', '/results', '/match'],
  },
  {
    label: 'FanBase',
    icon: Users,
    path: '/fanbase',
    matchPrefixes: ['/fanbase'],
  },
  {
    label: 'Profile',
    icon: User,
    path: '/profile',
    matchPrefixes: ['/profile'],
  },
];

// BottomNav — fixed 3-tab navigation bar shown only on mobile (<768px).
// Rendered outside AnimatePresence in App.tsx so it does not animate on route changes.
export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Hide the bar on auth/onboarding pages where it would be out of place
  if (HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }

  // Determine if a tab is the active one based on the current pathname.
  // Search tab is special: it matches '/' exactly OR prefixes like '/results', '/match'.
  // We avoid making '/fanbase' accidentally match '/' by checking prefix order carefully.
  const isTabActive = (tab: (typeof tabs)[0]): boolean => {
    if (tab.path === '/') {
      // Home/Search tab: active on exactly '/', or on /results, /match/:id
      return (
        location.pathname === '/' ||
        location.pathname.startsWith('/results') ||
        location.pathname.startsWith('/match')
      );
    }
    // All other tabs: active if the current path starts with any of the tab's prefixes
    return tab.matchPrefixes.some(prefix => location.pathname.startsWith(prefix));
  };

  return (
    // md:hidden — only visible on screens narrower than 768px (mobile)
    // pb-[env(safe-area-inset-bottom)] — respects the iPhone home indicator safe area
    // z-50 — stays above page content; same level as Navbar
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14">
        {tabs.map(tab => {
          const active = isTabActive(tab);

          // Profile tab: redirect guests to /login instead of /profile
          const destination = tab.path === '/profile' && user === null ? '/login' : tab.path;

          return (
            <Link
              key={tab.label}
              to={destination}
              // min-h-[48px] ensures the touch target meets the 48px minimum recommended size
              className={`flex flex-col items-center justify-center min-h-[48px] flex-1 gap-0.5 ${
                active ? 'text-green-600 font-medium' : 'text-gray-500'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
