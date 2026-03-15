import React from 'react';
import type { Post } from '../../types';
import { formatRelativeTime } from '../../utils/formatDate';

interface PubRecCardProps { post: Post }

// Post card for PUB_RECOMMENDATION posts — shows pub name, address, distance, and description.
export const PubRecCard: React.FC<PubRecCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      {/* Pub name as the card's title — falls back to post.title if pubName is null */}
      <h3 className="font-semibold text-gray-900 text-base mb-1">
        {post.pubName ?? post.title}
      </h3>

      {/* Address and walking distance from the stadium */}
      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
        {post.pubAddress  && <span>{post.pubAddress}</span>}
        {post.pubDistance && <span className="text-green-600">· {post.pubDistance}</span>}
      </div>

      {/* Description — the user's recommendation text */}
      {post.body && (
        <p className="text-gray-700 text-sm leading-relaxed">{post.body}</p>
      )}

      {/* Common footer: author name, relative timestamp, and upvote count */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>{post.authorName} · {formatRelativeTime(post.createdAt)}</span>
        <span>▲ {post.upvoteCount}</span>
      </div>
    </div>
  );
};
