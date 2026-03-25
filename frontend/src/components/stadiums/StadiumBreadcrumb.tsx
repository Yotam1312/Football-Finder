import React from 'react';
import { Link } from 'react-router-dom';

interface StadiumBreadcrumbProps {
  country?: string;     // URL slug (e.g. "england")
  leagueName?: string;  // Display name (e.g. "Premier League")
}

// Converts a slug back to a display name: "england" -> "England"
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Breadcrumb navigation for the Stadium Guide browse flow.
// Same structure as FanBaseBreadcrumb but links to /stadiums paths.
export const StadiumBreadcrumb: React.FC<StadiumBreadcrumbProps> = ({ country, leagueName }) => {
  return (
    <nav aria-label="Browse navigation" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <Link to="/stadiums" className="hover:text-green-600 transition-colors font-medium">
        Stadiums
      </Link>

      {country && (
        <>
          <span className="text-gray-300">/</span>
          {leagueName ? (
            <Link to={`/stadiums/${country}`} className="hover:text-green-600 transition-colors">
              {capitalize(country)}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{capitalize(country)}</span>
          )}
        </>
      )}

      {leagueName && (
        <>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{leagueName}</span>
        </>
      )}
    </nav>
  );
};
