import React from 'react';
import type { Post } from '../../types';
import { formatRelativeTime } from '../../utils/formatDate';

interface SeatTipCardProps { post: Post }

// Renders a star rating as filled/empty star characters (1–5).
// Shows nothing if the rating is null or 0.
const StarRating: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= rating ? 'text-yellow-400' : 'text-gray-200'}>
          ★
        </span>
      ))}
    </div>
  );
};

// Post card for SEAT_TIP posts — shows seat location, star rating, and tip body.
// Photos are a Phase 4 feature (Azure Blob Storage) — photoUrl is intentionally ignored here.
export const SeatTipCard: React.FC<SeatTipCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      {/* Seat location — section, row, and seat number in a row */}
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
        {post.seatSection && <span>Section <strong className="text-gray-800">{post.seatSection}</strong></span>}
        {post.seatRow      && <span>Row <strong className="text-gray-800">{post.seatRow}</strong></span>}
        {post.seatNumber   && <span>Seat <strong className="text-gray-800">{post.seatNumber}</strong></span>}
      </div>

      {/* Star rating — only rendered when a rating exists */}
      <StarRating rating={post.seatRating} />

      {/* Post body — the user's actual tip text */}
      {post.body && (
        <p className="mt-3 text-gray-700 text-sm leading-relaxed">{post.body}</p>
      )}

      {/* Common footer: author name, relative timestamp, and upvote count */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>{post.authorName} · {formatRelativeTime(post.createdAt)}</span>
        <span>▲ {post.upvoteCount}</span>
      </div>
    </div>
  );
};
