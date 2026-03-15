import { useState } from 'react';
import type { Team } from '../types';

interface TeamLogoProps {
  team: Team;
  size?: 'sm' | 'lg'; // sm = 40px (match cards), lg = 64px (detail page)
}

// Shows the team's logo image. Falls back to a green circle with 3-letter initials
// when the logo URL is missing or fails to load (common for newly added teams).
export const TeamLogo: React.FC<TeamLogoProps> = ({ team, size = 'sm' }) => {
  const [imgError, setImgError] = useState(false);
  const dim = size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';

  if (team.logoUrl && !imgError) {
    return (
      <img
        src={team.logoUrl}
        alt={`${team.name} logo`}
        className={`${dim} rounded-full object-contain`}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback: first 3 characters of team name, uppercased
  const initials = team.name.slice(0, 3).toUpperCase();
  return (
    <div className={`${dim} rounded-full bg-green-100 flex items-center justify-center`}>
      <span className="text-green-800 font-bold text-xs">{initials}</span>
    </div>
  );
};
