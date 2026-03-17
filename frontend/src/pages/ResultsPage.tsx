import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMatchSearch } from '../hooks/useMatchSearch';
import { MatchCard } from '../components/MatchCard';
import { SkeletonMatchCard } from '../components/SkeletonMatchCard';

// How many match cards to show per page (client-side pagination)
const PAGE_SIZE = 10;

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

  const { data, isLoading, isError } = useMatchSearch(city, from, to);

  const matches     = data?.matches ?? [];
  const totalPages  = Math.ceil(matches.length / PAGE_SIZE);
  const pageMatches = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
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

        {/* Empty state */}
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

        {/* Match card list with stagger animation */}
        {!isLoading && pageMatches.length > 0 && (
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
    </div>
  );
};
