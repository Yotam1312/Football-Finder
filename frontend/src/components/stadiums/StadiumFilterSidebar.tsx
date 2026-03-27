import React from 'react';
import { Globe, Trophy } from 'lucide-react';
import type { League } from '../../types';

interface StadiumFilterSidebarProps {
  countries: string[];
  selectedCountry: string | null;
  onCountrySelect: (country: string) => void;
  leagues: League[];
  leaguesLoading: boolean;
  selectedLeagueId: number | null;
  onLeagueSelect: (leagueId: number) => void;
  // Controls visibility on mobile — on desktop (md+) always visible
  isOpenOnMobile: boolean;
}

// Filter sidebar for the Stadium Guide browse page.
// On desktop: fixed-width left column, always visible.
// On mobile: shown/hidden based on isOpenOnMobile, controlled by the parent page.
export const StadiumFilterSidebar: React.FC<StadiumFilterSidebarProps> = ({
  countries,
  selectedCountry,
  onCountrySelect,
  leagues,
  leaguesLoading,
  selectedLeagueId,
  onLeagueSelect,
  isOpenOnMobile,
}) => {
  return (
    <aside
      className={`
        ${isOpenOnMobile ? 'block' : 'hidden'} md:block
        w-full md:w-56 shrink-0
      `}
    >
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Country section */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Country</span>
        </div>

        <ul className="max-h-64 overflow-y-auto">
          {countries.map(country => (
            <li key={country}>
              <button
                onClick={() => onCountrySelect(country)}
                className={`
                  w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${selectedCountry === country
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {country}
              </button>
            </li>
          ))}
        </ul>

        {/* League section — only shown when a country is selected */}
        {selectedCountry && (
          <>
            <div className="px-4 py-3 border-t border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <Trophy className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">League</span>
            </div>

            {leaguesLoading ? (
              <div className="px-4 py-3 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <ul className="max-h-64 overflow-y-auto">
                {leagues.map(league => (
                  <li key={league.id}>
                    <button
                      onClick={() => onLeagueSelect(league.id)}
                      className={`
                        w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-sm transition-colors
                        ${selectedLeagueId === league.id
                          ? 'bg-slate-800 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {league.logoUrl && (
                        <img
                          src={league.logoUrl}
                          alt=""
                          className="w-5 h-5 object-contain flex-shrink-0"
                        />
                      )}
                      <span className="leading-tight">{league.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
