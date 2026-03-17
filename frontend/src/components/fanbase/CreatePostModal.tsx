import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import type { Post, PostType } from '../../types/index';

// Shape of an upcoming match returned by the backend
interface UpcomingMatch {
  id: number;
  matchDate: string;
  homeTeam: { id: number; name: string; logoUrl: string | null };
  awayTeam: { id: number; name: string; logoUrl: string | null };
}

interface CreatePostModalProps {
  teamId: number;
  teamName: string;
  onClose: () => void;
  // When provided, the modal opens in edit mode — pre-fills all fields and uses PUT
  editPost?: Post;
}

// The 4 post types users can pick from, with display labels and descriptions
const POST_TYPES: { type: PostType; label: string; description: string }[] = [
  {
    type: 'GENERAL_TIP',
    label: 'General Tip',
    description: 'Share advice about visiting this stadium',
  },
  {
    type: 'SEAT_TIP',
    label: 'Seat Tip',
    description: 'Give a review of a specific seat or section',
  },
  {
    type: 'PUB_RECOMMENDATION',
    label: 'Pub Recommendation',
    description: 'Recommend a pub or food spot near the ground',
  },
  {
    type: 'IM_GOING',
    label: "I'm Going",
    description: 'Let fans know you are attending a match',
  },
];

