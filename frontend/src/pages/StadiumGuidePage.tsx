import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { useFanbaseCountries } from '../hooks/useFanbaseCountries';
import { useFanbaseLeagues } from '../hooks/useFanbaseLeagues';
import { useStadiumsByLeague } from '../hooks/useStadiumsByLeague';
import { StadiumHubHero } from '../components/stadiums/StadiumHubHero';
import { StadiumFilterSidebar } from '../components/stadiums/StadiumFilterSidebar';
import { StadiumCard } from '../components/stadiums/StadiumCard';

// Stadium Guide hub — sidebar + grid layout.
// Users pick a country and league in the left sidebar; the right side shows
// all stadiums for that league as clickable cards.
// This is different from FanBase: browse state is local (not URL-based),
// and the destination is a stadium page — not a team fan community.
export const StadiumGuidePage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [sidebarOpenOnMobile, setSidebarOpenOnMobile] = useState(false);

  // Fetch countries for the sidebar (cached — rarely changes)
  const { data: countriesData } = useFanbaseCountries();
  const countries = countriesData?.countries ?? [];

  // Fetch leagues when a country is selected
  const { data: leaguesData, isLoading: leaguesLoading } = useFanbaseLeagues(
    selectedCountry ?? undefined
  );
  const leagues = leaguesData?.leagues ?? [];

  // Fetch stadiums when a league is selected
  const {
    data: stadiumsData,
    isLoading: stadiumsLoading,
    isError: stadiumsError,
    refetch: refetchStadiums,
  } = useStadiumsByLeague(selectedLeagueId);
  const stadiums = stadiumsData?.stadiums ?? [];

  // When the user picks a country, reset the league selection
  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSelectedLeagueId(null);
    // Close mobile sidebar after selecting a country so the league list is visible
  };

  const handleLeagueSelect = (leagueId: number) => {
    setSelectedLeagueId(leagueId);
    // Close mobile sidebar so the grid becomes visible on small screens
    setSidebarOpenOnMobile(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-gray-100 pb-20 md:pb-0"
    >
      {/* Dark slate hero with search bar */}
      <StadiumHubHero />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Mobile: filter toggle button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setSidebarOpenOnMobile(open => !open)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {sidebarOpenOnMobile ? 'Hide filters' : 'Filter by country & league'}
          </button>
        </div>

        <div className="flex gap-6 items-start">
          {/* Left sidebar — country + league selector */}
          <StadiumFilterSidebar
            countries={countries}
            selectedCountry={selectedCountry}
            onCountrySelect={handleCountrySelect}
            leagues={leagues}
            leaguesLoading={leaguesLoading}
            selectedLeagueId={selectedLeagueId}
            onLeagueSelect={handleLeagueSelect}
            isOpenOnMobile={sidebarOpenOnMobile}
          />

          {/* Right side — stadium grid */}
          <main className="flex-1 min-w-0">
            {/* No league selected yet — prompt the user */}
            {!selectedLeagueId && !stadiumsLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <MapPin className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-1">
                  Select a league to browse stadiums
                </h3>
                <p className="text-sm text-gray-400">
                  Choose a country{selectedCountry ? ', then a league' : ' from the sidebar'}.
                </p>
              </motion.div>
            )}

            {/* Loading skeletons */}
            {stadiumsLoading && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {stadiumsError && !stadiumsLoading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center justify-between">
                <p className="text-sm text-red-700">Couldn't load stadiums. Try again.</p>
                <button
                  onClick={() => refetchStadiums()}
                  className="text-sm font-medium text-red-700 hover:text-red-800 bg-white border border-red-300 rounded-md px-3 py-1.5 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Stadium grid */}
            {!stadiumsLoading && !stadiumsError && stadiums.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {stadiums.map(stadium => (
                  <StadiumCard key={stadium.id} stadium={stadium} />
                ))}
              </motion.div>
            )}

            {/* League selected but no stadiums found */}
            {!stadiumsLoading && !stadiumsError && selectedLeagueId && stadiums.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-gray-500 text-sm">No stadiums found for this league.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
};
