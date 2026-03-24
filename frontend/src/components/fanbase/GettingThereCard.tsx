import React from 'react';
import type { Post } from '../../types';
import { PostCardActions } from './PostCardActions';

interface GettingThereCardProps {
  post: Post;
  teamId: string | undefined;
  postType: string | undefined;
  page: number;
  onEdit: (post: Post) => void;
}

// Post card for GETTING_THERE posts — shows how fans travel to the stadium.
// Renders a transport type badge (Metro, Bus, Train, etc.), cost and travel time pills,
// the tip body, and the shared PostCardActions footer.
export const GettingThereCard: React.FC<GettingThereCardProps> = ({ post, teamId, postType, page, onEdit }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="p-5">
        {/* Transport type badge — shown when the post specifies a transport mode.
            Green colour matches the transport theme used in the stadium transport section. */}
        {post.transportType && (
          <span className="inline-block bg-green-100 text-green-700 text-xs font-medium rounded-full px-2 py-0.5 mb-3">
            {post.transportType}
          </span>
        )}

        {/* Cost and travel time pills — shown when at least one is set.
            Displayed inline so they read left-to-right as a quick summary. */}
        {(post.travelCost || post.travelTime) && (
          <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
            {post.travelCost && <span>💶 {post.travelCost}</span>}
            {post.travelTime && <span>⏱ {post.travelTime} min</span>}
          </div>
        )}

        {/* Post body — the fan's actual travel tip */}
        {post.body && (
          <p className="text-gray-700 text-sm leading-relaxed">{post.body}</p>
        )}

        {/* Shared footer: author name, timestamp, upvote button, edit/delete for owners */}
        <PostCardActions post={post} teamId={teamId} postType={postType} page={page} onEdit={onEdit} />
      </div>
    </div>
  );
};