// Renders 5 clickable star buttons — filled (★) for stars at or below the rating,
// empty (☆) for stars above. Amber color for filled stars.
const StarRating: React.FC<{
  rating: number | null;
  onRate: (value: number) => void;
}> = ({ rating, onRate }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className={`text-2xl focus:outline-none ${
            rating !== null && star <= rating
              ? 'text-amber-400'
              : 'text-gray-300 hover:text-amber-300'
          }`}
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          {rating !== null && star <= rating ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
};

// Multi-step modal for creating or editing a FanBase post.
// Create mode (default):
//   Step 1 — type picker: user picks one of 4 post types
//   Step 2 — form: user fills in type-specific fields plus their name
// Edit mode (when editPost prop is provided):
//   Starts directly on Step 2 with fields pre-filled from the existing post.
//   Submit calls PUT /api/posts/:id instead of POST /api/posts.
// The email verification step (formerly step 3) has been removed — posts are now
// submitted directly with the auth cookie by logged-in Level 3 users.
export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  teamId,
  teamName,
  onClose,
  editPost,
}) => {
  const queryClient = useQueryClient();
  // Get the logged-in user so we can pre-fill the author name
  const { user } = useAuth();

  // In edit mode, skip the type picker and start directly on the form
  const [step, setStep] = useState<'type-picker' | 'form'>(
    editPost ? 'form' : 'type-picker'
  );

  // Pre-select the post type in edit mode
  const [postType, setPostType] = useState<PostType | null>(editPost?.postType ?? null);

  // ── Common form fields — pre-filled in edit mode ──
  const [title, setTitle] = useState(editPost?.title ?? '');
  const [body, setBody] = useState(editPost?.body ?? '');
  // Pre-fill author name from existing post (edit) or from the logged-in user's name
  const [authorName, setAuthorName] = useState(
    editPost?.authorName ?? user?.name ?? ''
  );

  // ── Seat Tip fields — pre-filled in edit mode ──
  const [seatSection, setSeatSection] = useState(editPost?.seatSection ?? '');
  const [seatRow, setSeatRow] = useState(editPost?.seatRow ?? '');
  const [seatNumber, setSeatNumber] = useState(editPost?.seatNumber ?? '');
  const [seatRating, setSeatRating] = useState<number | null>(editPost?.seatRating ?? null);

  // ── Pub Recommendation fields — pre-filled in edit mode ──
  const [pubName, setPubName] = useState(editPost?.pubName ?? '');
  const [pubAddress, setPubAddress] = useState(editPost?.pubAddress ?? '');
  const [pubDistance, setPubDistance] = useState(editPost?.pubDistance ?? '');

  // ── I'm Going fields — pre-filled in edit mode ──
  const [matchId, setMatchId] = useState<number | null>(editPost?.matchId ?? null);
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // ── Submission state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // When the user lands on the form step with IM_GOING type,
  // fetch upcoming matches from the backend to populate the dropdown.
  // This is a one-off load so plain fetch + useEffect is used instead of TanStack Query.
  useEffect(() => {
    if (step === 'form' && postType === 'IM_GOING') {
      setMatchesLoading(true);
      fetch(`/api/fanbase/team/${teamId}/upcoming-matches`)
        .then((res) => res.json())
        .then((data) => {
          setUpcomingMatches(data.matches ?? []);
        })
        .catch(() => {
          // On network error, show the "no matches" soft message instead of crashing
          setUpcomingMatches([]);
        })
        .finally(() => {
          setMatchesLoading(false);
        });
    }
  }, [step, postType, teamId]);

  // Handles picking a post type on step 1 and advancing to the form step
  const handleTypeSelect = (type: PostType) => {
    setPostType(type);
    setStep('form');
  };

  // Client-side validation before calling the API.
  // Returns an error string if invalid, or null if all required fields are present.
  const validateForm = (): string | null => {
    if (!title.trim()) return 'Title is required';
    if (!body.trim()) return 'Message is required';
    if (!authorName.trim()) return 'Your name is required';
    // Pub name is required for pub recommendations
    if (postType === 'PUB_RECOMMENDATION' && !pubName.trim()) {
      return 'Pub name is required for a pub recommendation';
    }
    return null;
  };

  // Submits the form — uses PUT for edits, POST for new posts.
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    // ── Edit mode: PUT /api/posts/:id ──
    if (editPost) {
      // Build edit payload with only the fields that have values (don't send undefined)
      const editPayload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
        authorName: authorName.trim(),
        ...(postType === 'SEAT_TIP' && {
          ...(seatSection.trim() && { seatSection: seatSection.trim() }),
          ...(seatRow.trim() && { seatRow: seatRow.trim() }),
          ...(seatNumber.trim() && { seatNumber: seatNumber.trim() }),
          ...(seatRating !== null && { seatRating }),
        }),
        ...(postType === 'PUB_RECOMMENDATION' && {
          pubName: pubName.trim(),
          ...(pubAddress.trim() && { pubAddress: pubAddress.trim() }),
          ...(pubDistance.trim() && { pubDistance: pubDistance.trim() }),
        }),
        ...(postType === 'IM_GOING' && matchId !== null && { matchId }),
      };

      try {
        const res = await fetch(`/api/posts/${editPost.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editPayload),
        });

        if (res.ok) {
          // Refresh the posts feed so the updated post is shown immediately
          queryClient.invalidateQueries({ queryKey: ['fanbase', 'posts'] });
          onClose();
        } else {
          const data = await res.json().catch(() => ({}));
          setSubmitError(data.error ?? 'Failed to update post. Please try again.');
        }
      } catch {
        setSubmitError('Network error. Please check your connection and try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ── Create mode: POST /api/posts ──
    // The modal is only reachable by logged-in users (guests see AuthGateModal instead).
    // The auth cookie is sent automatically with credentials: 'include'.
    const postPayload: Record<string, unknown> = {
      teamId,
      teamName,
      postType: postType!,
      title: title.trim(),
      body: body.trim(),
      authorName: authorName.trim(),
      ...(postType === 'SEAT_TIP' && {
        ...(seatSection.trim() && { seatSection: seatSection.trim() }),
        ...(seatRow.trim() && { seatRow: seatRow.trim() }),
        ...(seatNumber.trim() && { seatNumber: seatNumber.trim() }),
        ...(seatRating !== null && { seatRating }),
      }),
      ...(postType === 'PUB_RECOMMENDATION' && {
        pubName: pubName.trim(),
        ...(pubAddress.trim() && { pubAddress: pubAddress.trim() }),
        ...(pubDistance.trim() && { pubDistance: pubDistance.trim() }),
      }),
      ...(postType === 'IM_GOING' && matchId !== null && { matchId }),
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload),
      });

      if (res.ok) {
        // Refresh the posts feed so the new post appears immediately
        queryClient.invalidateQueries({ queryKey: ['fanbase', 'posts'] });
        onClose();
      } else if (res.status === 401) {
        // Not authenticated — this shouldn't happen if AuthGateModal is working,
        // but handle it gracefully just in case
        setSubmitError('You must be logged in to post. Please refresh the page and try again.');
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the display label for the currently selected post type
  const selectedTypeLabel = POST_TYPES.find((t) => t.type === postType)?.label ?? '';

  return (
    // Backdrop — clicking outside the card closes the modal
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Modal card — stops click events from reaching the backdrop */}
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-xl rounded-none sm:max-h-[90vh] h-full sm:h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Step 1: Type Picker ── */}
        {step === 'type-picker' && (
          <div className="p-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">What would you like to share?</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* 2×2 grid of post type buttons */}
            <div className="grid grid-cols-2 gap-3">
              {POST_TYPES.map(({ type, label, description }) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="text-left p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900 mb-1">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Post Form ── */}
        {step === 'form' && postType && (
          <div className="p-6">
            {/* Header row — in edit mode the Back button is hidden (no type-picker step) */}
            <div className="flex items-center gap-3 mb-2">
              {!editPost && (
                <button
                  onClick={() => setStep('type-picker')}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                  aria-label="Go back"
                >
                  ← Back
                </button>
              )}
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                {selectedTypeLabel}
              </span>
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editPost ? 'Edit your tip' : 'Share your tip'}
            </h2>

            {/* Common fields for all post types */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  placeholder="Give your tip a short title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Tip / Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none"
                  placeholder="Share what you know..."
                />
              </div>

              {/* ── Seat Tip extra fields ── */}
              {postType === 'SEAT_TIP' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <input
                        type="text"
                        value={seatSection}
                        onChange={(e) => setSeatSection(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                        placeholder="e.g. North Stand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Row</label>
                      <input
                        type="text"
                        value={seatRow}
                        onChange={(e) => setSeatRow(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                        placeholder="e.g. G"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seat</label>
                      <input
                        type="text"
                        value={seatNumber}
                        onChange={(e) => setSeatNumber(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                        placeholder="e.g. 14"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <StarRating rating={seatRating} onRate={setSeatRating} />
                  </div>
                </>
              )}

              {/* ── Pub Recommendation extra fields ── */}
              {postType === 'PUB_RECOMMENDATION' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pub Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pubName}
                      onChange={(e) => setPubName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                      placeholder="e.g. The Arsenal Tavern"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={pubAddress}
                      onChange={(e) => setPubAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                      placeholder="e.g. 1 Drayton Park, London"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distance from stadium
                    </label>
                    <input
                      type="text"
                      value={pubDistance}
                      onChange={(e) => setPubDistance(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                      placeholder="e.g. 5 min walk"
                    />
                  </div>
                </>
              )}

              {/* ── I'm Going match picker ── */}
              {postType === 'IM_GOING' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Which match are you going to?
                  </label>
                  {matchesLoading ? (
                    <p className="text-sm text-gray-400">Loading upcoming matches...</p>
                  ) : upcomingMatches.length > 0 ? (
                    <select
                      value={matchId ?? ''}
                      onChange={(e) =>
                        setMatchId(e.target.value ? parseInt(e.target.value, 10) : null)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    >
                      <option value="">Select a match (optional)</option>
                      {upcomingMatches.map((match) => {
                        // Format: "Arsenal vs Chelsea — 15 Mar 2026"
                        const dateStr = new Date(match.matchDate).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });
                        return (
                          <option key={match.id} value={match.id}>
                            {match.homeTeam.name} vs {match.awayTeam.name} — {dateStr}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No upcoming matches found — your post will be published without a match link
                    </p>
                  )}
                </div>
              )}

              {/* Author name — always shown at the bottom */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                {/* If the user is logged in, show their name as read-only — it comes from their account */}
                {user ? (
                  <input
                    type="text"
                    value={authorName}
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                    title="Your name comes from your account"
                  />
                ) : (
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    placeholder="How should we credit you?"
                  />
                )}
              </div>

              {/* Inline error message shown above the submit button */}
              {submitError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {submitError}
                </p>
              )}

              {/* Submit button — label and action differ between create and edit mode */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting
                  ? (editPost ? 'Saving...' : 'Posting...')
                  : (editPost ? 'Save Changes' : 'Post Tip')
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
