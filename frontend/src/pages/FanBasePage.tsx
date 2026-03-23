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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-gray-50 pb-20 md:pb-0"
    >

      {/* Hero banner — gradient green matching the homepage style */}
      <section
        className="text-white py-16 px-4"
        style={{ background: 'linear-gradient(160deg, #14532d 0%, #166534 40%, #15803d 100%)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-5xl font-extrabold tracking-tight mb-3"
          >
            FanBase
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="text-green-200 text-lg font-light mb-8"
          >
            Community tips, seat guides, and pub recommendations from fans worldwide.
          </motion.p>

          {/* Search bar lives in the hero so it's the first thing users see */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
          >
            <TeamSearchInput />
          </motion.div>
        </div>
      </section>

      {/* Page body */}
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Breadcrumb — only meaningful once a country is selected */}
        {country && (
          <FanBaseBreadcrumb
            country={country}
            leagueName={activeLeague?.name}
          />
        )}

        {/* Step 1: Country selection */}
        <motion.section {...stepAnimation}>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {country ? '1. Country' : 'Select a country'}
          </h2>
          <CountryGrid onSelect={() => {/* navigation handled inside CountryGrid */}} />
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
            className="mt-12 scroll-mt-8"
            {...stepAnimation}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              3. Select a team
            </h2>
            <TeamGrid
              teams={teamsData?.teams ?? []}
              isLoading={teamsLoading}
            />
          </motion.section>
        )}
      </div>
    </motion.div>
  );
};
