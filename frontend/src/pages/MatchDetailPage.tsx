import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, MapPin } from 'lucide-react';
import { useMatchDetail } from '../hooks/useMatchDetail';
import { TeamLogo } from '../components/TeamLogo';
import { StatBar } from '../components/StatBar';
import { buildMapsUrl } from '../utils/buildMapsUrl';
import { formatMatchDate, formatMatchTime } from '../utils/formatDate';

export const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: match, isLoading, isError } = useMatchDetail(id);

  // Loading skeleton — pulsing placeholders while the API call is in-flight
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-h-screen pb-20 md:pb-0"
        style={{ backgroundColor: '#FAFAFA' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-6" />
          <div className="bg-gray-100 rounded-xl p-8 h-48" />
          {/* Single venue tile placeholder — matches new single-tile layout */}
          <div className="h-14 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      </motion.div>
    );
  }

  // Error state — shown for 404 (match not found) or network errors
  if (isError || !match) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="min-h-screen flex items-center justify-center pb-20 md:pb-0"
      >
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Match not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors min-h-[48px]"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  // Use the stadium's timezone so all times are local to the venue.
  // Falls back to UTC if timezone is missing (shouldn't happen in practice).
  const timezone  = match.stadium?.timezone ?? 'UTC';
  const matchDate = formatMatchDate(match.matchDate, timezone);
  const matchTime = formatMatchTime(match.matchDate, timezone);

  // Prefer the stored googleMapsUrl; build a fallback query URL if missing
  const mapsUrl = match.stadium
    ? (match.stadium.googleMapsUrl ?? buildMapsUrl(match.stadium.name, match.stadium.city))
    : null;

  // Use the same season cap as the backend sync — free API plan only covers up to 2024
  const season = Math.min(new Date().getFullYear() - 1, 2024);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen pb-20 md:pb-0"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back button — returns to the results page */}
        <button
          onClick={() => navigate(-1)}
          className="text-green-600 hover:text-green-700 font-medium mb-6 flex items-center gap-1 min-h-[48px]"
        >
          &larr; Back to Results
        </button>

        {/* Hero — large team crests, match time+date pill, league name on green background */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-green-700 text-white rounded-2xl p-8 mb-6"
        >
          <p className="text-green-200 text-sm text-center mb-4">{match.league.name}</p>
          <div className="flex items-center justify-between">

            {/* Home team crest and name */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <TeamLogo team={match.homeTeam} size="lg" />
              <span className="font-bold text-lg text-center">{match.homeTeam.name}</span>
            </div>

            {/* Match time + date pill — replaces VS badge per MATCH-01 */}
            <div className="flex flex-col items-center px-4">
              <div className="bg-white text-green-700 px-4 py-2 rounded-full text-center">
                <span className="font-black text-xl block">{matchTime}</span>
                <span className="text-xs font-medium text-green-600 block">{matchDate}</span>
              </div>
            </div>

            {/* Away team crest and name */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <TeamLogo team={match.awayTeam} size="lg" />
              <span className="font-bold text-lg text-center">{match.awayTeam.name}</span>
            </div>
          </div>
        </motion.div>

        {/* Single venue tile — full width since date/time moved to hero (MATCH-01) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 mb-6">
          <MapPin className="text-green-600 shrink-0" size={18} />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Venue</p>
            <p className="text-gray-800 font-semibold text-sm">{match.stadium?.name ?? 'TBC'}</p>
          </div>
        </div>

        {/* Match Day Actions card — only renders when at least one action exists (MATCH-02) */}
        {(match.ticketUrl || mapsUrl) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Match Day Actions
            </h2>
            {match.ticketUrl && (
              <a
                href={match.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl text-center mb-3 transition-colors min-h-[48px]"
              >
                <Ticket size={18} />
                Buy Tickets
              </a>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-xl text-center transition-colors min-h-[48px]"
              >
                <MapPin size={18} />
                Navigate to Stadium
              </a>
            )}
          </div>
        )}

        {/* FanBase links for both teams (MATCH-06).
            /fanbase/team/:teamId is a Phase 3 page — stubbed in App.tsx for now. */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">FanBase</h2>
          <p className="text-gray-500 text-sm mb-4">
            Read community tips, pub recommendations, and match-day advice from fans.
          </p>
          {/* flex-col on mobile so team names don't get truncated in side-by-side layout */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/fanbase/team/${match.homeTeam.id}`}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-center text-sm transition-colors min-h-[48px] flex items-center justify-center"
            >
              {match.homeTeam.name} FanBase
            </Link>
            <Link
              to={`/fanbase/team/${match.awayTeam.id}`}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-center text-sm transition-colors min-h-[48px] flex items-center justify-center"
            >
              {match.awayTeam.name} FanBase
            </Link>
          </div>
        </div>

        {/* Side-by-side team stats comparison (MATCH-03).
            Wrapped in overflow-x-auto so wide team names don't push the page width.
            StatBar renders nothing if both standings are null. */}
        <div className="overflow-x-auto">
        <StatBar
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          homeStanding={match.homeTeamStanding}
          awayStanding={match.awayTeamStanding}
          season={season}
        />
        </div>

      </div>
    </motion.div>
  );
};
