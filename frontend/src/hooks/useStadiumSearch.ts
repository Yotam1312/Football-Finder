import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { StadiumSearchResult } from '../types';

// Debounced stadium search hook for the Stadium Guide hub search bar.
// Only fires after the user stops typing for 300ms, and only when
// the query is at least 2 characters long (matches backend validation).
export const useStadiumSearch = (rawQuery: string) => {
  // debouncedQuery only updates 300ms after rawQuery stops changing
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    // Start a 300ms timer — if rawQuery changes again before it fires,
    // the cleanup function cancels it and starts a new one (prevents stale searches)
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 300);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  return useQuery({
    queryKey: ['stadiums', 'search', debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/stadiums/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json() as Promise<{ stadiums: StadiumSearchResult[] }>;
    },
    // Only fire when the debounced value is 2+ chars — matches the backend 400 rule
    enabled: debouncedQuery.length >= 2,
  });
};
