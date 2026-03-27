import { useQuery } from '@tanstack/react-query';
import type { StadiumBrowseResult } from '../types';

// Fetches all stadiums used in the given league, each with their primary home team.
// Used by the Stadium Guide browse grid — fires only when a league is selected.
export const useStadiumsByLeague = (leagueId: number | null) => {
  return useQuery({
    queryKey: ['stadiums', 'byLeague', leagueId],
    queryFn: async () => {
      const res = await fetch(`/api/stadiums?leagueId=${leagueId}`);
      if (!res.ok) throw new Error('Failed to fetch stadiums');
      return res.json() as Promise<{ stadiums: StadiumBrowseResult[] }>;
    },
    enabled: leagueId !== null,
  });
};
