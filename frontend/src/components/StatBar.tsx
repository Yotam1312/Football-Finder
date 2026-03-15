import type { TeamStanding, Team } from '../types';

interface StatBarProps {
  homeTeam: Team;
  awayTeam: Team;
  homeStanding: TeamStanding | null;
  awayStanding: TeamStanding | null;
  season: number;
}

interface StatRowProps {
  label: string;
  homeValue: string | number;
  awayValue: string | number;
}

// A single stat row showing: home value | label | away value
const StatRow: React.FC<StatRowProps> = ({ label, homeValue, awayValue }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-800 font-semibold w-12 text-center">{homeValue}</span>
    <span className="text-gray-500 text-sm text-center flex-1">{label}</span>
    <span className="text-gray-800 font-semibold w-12 text-center">{awayValue}</span>
  </div>
);

// Shows current season league stats for both teams, side by side.
// Returns null when both standings are missing — keeps the detail page clean
// for newly promoted or non-tracked teams.
export const StatBar: React.FC<StatBarProps> = ({
  homeTeam,
  awayTeam,
  homeStanding,
  awayStanding,
  season,
}) => {
  // Don't render the section at all if neither team has standing data
  if (!homeStanding && !awayStanding) return null;

  // Win rate percentage — e.g. "67%" for 4 wins out of 6 played
  const winRate = (standing: TeamStanding | null) => {
    if (!standing || standing.played === 0) return 'N/A';
    return `${Math.round((standing.wins / standing.played) * 100)}%`;
  };

  // Goal difference — positive values get a "+" prefix for clarity
  const goalDiff = (standing: TeamStanding | null) => {
    if (!standing) return 'N/A';
    const diff = standing.goalsFor - standing.goalsAgainst;
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
        {season}/{season + 1} Season Stats
      </h2>

      {/* Team name headers above the stat rows */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-gray-700 text-sm w-1/3 text-left">
          {homeTeam.name}
        </span>
        <span className="text-gray-400 text-xs text-center w-1/3">Stat</span>
        <span className="font-semibold text-gray-700 text-sm w-1/3 text-right">
          {awayTeam.name}
        </span>
      </div>

      <StatRow label="Position" homeValue={homeStanding?.position ?? 'N/A'} awayValue={awayStanding?.position ?? 'N/A'} />
      <StatRow label="Points"   homeValue={homeStanding?.points   ?? 'N/A'} awayValue={awayStanding?.points   ?? 'N/A'} />
      <StatRow label="Played"   homeValue={homeStanding?.played   ?? 'N/A'} awayValue={awayStanding?.played   ?? 'N/A'} />
      <StatRow label="Wins"     homeValue={homeStanding?.wins     ?? 'N/A'} awayValue={awayStanding?.wins     ?? 'N/A'} />
      <StatRow label="Draws"    homeValue={homeStanding?.draws    ?? 'N/A'} awayValue={awayStanding?.draws    ?? 'N/A'} />
      <StatRow label="Losses"   homeValue={homeStanding?.losses   ?? 'N/A'} awayValue={awayStanding?.losses   ?? 'N/A'} />
      <StatRow label="Win Rate" homeValue={winRate(homeStanding)}           awayValue={winRate(awayStanding)} />
      <StatRow label="Goal Diff" homeValue={goalDiff(homeStanding)}         awayValue={goalDiff(awayStanding)} />
    </div>
  );
};
