import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFanbaseTeamSearch } from '../../hooks/useFanbaseTeamSearch';
import { TeamLogo } from '../TeamLogo';

export const TeamSearchInput: React.FC = () => {
  const navigate = useNavigate();
  const [rawQuery, setRawQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { data, isLoading } = useFanbaseTeamSearch(rawQuery);
  const results = data?.teams ?? [];

  const selectResult = (teamId: number) => {
    setRawQuery('');
    setShowDropdown(false);
    navigate(`/fanbase/team/${teamId}`);
  };

  // Delay hiding dropdown by 150ms to let the onClick on a result fire first
  const handleBlur = () => setTimeout(() => setShowDropdown(false), 150);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      selectResult(results[activeIndex].id);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <input
        type="text"
        value={rawQuery}
        onChange={e => {
          setRawQuery(e.target.value);
          setActiveIndex(-1);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Search for a team..."
        aria-label="Search for a team"
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
      />

      {/* Search dropdown — only shown when focused and query is 2+ chars */}
      {showDropdown && rawQuery.length >= 2 && (
        <div
          role="listbox"
          aria-label="Team search results"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No teams found for "{rawQuery}"
            </div>
          )}

          {!isLoading && results.map((team, index) => (
            <button
              key={team.id}
              onClick={() => selectResult(team.id)}
              role="option"
              aria-selected={index === activeIndex}
              className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                index === activeIndex ? 'bg-green-50' : 'hover:bg-gray-50'
              }`}
            >
              <TeamLogo team={team} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-800">{team.name}</p>
                {team.league && (
                  <p className="text-xs text-gray-500">
                    {team.league.name} · {team.league.country}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
