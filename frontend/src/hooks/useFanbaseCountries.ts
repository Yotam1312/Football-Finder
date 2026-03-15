import { useQuery } from '@tanstack/react-query';

// Fetches the list of countries that have leagues in the database.
// Used in Step 1 of the FanBase hub to render country selection cards.
// No enabled guard needed — this fires on mount (always needed for step 1).
export const useFanbaseCountries = () => {
  return useQuery({
    queryKey: ['fanbase', 'countries'],
    queryFn: async () => {
      const res = await fetch('/api/fanbase/countries');
      if (!res.ok) throw new Error('Failed to fetch countries');
      return res.json() as Promise<{ countries: string[] }>;
    },
    // Countries change rarely (only when new leagues are added) — cache for 10 minutes
    staleTime: 10 * 60 * 1000,
  });
};
