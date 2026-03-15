import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TeamSearchResult } from '../types';

// Debounced team search hook for the FanBase hub search bar.
// Only fires after the user stops typing for 300ms, and only when
// the query is at least 2 characters long (matches backend validation).
export const useFanbaseTeamSearch = (rawQuery: string) => {
  // debouncedQuery only updates 300ms after rawQuery stops changing
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    // Start a 300ms timer — if rawQuery changes again before it fires,
    // the cleanup function cancels it and starts a new one (prevents stale searches)
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 300);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  return useQuery({
    queryKey: ['fanbase', 'team-search', debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/fanbase/teams/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json() as Promise<{ teams: TeamSearchResult[] }>;
    },
    // Only fire when the debounced value is 2+ chars — matches the backend 400 rule
    enabled: debouncedQuery.length >= 2,
  });
};
