import React from 'react';
import type { Post } from '../../types';
import { SeatTipCard } from './SeatTipCard';
import { PubRecCard } from './PubRecCard';
import { GeneralTipCard } from './GeneralTipCard';
import { ImGoingCard } from './ImGoingCard';

interface PostCardProps { post: Post }

// Dispatcher component — renders the correct card variant based on post.postType.
// Keeping the switch here means the feed just maps posts to <PostCard /> with no
// type-checking logic scattered through the parent component.
export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  switch (post.postType) {
    case 'SEAT_TIP':
      return <SeatTipCard post={post} />;
    case 'PUB_RECOMMENDATION':
      return <PubRecCard post={post} />;
    case 'IM_GOING':
      return <ImGoingCard post={post} />;
    case 'GENERAL_TIP':
    default:
      return <GeneralTipCard post={post} />;
  }
};
