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
  // Transport fields — added Phase 17 (data from Phase 15 DB schema)
  nearbyMetros: string[];
  nearbyTrains: string[];
  nearbyBuses: string[];
  walkingTimeFromCenter: string | null;
  publicTransportInfo: string | null;
  parkingInfo: string | null;
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

// ─────────────────────────────────────────────
// FANBASE TYPES (Phase 3)
// ─────────────────────────────────────────────

// Extends the base Team type with a post count — returned by league teams endpoint
// and team detail endpoint. The _count field comes directly from Prisma's relation aggregate.
export interface TeamWithPostCount extends Team {
  _count: { posts: number };
}

// Shape returned by the team search endpoint.
// League may be null if the team has no home matches in the DB yet.
export interface TeamSearchResult {
  id: number;
  name: string;
  logoUrl: string | null;
  league: { id: number; name: string; country: string } | null;
}

// PostType matches the Prisma enum in schema.prisma
export type PostType = 'GENERAL_TIP' | 'SEAT_TIP' | 'PUB_RECOMMENDATION' | 'IM_GOING' | 'GETTING_THERE';

// A FanBase post — matches the Post table in schema.prisma.
// Optional fields are null for post types that don't use them
// (e.g. seatSection is only set on SEAT_TIP posts).
export interface Post {
  id: number;
  teamId: number;
  postType: PostType;
  title: string;
  body: string;
  authorName: string;
  photoUrl: string | null;       // SEAT_TIP only — Phase 4 feature
  seatSection: string | null;    // SEAT_TIP only
  seatRow: string | null;        // SEAT_TIP only
  seatNumber: string | null;     // SEAT_TIP only
  seatRating: number | null;     // SEAT_TIP only (1–5 stars)
  pubName: string | null;        // PUB_RECOMMENDATION only
  pubAddress: string | null;     // PUB_RECOMMENDATION only
  pubDistance: string | null;    // PUB_RECOMMENDATION only (e.g. "5 min walk")
  matchId: number | null;        // IM_GOING only — links to a specific Match
  transportType: string | null;  // GETTING_THERE only — Metro/Bus/Train/Taxi/Walking/Other
  travelCost: string | null;     // GETTING_THERE only — free text e.g. "€2.50" or "Free"
  travelTime: string | null;     // GETTING_THERE only — stored as string e.g. "15" (minutes)
  upvoteCount: number;           // read-only in Phase 3
  createdAt: string;             // ISO string from API — use formatRelativeTime() to display
  userId: number | null;         // null for email-only (Level 2) posts; set for Level 3 accounts
  authorEmail: string;           // used to match posts to the logged-in user for edit/delete
}

// ─────────────────────────────────────────────
// AUTH TYPES (Phase 9)
// ─────────────────────────────────────────────

// The authenticated user returned by GET /api/auth/me.
// Level 2 no longer exists — all authenticated users are Level 3.
// accountType tells the frontend whether to show password-change options.
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  level: 3;  // always 3 — Level 2 (email-only) auth is removed in Phase 9
  age: number | null;
  country: string | null;       // new — shown and editable on profile page
  favoriteClubId: number | null;
  avatarUrl: string | null;     // new — Google photo URL or custom upload (Phase 10)
  accountType: 'google' | 'email';  // new — controls password section visibility in profile
}
