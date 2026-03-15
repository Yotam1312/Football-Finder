import { useQuery } from '@tanstack/react-query';
import type { MatchDetail } from '../types';

// Fetches full match details including team standings from the backend.
// The backend /api/matches/:id endpoint returns the match with
// homeTeamStanding and awayTeamStanding attached (may be null if not tracked).
export const useMatchDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${id}`);
      if (res.status === 404) throw new Error('Match not found');
      if (!res.ok) throw new Error('Failed to fetch match');
      return res.json() as Promise<MatchDetail>;
    },
    // Only fetch when we have an id (prevents query on initial render)
    enabled: Boolean(id),
  });
};
