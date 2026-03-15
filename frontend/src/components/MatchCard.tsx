import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Match } from '../types';
import { TeamLogo } from './TeamLogo';
import { buildMapsUrl } from '../utils/buildMapsUrl';
import { formatMatchDate, formatMatchTime } from '../utils/formatDate';

interface MatchCardProps {
  match: Match;
}

// Animation variant for a single card — used by the staggered list in ResultsPage
export const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Displays one match: team logos, green VS badge, league, date/time, stadium, action buttons.
// Design from BRIEF.md: white bg, subtle shadow, circular logos, two action buttons.
export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  // Use the stadium's timezone for local time display; fall back to UTC if no stadium
  const timezone = match.stadium?.timezone ?? 'UTC';
  const matchDate = formatMatchDate(match.matchDate, timezone);
  const matchTime = formatMatchTime(match.matchDate, timezone);

  // Prefer the stored Google Maps URL; generate dynamically as fallback
  const mapsUrl = match.stadium
    ? (match.stadium.googleMapsUrl ?? buildMapsUrl(match.stadium.name, match.stadium.city))
    : '#';

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.02 }}
    >
      {/* Teams row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col items-center gap-1">
          <TeamLogo team={match.homeTeam} size="sm" />
          <span className="text-xs text-gray-600 font-medium text-center max-w-16 leading-tight">
            {match.homeTeam.name}
          </span>
        </div>

        {/* VS badge */}
        <div className="flex flex-col items-center gap-1">
          <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">VS</span>
          {/* League badge/name */}
          <span className="text-xs text-gray-500 text-center">{match.league.name}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <TeamLogo team={match.awayTeam} size="sm" />
          <span className="text-xs text-gray-600 font-medium text-center max-w-16 leading-tight">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Match info */}
      <div className="text-sm text-gray-500 space-y-1 mb-4">
        <p>{matchDate} • {matchTime}</p>
        {match.stadium && <p>{match.stadium.name}, {match.stadium.city}</p>}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Link
          to={`/match/${match.id}`}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg text-center transition-colors"
        >
          View Details
        </Link>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 text-sm font-medium py-2 px-4 rounded-lg text-center transition-colors"
        >
          Navigate to Stadium
        </a>
      </div>
    </motion.div>
  );
};
