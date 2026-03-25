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
  // When provided, the modal skips the type picker and opens directly on the form
  // with this type pre-selected (used when clicking Add Your Tip from a specific tab)
  preSelectedType?: PostType;
}

// The 5 post types users can pick from, with display labels and descriptions
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
  {
    type: 'GETTING_THERE',
    label: 'Getting There',
    description: 'Share transport tips for getting to the stadium',
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
  preSelectedType,
}) => {
  const queryClient = useQueryClient();
  // Get the logged-in user so we can pre-fill the author name
  const { user } = useAuth();

  // In edit mode or when a type is pre-selected (tab-specific tip button),
  // skip the type picker and start directly on the form step
  const [step, setStep] = useState<'type-picker' | 'form'>(
    editPost || preSelectedType ? 'form' : 'type-picker'
  );

  // Pre-select the post type from edit mode or the tab's pre-selected type
  const [postType, setPostType] = useState<PostType | null>(
    editPost?.postType ?? preSelectedType ?? null
  );

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

  // ── Getting There fields — pre-filled in edit mode ──
  const [transportType, setTransportType] = useState(editPost?.transportType ?? '');
  const [travelCost, setTravelCost] = useState(editPost?.travelCost ?? '');
  const [travelTime, setTravelTime] = useState(editPost?.travelTime ?? '');

  // ── Photo upload state (Seat Tip only) ──
  // photoPreviewUrl: local object URL shown immediately after file selection (synchronous)
  // photoUploadedUrl: Azure Blob URL returned after the background upload completes
  // _photoFile is stored but not read directly — setPhotoFile is used to track file state
  // and to clear it on cancel/submit. Prefixed with _ to suppress unused-variable warning.
  const [_photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(editPost?.photoUrl ?? null);
  const [photoUploadedUrl, setPhotoUploadedUrl] = useState<string | null>(editPost?.photoUrl ?? null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

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

  // Called when the user selects a file in the photo input.
  // Validates the file type and size client-side, shows a local preview immediately,
  // then uploads to Azure Blob in the background via POST /api/upload.
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation before any network call
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Only jpg, png, and webp images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Photo must be smaller than 5MB.');
      return;
    }

    // Revoke the previous object URL to prevent memory leaks before creating a new one.
    // Object URLs (blob:...) are not cleaned up automatically by the browser.
    if (photoPreviewUrl && !photoPreviewUrl.startsWith('http')) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    // Show preview immediately from the local File object — no network wait needed
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setPhotoError(null);
    setPhotoUploadedUrl(null);

    // Upload to Azure Blob in the background
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
        // Do NOT set Content-Type — browser sets it with the correct multipart boundary
      });

      if (res.ok) {
        const data = await res.json();
        setPhotoUploadedUrl(data.url);
      } else {
        setPhotoError('Photo upload failed. You can still post without a photo.');
        setPhotoPreviewUrl(null);
        setPhotoFile(null);
      }
    } catch {
      setPhotoError('Photo upload failed. You can still post without a photo.');
      setPhotoPreviewUrl(null);
      setPhotoFile(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  // Clears the selected photo from the form — does not delete anything from Azure
  const handleRemovePhoto = () => {
    if (photoPreviewUrl && !photoPreviewUrl.startsWith('http')) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setPhotoUploadedUrl(null);
    setPhotoError(null);
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
          photoUrl: photoUploadedUrl || null,
        }),
        ...(postType === 'PUB_RECOMMENDATION' && {
          pubName: pubName.trim(),
          ...(pubAddress.trim() && { pubAddress: pubAddress.trim() }),
          ...(pubDistance.trim() && { pubDistance: pubDistance.trim() }),
        }),
        ...(postType === 'IM_GOING' && matchId !== null && { matchId }),
        ...(postType === 'GETTING_THERE' && {
          ...(transportType && { transportType }),
          ...(travelCost.trim() && { travelCost: travelCost.trim() }),
          ...(travelTime.trim() && { travelTime: travelTime.trim() }),
        }),
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
        ...(photoUploadedUrl && { photoUrl: photoUploadedUrl }),
      }),
      ...(postType === 'PUB_RECOMMENDATION' && {
        pubName: pubName.trim(),
        ...(pubAddress.trim() && { pubAddress: pubAddress.trim() }),
        ...(pubDistance.trim() && { pubDistance: pubDistance.trim() }),
      }),
      ...(postType === 'IM_GOING' && matchId !== null && { matchId }),
      ...(postType === 'GETTING_THERE' && {
        ...(transportType && { transportType }),
        ...(travelCost.trim() && { travelCost: travelCost.trim() }),
        ...(travelTime.trim() && { travelTime: travelTime.trim() }),
      }),
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
      {/* Modal card — stops click events from reaching the backdrop.
          max-h-[90vh] + overflow-y-auto makes the modal scrollable on small screens. */}
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Step 1: Type Picker ── */}
        {step === 'type-picker' && (
          <div className="p-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">What would you like to share?</h2>
              {/* p-3 gives a 48px effective tap area around the 24px × icon */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-3 -mr-3"
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
              {/* p-3 gives a 48px effective tap area around the 24px × icon */}
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-600 text-2xl leading-none p-3 -mr-3"
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

                  {/* ── Photo upload (optional) ── */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add a photo (optional)
                    </label>
                    {!photoPreviewUrl ? (
                      // Dashed border drop zone — clicking opens the hidden file input
                      <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors min-h-[44px]">
                        <span className="text-sm text-gray-500">Choose photo</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handlePhotoSelect}
                        />
                      </label>
                    ) : (
                      // Preview state — shows the selected image with an upload spinner overlay
                      <div className="relative">
                        <img
                          src={photoPreviewUrl}
                          alt="Photo preview"
                          className="max-h-32 rounded-lg object-cover w-full"
                        />
                        {photoUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {photoUploading && (
                          <p className="text-xs text-gray-400 mt-1">Uploading...</p>
                        )}
                        {!photoUploading && (
                          <div className="flex justify-end mt-1">
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="text-xs text-red-500 hover:text-red-700 min-h-[44px] px-2"
                            >
                              Remove photo
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {photoError && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
                        {photoError}
                      </p>
                    )}
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

              {/* ── Getting There extra fields ── */}
              {postType === 'GETTING_THERE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transport Type
                    </label>
                    <select
                      value={transportType}
                      onChange={(e) => setTransportType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                    >
                      <option value="">Select transport type</option>
                      <option value="Metro">Metro</option>
                      <option value="Bus">Bus</option>
                      <option value="Train">Train</option>
                      <option value="Taxi">Taxi</option>
                      <option value="Walking">Walking</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost (optional)
                      </label>
                      <input
                        type="text"
                        value={travelCost}
                        onChange={(e) => setTravelCost(e.target.value)}
                        maxLength={50}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                        placeholder='e.g. "€2.50" or "Free"'
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Travel time (optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={travelTime}
                          onChange={(e) => setTravelTime(e.target.value)}
                          min={0}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                          placeholder="e.g. 15"
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">min</span>
                      </div>
                    </div>
                  </div>
                </>
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
                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[48px]"
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
