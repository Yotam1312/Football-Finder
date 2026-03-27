import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStadiumSearch } from '../../hooks/useStadiumSearch';
import { StadiumSearchResult } from './StadiumSearchResult';

// Search input with debounced autocomplete for stadium/team name search.
// Adapted from TeamSearchInput — same debounce, blur delay, and keyboard patterns.
export const StadiumSearchInput: React.FC = () => {
  const navigate = useNavigate();
  const [rawQuery, setRawQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { data, isLoading, isError } = useStadiumSearch(rawQuery);
  const results = data?.stadiums ?? [];

  const selectResult = (stadiumId: number) => {
    setRawQuery('');
    setShowDropdown(false);
    navigate(`/stadiums/${stadiumId}`);
  };

  // Delay hiding dropdown by 150ms to let the onClick on a result fire first
  // (browser fires blur before click — this prevents the click from being swallowed)
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
        placeholder="Search by team or stadium name..."
        aria-label="Search for a stadium"
        className="w-full border border-slate-600 bg-slate-700/60 backdrop-blur-sm rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent shadow-lg"
      />

      {/* Search dropdown — only shown when focused and query is 2+ chars */}
      {showDropdown && rawQuery.length >= 2 && (
        <div
          role="listbox"
          aria-label="Stadium search results"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          )}

          {isError && !isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">
              Search failed. Check your connection and try again.
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No stadiums found for &quot;{rawQuery}&quot;. Try a team name like &quot;Arsenal&quot; or &quot;Bayern&quot;.
            </div>
          )}

          {!isLoading && !isError && results.map((stadium, index) => (
            <StadiumSearchResult
              key={stadium.id}
              stadium={stadium}
              isActive={index === activeIndex}
              onSelect={selectResult}
            />
          ))}
        </div>
      )}
    </div>
  );
};
