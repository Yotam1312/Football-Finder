import React from 'react';
import type { Post } from '../../types';
import { PostCardActions } from './PostCardActions';

interface ImGoingCardProps {
  post: Post;
  teamId: string | undefined;
  postType: string | undefined;
  page: number;
  onEdit: (post: Post) => void;
}

// Post card for IM_GOING posts — shows the "I'm Going!" badge, a message, and an optional match reference.
// Phase 4 will resolve matchId to a real match name when the match join is added.
export const ImGoingCard: React.FC<ImGoingCardProps> = ({ post, teamId, postType, page, onEdit }) => {
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

      {/* Shared footer: author name, timestamp, upvote button, edit/delete for owners */}
      <PostCardActions post={post} teamId={teamId} postType={postType} page={page} onEdit={onEdit} />
    </div>
  );
};
