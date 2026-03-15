// Domain types for Football Finder
// These match the shapes returned by the backend API endpoints.

export interface League {
  id: number;
  name: string;
  country: string;
  logoUrl: string | null;
}

export interface Team {
  id: number;
  name: string;
  logoUrl: string | null;
}

export interface Stadium {
  id: number;
  name: string;
  city: string;
  cityNormalized: string;
  timezone: string;        // IANA timezone string, e.g. "Europe/London"
  googleMapsUrl: string | null;
}

export interface TeamStanding {
  id: number;
  teamId: number;
  leagueId: number;
  season: number;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Match {
  id: number;
  matchDate: string;       // ISO string from API — convert to Date for display
  status: string;          // "NS" = Not Started
  ticketUrl: string | null;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  stadium: Stadium | null;
}

// Match with standings — returned by the detail endpoint
export interface MatchDetail extends Match {
  homeTeamStanding: TeamStanding | null;
  awayTeamStanding: TeamStanding | null;
}
