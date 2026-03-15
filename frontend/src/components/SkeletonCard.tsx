import React from 'react';

// Reusable skeleton loading card — shows while data is being fetched.
// Used in TeamGrid, LeagueList, and later in the post feed.
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`}>
      <div className="h-12 bg-gray-200 rounded-t-lg" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
};
