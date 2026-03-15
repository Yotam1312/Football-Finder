import React from 'react';
import type { Post } from '../../types';
import { formatRelativeTime } from '../../utils/formatDate';

interface GeneralTipCardProps { post: Post }

// Post card for GENERAL_TIP posts (used for "Local Crowd" tab).
// Shows a title heading and the tip body text.
export const GeneralTipCard: React.FC<GeneralTipCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      {/* Title — the tip's headline */}
      <h3 className="font-semibold text-gray-900 text-base mb-2">{post.title}</h3>

      {/* Body — the user's full tip text */}
      <p className="text-gray-700 text-sm leading-relaxed">{post.body}</p>

      {/* Common footer: author name, relative timestamp, and upvote count */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>{post.authorName} · {formatRelativeTime(post.createdAt)}</span>
        <span>▲ {post.upvoteCount}</span>
      </div>
    </div>
  );
};
