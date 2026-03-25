import React from 'react';
import { MapPin } from 'lucide-react';

// Hero banner for the Stadium Guide hub page.
// Green gradient matching the TransportPage hero pattern (from-green-800 to-green-600).
export const StadiumHubHero: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-green-800 to-green-600 rounded-2xl p-8 md:p-12 mb-8 text-white text-center">
      <MapPin className="w-12 h-12 mx-auto mb-4 text-white" />
      <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
        Stadium Guide
      </h1>
      <p className="text-green-100 text-base leading-relaxed max-w-2xl mx-auto">
        Search for any stadium or browse by country, league, and team.
      </p>
    </div>
  );
};
