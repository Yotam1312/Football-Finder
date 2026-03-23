import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFanbaseTeam } from '../hooks/useFanbaseTeam';
import { useFanbasePosts } from '../hooks/useFanbasePosts';
import { TeamLogo } from '../components/TeamLogo';
import { PostFeed } from '../components/fanbase/PostFeed';
import { CreatePostModal } from '../components/fanbase/CreatePostModal';
import { AuthGateModal } from '../components/fanbase/AuthGateModal';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';

// Maps URL tab slugs to PostType enum values used by the API's ?type= filter.
// 'all' maps to undefined so the API returns posts of every type (no filter applied).
const TAB_TO_POST_TYPE: Record<string, string | undefined> = {
  'all':         undefined,
  'seat-tips':   'SEAT_TIP',
  'pubs-food':   'PUB_RECOMMENDATION',
  'local-crowd': 'GENERAL_TIP',
  'im-going':    'IM_GOING',
};

// Team FanBase page — the destination users reach from the hub or search.
// Phase 4 additions: heart icon for Level 3 favorites, upvote/edit/delete on posts.
export const TeamFanBasePage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Read active tab from the URL so the tab state is shareable via link.
  // Default to 'all' when the ?tab= param is not present.
  const activeTab = searchParams.get('tab') ?? 'all';

  // Track which page of posts is shown — reset to 1 whenever the tab changes
  const [page, setPage] = useState(1);

  // Controls whether the CreatePostModal is open
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Controls whether the AuthGateModal is open (shown to guests who click Add Your Tip)
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);

  // When editPost is set, the modal opens in edit mode with that post's data pre-filled.
  // Cleared back to null when the modal closes.
  const [editPost, setEditPost] = useState<Post | null>(null);

  // Heart/favorite state — only relevant for Level 3 users
  const [isFavorited, setIsFavorited] = useState(false);

  // Look up the PostType filter for the active tab (undefined for 'all' = no filter)
  const postType = TAB_TO_POST_TYPE[activeTab];

  const { data: teamData, isLoading: teamLoading, isError: teamError } = useFanbaseTeam(teamId);
  const { data: postsData, isLoading: postsLoading } = useFanbasePosts(teamId, postType, page);

  const team  = teamData?.team;
  const posts = postsData?.posts ?? [];
  const total = postsData?.total ?? 0;

  // On mount and when user changes: check if this team is already favorited.
  // Only runs for Level 3 users — guests and Level 2 don't have favorites.
  useEffect(() => {
    if (user?.level !== 3 || !teamId) return;

    const checkFavorite = async () => {
      try {
        const res = await fetch('/api/users/favorites', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          // favoriteTeamIds is an array of team IDs
          const teamIdNum = parseInt(teamId, 10);
          setIsFavorited((data.favoriteTeamIds ?? []).includes(teamIdNum));
        }
      } catch {
        // Non-critical — favorite state just won't be shown
      }
    };

    checkFavorite();
  }, [user, teamId]);

  // Toggles the favorite status for this team.
  // Calls POST /api/users/favorites/:teamId — backend handles add/remove toggle.
  const handleToggleFavorite = async () => {
    if (!teamId) return;
    try {
      const res = await fetch(`/api/users/favorites/${teamId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setIsFavorited((prev) => !prev);
      }
    } catch {
      // Fail silently — user can try again
    }
  };

  // When the user switches tabs, update the URL and reset to page 1
  const handleTabChange = (slug: string) => {
    setSearchParams({ tab: slug });
    setPage(1);
  };

  // Opens the modal in edit mode for the given post
  const handleEditPost = (post: Post) => {
    setEditPost(post);
    setIsModalOpen(true);
  };

  // Closes the modal and clears any edit state
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditPost(null);
  };

  // Handles clicking the "+ Add Your Tip" button.
  // Level 3 (full account) is required to post. Guests and Level 2 users
  // (email-only accounts from the old hybrid flow) see the AuthGateModal
  // directing them to register or log in.
  const handleAddTipClick = () => {
    if (!user || user.level < 3) {
      setIsAuthGateOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  // Error state — team not found or network error
  if (teamError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex items-center justify-center min-h-screen pb-20 md:pb-0"
      >
        <div className="text-center">
          <p className="text-2xl text-gray-400 mb-2">🏟️</p>
          <h1 className="text-xl font-semibold text-gray-700 mb-2">Team not found</h1>
          <p className="text-gray-500 text-sm mb-4">This team may not be in the database yet.</p>
          <Link to="/fanbase" className="text-green-600 hover:underline text-sm">
            ← Back to FanBase Hub
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="min-h-screen bg-gray-50 pb-20 md:pb-0"
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb back link to the FanBase hub */}
        <Link to="/fanbase" className="text-sm text-gray-500 hover:text-green-600 transition-colors mb-6 inline-block">
          ← FanBase Hub
        </Link>

        {/* Team header card — shows logo, name, total post count, and heart icon for Level 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          {teamLoading ? (
            // Skeleton placeholder while team data loads
            <div className="flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ) : team ? (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <TeamLogo team={team} size="lg" />
                <div>
                  {/* Team name with optional heart icon for Level 3 users */}
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                    {/* Heart icon — only shown to Level 3 users */}
                    {/* p-2 gives a ~44px touch area around the 24px icon — close enough to 48px */}
                    {user?.level === 3 && (
                      <button
                        onClick={handleToggleFavorite}
                        className="text-2xl transition-colors p-2 -m-2"
                        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFavorited ? '❤️' : '🤍'}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">
                    FanBase · {team._count.posts} {team._count.posts === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </div>

              {/* Add button — guests see AuthGateModal; logged-in users see CreatePostModal */}
              <button
                onClick={handleAddTipClick}
                className="flex-shrink-0 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors min-h-[48px]"
              >
                + Add Your Tip
              </button>
            </div>
          ) : null}
        </div>

        {/* Post feed — tabs, animated content, empty states, and pagination */}
        <PostFeed
          activeTab={activeTab}
          onTabChange={handleTabChange}
          posts={posts}
          isLoading={postsLoading}
          total={total}
          page={page}
          onPageChange={setPage}
          teamId={teamId}
          postType={postType}
          onEdit={handleEditPost}
        />
      </div>

      {/* Create/edit post modal — only reachable for logged-in users */}
      {isModalOpen && team && (
        <CreatePostModal
          teamId={parseInt(teamId!, 10)}
          teamName={team.name}
          onClose={handleModalClose}
          editPost={editPost ?? undefined}
        />
      )}

      {/* Auth gate modal — shown to guests who click Add Your Tip */}
      <AuthGateModal
        isOpen={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
      />
    </motion.div>
  );
};
