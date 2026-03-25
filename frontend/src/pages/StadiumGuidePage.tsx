import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFanbaseLeagues } from '../hooks/useFanbaseLeagues';
import { useFanbaseTeams } from '../hooks/useFanbaseTeams';
import { CountryGrid } from '../components/fanbase/CountryGrid';
import { LeagueList } from '../components/fanbase/LeagueList';
import { TeamGrid } from '../components/fanbase/TeamGrid';
import { StadiumHubHero } from '../components/stadiums/StadiumHubHero';
import { StadiumSearchInput } from '../components/stadiums/StadiumSearchInput';
import { StadiumBreadcrumb } from '../components/stadiums/StadiumBreadcrumb';

// Simple fade-in animation for each browse step section
const stepAnimation = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

// Stadium Guide hub page — handles all 3 browse routes via useParams:
//   /stadiums                     → country grid
//   /stadiums/:country            → league list
//   /stadiums/:country/:league    → team grid (navigates to /stadiums/:stadiumId)
export const StadiumGuidePage: React.FC = () => {
  const { country, league: leagueParam } = useParams<{ country?: string; league?: string }>();

  // Capitalize country slug to match DB values (e.g. "england" -> "England")
  const countryName = country
    ? country.charAt(0).toUpperCase() + country.slice(1)
    : undefined;

  // Fetch data — hooks are conditional via the enabled flag internally.
  // Destructure isError + refetch so we can show inline Retry UI on fetch failures
  // (per user decision: browse error states in CONTEXT.md).
  const {
    data: leaguesData,
    isLoading: leaguesLoading,
    isError: leaguesError,
    refetch: refetchLeagues,
  } = useFanbaseLeagues(countryName);
  const {
    data: teamsData,
    isLoading: teamsLoading,
    isError: teamsError,
    refetch: refetchTeams,
  } = useFanbaseTeams(leagueParam);

  // Find the league name for the breadcrumb
  const activeLeague = leaguesData?.leagues.find(l => String(l.id) === leagueParam);

  // Filter out teams that have no stadium assigned — they can't navigate anywhere
  const teamsWithStadium = (teamsData?.teams ?? []).filter(t => t.stadiumId != null);

  // Refs for auto-scroll to next step on mobile
  const leagueRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  // When country param changes (user selected a country), scroll to step 2
  useEffect(() => {
    if (country && leagueRef.current) {
      leagueRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [country]);

  // When league param changes (user selected a league), scroll to step 3
  useEffect(() => {
    if (leagueParam && teamRef.current) {
      teamRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [leagueParam]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-green-50 pb-20 md:pb-0"
    >
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Hero banner with MapPin icon */}
        <StadiumHubHero />

        {/* Search bar — debounced autocomplete for stadium/team names */}
        <div className="mb-10">
          <StadiumSearchInput />
        </div>

        {/* Browse section heading */}
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Or browse by country
        </h2>

        {/* Breadcrumb — only meaningful once a country is selected */}
        {country && (
          <StadiumBreadcrumb
            country={country}
            leagueName={activeLeague?.name}
          />
        )}

        {/* Step 1: Country selection */}
        <motion.section {...stepAnimation}>
          <CountryGrid
            onSelect={() => {/* navigation handled inside CountryGrid via basePath */}}
            basePath="/stadiums"
          />
        </motion.section>

        {/* Step 2: League selection — only shown when country is selected */}
        {country && (
          <motion.section
            ref={leagueRef as React.RefObject<HTMLElement>}
            className="mt-12 scroll-mt-8"
            {...stepAnimation}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {leagueParam ? '2. League' : `2. Select a league in ${countryName}`}
            </h2>

            {/* Inline error state for league fetch failure (per user decision) */}
            {leaguesError && !leaguesLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                <p className="text-sm text-red-700">Couldn't load leagues. Try again.</p>
                <button
                  onClick={() => refetchLeagues()}
                  className="text-sm font-medium text-red-700 hover:text-red-800 bg-white border border-red-300 rounded-md px-3 py-1 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!leaguesError && (
              <LeagueList
                leagues={leaguesData?.leagues ?? []}
                isLoading={leaguesLoading}
                country={country}
                onSelect={() => {/* navigation handled inside LeagueList via basePath */}}
                basePath="/stadiums"
              />
            )}
          </motion.section>
        )}

        {/* Step 3: Team selection — only shown when country and league are selected */}
        {country && leagueParam && (
          <motion.section
            ref={teamRef as React.RefObject<HTMLElement>}
            className="mt-12 scroll-mt-8"
            {...stepAnimation}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              3. Select a team
            </h2>

            {/* Inline error state for team fetch failure (per user decision) */}
            {teamsError && !teamsLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                <p className="text-sm text-red-700">Couldn't load teams. Try again.</p>
                <button
                  onClick={() => refetchTeams()}
                  className="text-sm font-medium text-red-700 hover:text-red-800 bg-white border border-red-300 rounded-md px-3 py-1 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!teamsError && (
              <TeamGrid
                teams={teamsWithStadium}
                isLoading={teamsLoading}
                getNavigateTo={(team) => `/stadiums/${team.stadiumId}`}
              />
            )}
          </motion.section>
        )}
      </div>
    </motion.div>
  );
};
