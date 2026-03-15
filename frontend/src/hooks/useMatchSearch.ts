import { useQuery } from '@tanstack/react-query';
import type { Match } from '../types';

// Fetches matches from the backend search endpoint.
// enabled: only fires when all three params are provided (prevents empty requests).
export const useMatchSearch = (city: string, from: string, to: string) => {
  return useQuery({
    queryKey: ['matches', city, from, to],
    queryFn: async () => {
      const params = new URLSearchParams({ city, from, to });
      const res = await fetch(`/api/matches/search?${params}`);
      if (!res.ok) throw new Error('Failed to fetch matches');
      return res.json() as Promise<{ matches: Match[]; total: number }>;
    },
    enabled: Boolean(city && from && to),
  });
};
