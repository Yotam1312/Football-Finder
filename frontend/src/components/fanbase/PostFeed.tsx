import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Post } from '../../types';
import { PostCard } from './PostCard';
import { SkeletonCard } from '../SkeletonCard';


// Tab configuration — single source of truth so no magic strings are scattered around.
const TABS = [
  { slug: 'all',         label: 'All' },
  { slug: 'seat-tips',   label: 'Seat Tips' },
  { slug: 'pubs-food',   label: 'Pubs & Food' },
  { slug: 'local-crowd', label: 'Local Crowd' },
  { slug: 'im-going',    label: "I'm Going" },
];

// Encouraging per-tab empty state messages — each is specific to what that tab shows.
const EMPTY_MESSAGES: Record<string, string> = {
  'all':         'No community posts yet for this team. Check back soon!',
  'seat-tips':   'No seat tips yet. Be the first to share where to sit!',
  'pubs-food':   'No pub recommendations yet. Know a good spot near the ground?',
  'local-crowd': 'No local tips yet. Be the first to share match-day advice!',
  'im-going':    "Nobody's announced they're going yet. Are you?",
};

// Number of posts per page — must match the backend PAGE_SIZE constant
const PAGE_SIZE = 10;

interface PostFeedProps {
  activeTab: string;
  onTabChange: (slug: string) => void;
  posts: Post[];
  isLoading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  // These three are passed down to PostCard → PostCardActions for upvote/edit/delete
  teamId: string | undefined;
  postType: string | undefined;
  onEdit: (post: Post) => void;
}

// PostFeed renders the tab bar, animated post list, per-tab empty states, and pagination.
// The parent (TeamFanBasePage) owns the URL state and passes it down as props.
export const PostFeed: React.FC<PostFeedProps> = ({
  activeTab, onTabChange, posts, isLoading, total, page, onPageChange,
  teamId, postType, onEdit,
}) => {
  const isEmpty = !isLoading && posts.length === 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Tab bar — highlights the active tab with a green underline border */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.slug}
            onClick={() => onTabChange(tab.slug)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px min-h-[48px] ${
              activeTab === tab.slug
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — AnimatePresence causes the old tab to fade out before the new one fades in */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Loading state — 3 skeleton cards while posts are being fetched */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-32" />)}
            </div>
          )}

          {/* Empty state — specific encouraging message for each tab */}
          {isEmpty && (
            <div className="text-center py-16 px-4">
              <p className="text-gray-400 text-4xl mb-4">🏟️</p>
              <p className="text-gray-600 font-medium mb-2">
                {EMPTY_MESSAGES[activeTab] ?? EMPTY_MESSAGES['all']}
              </p>
              <p className="text-gray-400 text-sm">
                Use the "+ Add Your Tip" button above to be the first!
              </p>
            </div>
          )}

          {/* Post list — rendered once data arrives and is non-empty */}
          {!isLoading && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  teamId={teamId}
                  postType={postType}
                  page={page}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination — only shown when there are more posts than fit on one page */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors min-h-[48px]"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors min-h-[48px]"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};
