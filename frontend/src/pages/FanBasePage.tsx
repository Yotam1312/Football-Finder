import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFanbaseCountries } from '../hooks/useFanbaseCountries';
import { useFanbaseLeagues } from '../hooks/useFanbaseLeagues';
import { useFanbaseTeams } from '../hooks/useFanbaseTeams';
import { CountryGrid } from '../components/fanbase/CountryGrid';
import { LeagueList } from '../components/fanbase/LeagueList';
import { TeamGrid } from '../components/fanbase/TeamGrid';
import { TeamSearchInput } from '../components/fanbase/TeamSearchInput';
import { FanBaseBreadcrumb } from '../components/fanbase/FanBaseBreadcrumb';

// Simple fade-in animation for each step section
const stepAnimation = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

export const FanBasePage: React.FC = () => {
  // :country is a lowercase slug ("england"), :league is the league DB id as a string ("39")
  const { country, league: leagueParam } = useParams<{ country?: string; league?: string }>();

  // Capitalize country slug to match DB values (e.g. "england" → "England")
  const countryName = country
    ? country.charAt(0).toUpperCase() + country.slice(1)
    : undefined;

  // Fetch data — hooks are conditional via the enabled flag internally
  const { data: _countriesData } = useFanbaseCountries();
  const { data: leaguesData, isLoading: leaguesLoading } = useFanbaseLeagues(countryName);
  const { data: teamsData, isLoading: teamsLoading } = useFanbaseTeams(leagueParam);

  // Find the league name for the breadcrumb by matching leagueParam (id) against fetched leagues
  const activeLeague = leaguesData?.leagues.find(l => String(l.id) === leagueParam);

  // Refs for auto-scroll to next step on mobile
  const leagueRef = useRef<HTMLDivElement>(null);
  const teamRef   = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">FanBase</h1>
          <p className="text-gray-500">Browse community tips, seat guides, and pub recommendations by team.</p>
        </div>

        {/* Breadcrumb */}
        <FanBaseBreadcrumb
          country={country}
          leagueName={activeLeague?.name}
        />

        {/* Live team search — always visible at the top */}
        <div className="mb-10">
          <p className="text-sm text-gray-500 mb-2">Search directly for a team:</p>
          <TeamSearchInput />
        </div>

        {/* Step 1: Country selection */}
        <motion.section {...stepAnimation}>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {country ? '1. Country' : '1. Select a country'}
          </h2>
          <CountryGrid onSelect={() => {/* navigation handled inside CountryGrid */}} />
        </motion.section>

        {/* Step 2: League selection — only shown when country is selected */}
        {country && (
          <motion.section
            ref={leagueRef as React.RefObject<HTMLElement>}
            className="mt-10 scroll-mt-8"
            {...stepAnimation}
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {leagueParam ? '2. League' : `2. Select a league in ${countryName}`}
            </h2>
            <LeagueList
              leagues={leaguesData?.leagues ?? []}
              isLoading={leaguesLoading}
              country={country}
              onSelect={() => {/* navigation handled inside LeagueList */}}
            />
          </motion.section>
        )}

        {/* Step 3: Team selection — only shown when country and league are selected */}
        {country && leagueParam && (
          <motion.section
            ref={teamRef as React.RefObject<HTMLElement>}
            className="mt-10 scroll-mt-8"
            {...stepAnimation}
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              3. Select a team
            </h2>
            <TeamGrid
              teams={teamsData?.teams ?? []}
              isLoading={teamsLoading}
            />
          </motion.section>
        )}
      </div>
    </div>
  );
};
