import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMatchSearch } from '../hooks/useMatchSearch';
import { MatchCard } from '../components/MatchCard';
import { SkeletonMatchCard } from '../components/SkeletonMatchCard';
import type { Match } from '../types';

// How many match cards to show per page (client-side pagination)
const PAGE_SIZE = 10;

// Time-of-day filter buckets. Hours are inclusive start, exclusive end (except Night which wraps midnight).
// These represent LOCAL kickoff time in the stadium's timezone — not the user's browser time.
// Defined per product decision in Phase 11 CONTEXT.md.
const TIME_BUCKETS = [
  { id: 'morning'   as const, label: 'Morning',   startHour: 6,  endHour: 12 },
  { id: 'afternoon' as const, label: 'Afternoon',  startHour: 12, endHour: 18 },
  { id: 'evening'   as const, label: 'Evening',    startHour: 18, endHour: 22 },
  { id: 'night'     as const, label: 'Night',      startHour: 22, endHour: 6  }, // wraps midnight
] as const;

type TimeBucketId = typeof TIME_BUCKETS[number]['id'];

// Returns the kickoff hour (0–23) in the stadium's local timezone.
// Falls back to UTC if the match has no stadium (same fallback MatchCard uses).
// We use Intl.DateTimeFormat instead of getHours() because getHours() uses
// the browser's local time, but we want the VENUE'S local time.
function getLocalKickoffHour(match: Match): number {
  const timezone = match.stadium?.timezone ?? 'UTC';
  const hourStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).format(new Date(match.matchDate));
  // hour12: false gives "0"–"23"; parseInt handles it safely
  return parseInt(hourStr, 10);
}

// Returns true if a kickoff hour falls within a time bucket.
// The Night bucket (22:00–05:59) wraps midnight, so needs special handling.
function isInBucket(hour: number, bucket: typeof TIME_BUCKETS[number]): boolean {
  if (bucket.startHour < bucket.endHour) {
    // Normal range (e.g. Morning: 6 <= hour < 12)
    return hour >= bucket.startHour && hour < bucket.endHour;
  } else {
    // Wrapping range (Night: hour >= 22 OR hour < 6)
    return hour >= bucket.startHour || hour < bucket.endHour;
  }
}

// Stagger container — children animate in 80ms apart
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const ResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read search params from the URL — set by the Homepage form
  const city = searchParams.get('city') ?? '';
  const from = searchParams.get('from') ?? '';
  const to   = searchParams.get('to')   ?? '';

  const [page, setPage] = useState(1);

  // activeChips tracks which time-of-day filters are selected.
  // Using a Set so toggling in/out is O(1) and checking membership is clean.
  // An empty Set means "no filter — show all matches".
  const [activeChips, setActiveChips] = useState<Set<TimeBucketId>>(new Set());

  // Toggle a chip: if it's already selected, remove it; if not, add it.
  // We always create a new Set (not mutate) so React detects the state change.
  const toggleChip = (id: TimeBucketId) => {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // Reset to page 1 when filter changes so we don't land on an empty page
    setPage(1);
  };

  const { data, isLoading, isError } = useMatchSearch(city, from, to);

  const matches = data?.matches ?? [];

  // If no chips are selected, show all matches. If chips are selected, keep only
  // matches whose local kickoff hour falls in at least one of the selected buckets.
  const filteredMatches = activeChips.size === 0
    ? matches
    : matches.filter((match) => {
        const hour = getLocalKickoffHour(match);
        // A match passes if it falls in ANY of the selected buckets (OR logic)
        return TIME_BUCKETS
          .filter((b) => activeChips.has(b.id))
          .some((b) => isInBucket(hour, b));
      });

  // Pagination operates on the filtered list so page counts stay correct
  const totalPages  = Math.ceil(filteredMatches.length / PAGE_SIZE);
  const pageMatches = filteredMatches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen pb-20 md:pb-0"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      {/* Sticky search summary bar at top */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-gray-700 font-medium">
            {isLoading
              ? 'Searching...'
              : `Found ${data?.total ?? 0} match${(data?.total ?? 0) !== 1 ? 'es' : ''} in ${city}`}
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-green-600 hover:text-green-700 text-sm font-medium min-h-[48px] flex items-center"
          >
            &larr; New Search
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Date range heading */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Matches in {city}
          <span className="text-gray-400 font-normal text-lg ml-2">
            {from} &ndash; {to}
          </span>
        </h1>

        {/* Time-of-day filter chips — only shown when matches are available */}
        {!isLoading && !isError && matches.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {TIME_BUCKETS.map((bucket) => (
              <button
                key={bucket.id}
                type="button"
                onClick={() => toggleChip(bucket.id)}
                className={
                  activeChips.has(bucket.id)
                    // Active: solid green — clearly selected
                    ? 'px-4 py-1.5 rounded-full text-sm font-medium bg-green-600 text-white border border-green-600 transition-colors'
                    // Inactive: outlined — available to select
                    : 'px-4 py-1.5 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors'
                }
              >
                {bucket.label}
              </button>
            ))}
            {/* Show how many matches pass the current filter, so users understand the effect */}
            {activeChips.size > 0 && (
              <span className="text-sm text-gray-500 self-center ml-2">
                {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonMatchCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Something went wrong. Please try again.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors min-h-[48px]"
            >
              Back to Search
            </button>
          </div>
        )}

        {/* No matches at all */}
        {!isLoading && !isError && matches.length === 0 && city && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">No upcoming matches found in {city}.</p>
            <p className="text-gray-400 text-sm mb-6">
              Try a wider date range, or check the city name spelling.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors min-h-[48px]"
            >
              Try Another Search
            </button>
          </div>
        )}

        {/* Matches exist but none match the active time-of-day chips */}
        {!isLoading && !isError && matches.length > 0 && filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No matches in the selected time windows.</p>
            <p className="text-gray-400 text-sm mb-4">
              Try selecting a different time of day, or deselect all chips to see all matches.
            </p>
          </div>
        )}

        {/* Match card list with stagger animation */}
        {!isLoading && filteredMatches.length > 0 && pageMatches.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {pageMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </motion.div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px]"
            >
              &larr; Previous
            </button>
            <span className="text-gray-600 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[48px]"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
