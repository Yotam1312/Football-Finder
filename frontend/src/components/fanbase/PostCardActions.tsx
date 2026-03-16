import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useUpvote } from '../../hooks/useUpvote';
import { formatRelativeTime } from '../../utils/formatDate';

interface PostCardActionsProps {
  post: Post;
  // These three props must match the useFanbasePosts queryKey for this feed
  teamId: string | undefined;
  postType: string | undefined;
  page: number;
  // Called when the user clicks Edit — the parent opens the edit modal
  onEdit: (post: Post) => void;
}

// PostCardActions — the shared footer row rendered at the bottom of every post card.
// Renders:
//   - Author name and relative timestamp
//   - Upvote button (visible to all, functional only for Level 3 users)
//   - Edit and Delete buttons (only for the post's author — checked by user.id === post.userId)
export const PostCardActions: React.FC<PostCardActionsProps> = ({
  post,
  teamId,
  postType,
  page,
  onEdit,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const upvoteMutation = useUpvote(teamId, postType, page);

  // Tracks whether we should show the "log in to upvote" tooltip
  const [showLoginTip, setShowLoginTip] = useState(false);

  // The query key for the current posts list — needed to invalidate after delete
  const postsQueryKey = ['fanbase', 'posts', teamId, postType ?? 'all', page];

  // Only the post's author (matched by numeric user ID from JWT) sees edit/delete
  const isOwner = user !== null && user.id === post.userId;

  const handleUpvoteClick = () => {
    if (!user || user.level < 3) {
      // Show tooltip for guests and Level 2 users
      setShowLoginTip(true);
      setTimeout(() => setShowLoginTip(false), 2500);
      return;
    }
    // Level 3 users can upvote — mutation handles optimistic update
    upvoteMutation.mutate(post.id);
  };

  const handleDelete = async () => {
    // Simple confirmation dialog — no custom modal needed (CLAUDE.md: keep it simple)
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        // Refresh the posts list to remove the deleted post
        queryClient.invalidateQueries({ queryKey: postsQueryKey });
      }
    } catch {
      // Fail silently — post will remain in view until next refresh
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-50">
      {/* Top row: author info + upvote button */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{post.authorName} · {formatRelativeTime(post.createdAt)}</span>

        {/* Upvote button — visible to everyone, restricted for guests/Level 2 */}
        <div className="relative flex items-center gap-1">
          <button
            onClick={handleUpvoteClick}
            disabled={upvoteMutation.isPending}
            className="flex items-center gap-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
            title={user?.level === 3 ? 'Upvote this post' : 'Log in to upvote'}
          >
            <span className="text-sm">▲</span>
            <span>{post.upvoteCount}</span>
          </button>

          {/* Tooltip shown when a non-Level-3 user tries to upvote */}
          {showLoginTip && (
            <div className="absolute bottom-full right-0 mb-1 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              Log in to upvote
            </div>
          )}
        </div>
      </div>

      {/* Edit and delete buttons — only shown to the post's author */}
      {isOwner && (
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => onEdit(post)}
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-600 transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};
