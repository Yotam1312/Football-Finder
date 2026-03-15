import { useQuery } from '@tanstack/react-query';
import type { Post } from '../types';

// Fetches posts for a team's FanBase page, optionally filtered by post type.
// postType maps to the ?type= query param (e.g. 'SEAT_TIP').
// Pass undefined for postType to fetch all types (the "All" tab).
// page is 1-indexed — defaults to 1 for the first page of results.
export const useFanbasePosts = (
  teamId: string | undefined,
  postType?: string,
  page: number = 1,
) => {
  return useQuery({
    // Include postType and page in the key so TanStack Query re-fetches
    // automatically when the user switches tabs or changes page
    queryKey: ['fanbase', 'posts', teamId, postType ?? 'all', page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (postType) params.set('type', postType);
      params.set('page', String(page));
      const res = await fetch(`/api/fanbase/team/${teamId}/posts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json() as Promise<{ posts: Post[]; total: number }>;
    },
    enabled: Boolean(teamId),
  });
};
