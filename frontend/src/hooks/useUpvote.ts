import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post } from '../types';

// useUpvote — TanStack Query mutation for toggling an upvote on a post.
// Accepts the parameters needed to match the posts query cache key exactly,
// so the optimistic update targets the right cache entry.
//
// teamId, postType, page must match what useFanbasePosts passes to its queryKey:
//   ['fanbase', 'posts', teamId, postType ?? 'all', page]
export const useUpvote = (teamId: string | undefined, postType: string | undefined, page: number) => {
  const queryClient = useQueryClient();

  // The cache key that useFanbasePosts uses for the current view.
  // We must match this exactly so optimistic updates land in the right list.
  const postsQueryKey = ['fanbase', 'posts', teamId, postType ?? 'all', page];

  return useMutation({
    mutationFn: async (postId: number) => {
      // Toggle upvote — if user already upvoted, this removes it; otherwise adds it
      const res = await fetch(`/api/posts/${postId}/upvote`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        // Throw with status code so callers can handle 401 (not logged in) gracefully
        const data = await res.json().catch(() => ({}));
        const err = new Error(data.error ?? 'Failed to upvote');
        (err as Error & { status?: number }).status = res.status;
        throw err;
      }
      return res.json();
    },

    onMutate: async (postId: number) => {
      // Cancel any in-flight refetches so they don't overwrite the optimistic update
      await queryClient.cancelQueries({ queryKey: postsQueryKey });

      // Snapshot the current cache data so we can roll back on error
      const previousData = queryClient.getQueryData(postsQueryKey);

      // Optimistically increment the upvote count by 1 for the target post
      queryClient.setQueryData(postsQueryKey, (old: { posts: Post[]; total: number } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          posts: old.posts.map((p) =>
            p.id === postId
              ? { ...p, upvoteCount: p.upvoteCount + 1 }
              : p
          ),
        };
      });

      // Return the snapshot so onError can roll back
      return { previousData };
    },

    onError: (_err, _postId, context) => {
      // Roll back the optimistic update if the mutation failed
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(postsQueryKey, context.previousData);
      }
    },

    onSettled: () => {
      // Always sync with the server after the mutation completes (success or error).
      // This handles the toggle direction correctly — the server knows if the user
      // already upvoted and will decrement instead of increment if so.
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
  });
};
