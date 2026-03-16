import React from 'react';
import type { Post } from '../../types';
import { SeatTipCard } from './SeatTipCard';
import { PubRecCard } from './PubRecCard';
import { GeneralTipCard } from './GeneralTipCard';
import { ImGoingCard } from './ImGoingCard';

interface PostCardProps {
  post: Post;
  // These three must match the useFanbasePosts queryKey for this feed (used by PostCardActions)
  teamId: string | undefined;
  postType: string | undefined;
  page: number;
  // Called when the user clicks the Edit button on a post they own
  onEdit: (post: Post) => void;
}

// Dispatcher component — renders the correct card variant based on post.postType.
// Keeping the switch here means the feed just maps posts to <PostCard /> with no
// type-checking logic scattered through the parent component.
// teamId, postType, page, and onEdit are passed down so each card can render
// the shared PostCardActions footer (upvote, edit, delete).
export const PostCard: React.FC<PostCardProps> = ({ post, teamId, postType, page, onEdit }) => {
  const actionProps = { teamId, postType, page, onEdit };

  switch (post.postType) {
    case 'SEAT_TIP':
      return <SeatTipCard post={post} {...actionProps} />;
    case 'PUB_RECOMMENDATION':
      return <PubRecCard post={post} {...actionProps} />;
    case 'IM_GOING':
      return <ImGoingCard post={post} {...actionProps} />;
    case 'GENERAL_TIP':
    default:
      return <GeneralTipCard post={post} {...actionProps} />;
  }
};
