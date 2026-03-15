import React from 'react';
import type { Post } from '../../types';
import { formatRelativeTime } from '../../utils/formatDate';

interface ImGoingCardProps { post: Post }

// Post card for IM_GOING posts — shows the "I'm Going!" badge, a message, and an optional match reference.
// Phase 4 will resolve matchId to a real match name when the match join is added.
export const ImGoingCard: React.FC<ImGoingCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      {/* Green badge announcing the user is going to the match */}
      <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
        I'm Going! ⚽
      </span>

      {/* Optional message from the user */}
      {post.body && (
        <p className="text-gray-700 text-sm leading-relaxed mb-2">{post.body}</p>
      )}

      {/* Match reference — just the ID for now; Phase 4 resolves this to a match name */}
      {post.matchId && (
        <p className="text-xs text-gray-400">Match #{post.matchId}</p>
      )}

      {/* Common footer: author name, relative timestamp, and upvote count */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>{post.authorName} · {formatRelativeTime(post.createdAt)}</span>
        <span>▲ {post.upvoteCount}</span>
      </div>
    </div>
  );
};
