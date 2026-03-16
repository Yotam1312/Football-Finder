import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFanbaseTeam } from '../hooks/useFanbaseTeam';
import { useFanbasePosts } from '../hooks/useFanbasePosts';
import { TeamLogo } from '../components/TeamLogo';
import { PostFeed } from '../components/fanbase/PostFeed';
import { CreatePostModal } from '../components/fanbase/CreatePostModal';

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
// Fully public and read-only in Phase 3 — no login required (satisfies FAN-04).
// Phase 4 will remove the `disabled` attribute from the Add button and wire the post form.
export const TeamFanBasePage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read active tab from the URL so the tab state is shareable via link.
  // Default to 'all' when the ?tab= param is not present.
  const activeTab = searchParams.get('tab') ?? 'all';

  // Track which page of posts is shown — reset to 1 whenever the tab changes
  const [page, setPage] = useState(1);

  // Controls whether the CreatePostModal is open
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Look up the PostType filter for the active tab (undefined for 'all' = no filter)
  const postType = TAB_TO_POST_TYPE[activeTab];

  const { data: teamData, isLoading: teamLoading, isError: teamError } = useFanbaseTeam(teamId);
  const { data: postsData, isLoading: postsLoading } = useFanbasePosts(teamId, postType, page);

  const team  = teamData?.team;
  const posts = postsData?.posts ?? [];
  const total = postsData?.total ?? 0;

  // When the user switches tabs, update the URL and reset to page 1
  const handleTabChange = (slug: string) => {
    setSearchParams({ tab: slug });
    setPage(1);
  };

  // Error state — team not found or network error
  if (teamError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl text-gray-400 mb-2">🏟️</p>
          <h1 className="text-xl font-semibold text-gray-700 mb-2">Team not found</h1>
          <p className="text-gray-500 text-sm mb-4">This team may not be in the database yet.</p>
          <Link to="/fanbase" className="text-green-600 hover:underline text-sm">
            ← Back to FanBase Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb back link to the FanBase hub */}
        <Link to="/fanbase" className="text-sm text-gray-500 hover:text-green-600 transition-colors mb-6 inline-block">
          ← FanBase Hub
        </Link>

        {/* Team header card — shows logo, name, and total post count */}
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
                  <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                  <p className="text-gray-500 text-sm mt-0.5">
                    FanBase · {team._count.posts} {team._count.posts === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </div>

              {/* Add button — opens the CreatePostModal. Any visitor can post (FAN-04). */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-shrink-0 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
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
        />
      </div>

      {/* Create post modal — rendered at root level to escape the content container */}
      {isModalOpen && team && (
        <CreatePostModal
          teamId={parseInt(teamId!, 10)}
          teamName={team.name}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </motion.div>
  );
};
