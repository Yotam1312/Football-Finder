import React from 'react';
import { Link } from 'react-router-dom';

// Top navigation bar — shown on every page.
// Kept simple: logo/brand name on the left, no auth links yet (Phase 4).
export const Navbar: React.FC = () => {
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
        </div>
      </div>
    </nav>
  );
};
