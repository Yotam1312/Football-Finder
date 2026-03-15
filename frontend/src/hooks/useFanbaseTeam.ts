import { useQuery } from '@tanstack/react-query';
import type { TeamWithPostCount } from '../types';

// Fetches a single team's info and total post count.
// Used on the Team FanBase page header to show team name, logo, and post count.
export const useFanbaseTeam = (teamId: string | undefined) => {
  return useQuery({
    queryKey: ['fanbase', 'team', teamId],
    queryFn: async () => {
      const res = await fetch(`/api/fanbase/team/${teamId}`);
      // Throw specific error for 404 so the page can show a "team not found" message
      if (res.status === 404) throw new Error('Team not found');
      if (!res.ok) throw new Error('Failed to fetch team');
      return res.json() as Promise<{ team: TeamWithPostCount }>;
    },
    enabled: Boolean(teamId),
  });
};
