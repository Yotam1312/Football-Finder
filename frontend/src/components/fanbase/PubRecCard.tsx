import React from 'react';
import type { Post } from '../../types';
import { PostCardActions } from './PostCardActions';

interface PubRecCardProps {
  post: Post;
  teamId: string | undefined;
  postType: string | undefined;
  page: number;
  onEdit: (post: Post) => void;
}

// Post card for PUB_RECOMMENDATION posts — shows pub name, address, distance, and description.
export const PubRecCard: React.FC<PubRecCardProps> = ({ post, teamId, postType, page, onEdit }) => {
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

      {/* Shared footer: author name, timestamp, upvote button, edit/delete for owners */}
      <PostCardActions post={post} teamId={teamId} postType={postType} page={page} onEdit={onEdit} />
    </div>
  );
};
