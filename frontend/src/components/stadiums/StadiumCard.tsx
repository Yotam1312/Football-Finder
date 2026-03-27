import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { StadiumBrowseResult } from '../../types';

interface StadiumCardProps {
  stadium: StadiumBrowseResult;
}

// A single card in the Stadium Guide browse grid.
// Shows the home team badge, team name, stadium name, and city.
// Clicking navigates to the full stadium detail page.
export const StadiumCard: React.FC<StadiumCardProps> = ({ stadium }) => {
  return (
    <Link to={`/stadiums/${stadium.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-full hover:shadow-md hover:border-slate-300 transition-all duration-150">
        {/* Team badge + name */}
        <div className="flex items-center gap-3 mb-4">
          {stadium.team?.logoUrl ? (
            <img
              src={stadium.team.logoUrl}
              alt={stadium.team.name}
              className="w-10 h-10 object-contain flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
          )}
          <span className="text-sm text-gray-500 font-medium leading-tight">
            {stadium.team?.name ?? 'Unknown team'}
          </span>
        </div>

        {/* Stadium name */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-slate-700 transition-colors">
          {stadium.name}
        </h3>

        {/* City */}
        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{stadium.city}</span>
        </div>

        {/* Subtle CTA */}
        <p className="mt-4 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
          Explore &rarr;
        </p>
      </div>
    </Link>
  );
};
