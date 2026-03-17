import React from 'react';
import type { Post } from '../../types';
import { PostCardActions } from './PostCardActions';

interface GeneralTipCardProps {
  post: Post;
  teamId: string | undefined;
  postType: string | undefined;
  page: number;
  onEdit: (post: Post) => void;
}

// Post card for GENERAL_TIP posts (used for "Local Crowd" tab).
// Shows a title heading and the tip body text.
export const GeneralTipCard: React.FC<GeneralTipCardProps> = ({ post, teamId, postType, page, onEdit }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      {/* Title — the tip's headline */}
      <h3 className="font-semibold text-gray-900 text-base mb-2">{post.title}</h3>

      {/* Body — the user's full tip text */}
      <p className="text-gray-700 text-sm leading-relaxed">{post.body}</p>

      {/* Shared footer: author name, timestamp, upvote button, edit/delete for owners */}
      <PostCardActions post={post} teamId={teamId} postType={postType} page={page} onEdit={onEdit} />
    </div>
  );
};
