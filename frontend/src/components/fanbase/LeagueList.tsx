import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { League } from '../../types';
import { SkeletonCard } from '../SkeletonCard';

interface LeagueListProps {
  leagues: League[];
  isLoading: boolean;
  country: string;  // e.g. "england" — already lowercased slug for URL
  onSelect: (league: League) => void;
  // Optional base path — defaults to '/fanbase'. Pass '/stadiums' to reuse
  // this component in the Stadium Guide hub without changing the fanbase routes.
  basePath?: string;
}

export const LeagueList: React.FC<LeagueListProps> = ({ leagues, isLoading, country, onSelect, basePath }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leagues.map(league => (
        <button
          key={league.id}
          onClick={() => {
            onSelect(league);
            // Use league.id in the URL (avoids slug decode complexity)
            navigate(`${basePath ?? '/fanbase'}/${country}/${league.id}`);
          }}
          className="w-full bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all p-4 flex items-center gap-3 text-left"
        >
          {league.logoUrl ? (
            <img src={league.logoUrl} alt={league.name} className="w-8 h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
              {league.name[0]}
            </div>
          )}
          <span className="text-base font-medium text-gray-800">{league.name}</span>
        </button>
      ))}
    </div>
  );
};
