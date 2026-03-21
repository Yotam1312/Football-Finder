import React, { useState } from 'react';
import type { Post } from '../../types';
import { PostCardActions } from './PostCardActions';
import { ImageLightbox } from '../ui/ImageLightbox';

interface SeatTipCardProps {
  post: Post;
  teamId: string | undefined;
  postType: string | undefined;
  page: number;
  onEdit: (post: Post) => void;
}

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

// Post card for SEAT_TIP posts — shows an optional photo, seat location, star rating, and tip body.
// When a photoUrl exists the photo renders at the top of the card, full-width.
// Clicking the photo opens ImageLightbox for a full-size view.
export const SeatTipCard: React.FC<SeatTipCardProps> = ({ post, teamId, postType, page, onEdit }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    // Outer card wrapper — padding is NOT on the outer div so the photo can be edge-to-edge.
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
      {/* Photo — only rendered when the post has a photoUrl.
          Rounded top corners match the card's rounded-lg corners.
          Clicking opens the fullscreen lightbox. */}
      {post.photoUrl && (
        <img
          src={post.photoUrl}
          alt="Seat photo"
          className="w-full max-h-64 object-cover rounded-t-lg cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        />
      )}

      {/* Content area — padded separately so the photo sits flush against the card edges */}
      <div className="p-5">
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

        {/* Shared footer: author name, timestamp, upvote button, edit/delete for owners */}
        <PostCardActions post={post} teamId={teamId} postType={postType} page={page} onEdit={onEdit} />
      </div>

      {/* Lightbox — rendered outside the padded content div but still inside the card tree.
          Only mounted when lightboxOpen is true to keep the DOM clean. */}
      {lightboxOpen && post.photoUrl && (
        <ImageLightbox
          src={post.photoUrl}
          alt="Seat photo full size"
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};
