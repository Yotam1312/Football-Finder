import React from 'react';
import type { StadiumSearchResult as StadiumResult } from '../../types';

interface StadiumSearchResultProps {
  stadium: StadiumResult;
  isActive: boolean;
  onSelect: (stadiumId: number) => void;
}

// A single row in the stadium search dropdown.
// Shows team crest (24px), stadium name, and city.
export const StadiumSearchResult: React.FC<StadiumSearchResultProps> = ({ stadium, isActive, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(stadium.id)}
      role="option"
      aria-selected={isActive}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
        isActive ? 'bg-green-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Team crest — 24x24px with rounded-sm, or placeholder if no team */}
      {stadium.team?.logoUrl ? (
        <img
          src={stadium.team.logoUrl}
          alt={stadium.team.name}
          className="w-6 h-6 rounded-sm object-contain flex-shrink-0"
        />
      ) : (
        <div className="w-6 h-6 rounded-sm bg-gray-200 flex-shrink-0" />
      )}
      <div>
        <p className="text-sm text-gray-800">{stadium.name}</p>
        <p className="text-xs text-gray-500">{stadium.city}</p>
      </div>
    </button>
  );
};
