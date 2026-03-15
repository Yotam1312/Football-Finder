import { useQuery } from '@tanstack/react-query';
import type { League } from '../types';

// Fetches leagues for the selected country.
// enabled: only fires when a country has been selected (step 2 of the hub).
// country param is the raw DB value (e.g. "England") — the frontend slug is
// decoded before passing it here.
export const useFanbaseLeagues = (country: string | undefined) => {
  return useQuery({
    queryKey: ['fanbase', 'leagues', country],
    queryFn: async () => {
      const res = await fetch(`/api/fanbase/countries/${encodeURIComponent(country!)}/leagues`);
      if (!res.ok) throw new Error('Failed to fetch leagues');
      return res.json() as Promise<{ leagues: League[] }>;
    },
    // Only fetch when country is set — prevents a malformed request on initial render
    enabled: Boolean(country),
  });
};
