import { useQuery } from '@tanstack/react-query';
import type { TeamWithPostCount } from '../types';

// Fetches all teams that have played in the given league (via Match records).
// Each team includes a _count.posts field for the post count badge (FAN-05).
// enabled: only fires when a leagueId has been selected (step 3 of the hub).
export const useFanbaseTeams = (leagueId: string | undefined) => {
  return useQuery({
    queryKey: ['fanbase', 'teams', leagueId],
    queryFn: async () => {
      const res = await fetch(`/api/fanbase/leagues/${leagueId}/teams`);
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json() as Promise<{ teams: TeamWithPostCount[] }>;
    },
    enabled: Boolean(leagueId),
  });
};
