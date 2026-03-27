import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { NearbyStadium } from '../../types';

interface NearbyStadiumsSectionProps {
  stadiums: NearbyStadium[];
}

// Shows up to 3 nearby stadiums within 20 km, each linking to their own detail page.
// Hidden when the array is empty (handled by the parent page).
export const NearbyStadiumsSection: React.FC<NearbyStadiumsSectionProps> = ({ stadiums }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {stadiums.map(s => (
      <Link
        key={s.id}
        to={`/stadiums/${s.id}`}
        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all"
      >
        <div className="flex items-start gap-3">
          {s.team?.logoUrl && (
            <img
              src={s.team.logoUrl}
              alt={s.team.name}
              className="w-8 h-8 object-contain flex-shrink-0 mt-0.5"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
            {s.team && (
              <p className="text-xs text-gray-500 truncate">{s.team.name}</p>
            )}
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>{s.distance} km away</span>
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>
);
