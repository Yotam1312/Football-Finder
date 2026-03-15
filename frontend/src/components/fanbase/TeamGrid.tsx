import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TeamWithPostCount } from '../../types';
import { TeamLogo } from '../TeamLogo';
import { SkeletonCard } from '../SkeletonCard';

interface TeamGridProps {
  teams: TeamWithPostCount[];
  isLoading: boolean;
}

export const TeamGrid: React.FC<TeamGridProps> = ({ teams, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} className="h-32" />)}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">No teams found for this league.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {teams.map(team => (
        <button
          key={team.id}
          onClick={() => navigate(`/fanbase/team/${team.id}`)}
          className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all p-4 flex flex-col items-center gap-2 cursor-pointer"
        >
          {/* TeamLogo accepts 'sm' | 'lg' — using 'sm' (40px) for team grid cards */}
          <TeamLogo team={team} size="sm" />
          <span className="text-sm font-medium text-center text-gray-700 leading-snug">
            {team.name}
          </span>
          {/* Post count badge (FAN-05) */}
          {team._count.posts > 0 ? (
            <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
              {team._count.posts} {team._count.posts === 1 ? 'post' : 'posts'}
            </span>
          ) : (
            <span className="text-xs text-gray-400">No posts yet</span>
          )}
        </button>
      ))}
    </div>
  );
};
