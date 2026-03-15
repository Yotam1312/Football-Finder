import { Request, Response } from 'express';
import { PostType } from '@prisma/client';
import prisma from '../config/database';

// Valid PostType values — must match the Prisma enum exactly.
// We list them explicitly so we can validate user input without importing Prisma internals at runtime.
const VALID_POST_TYPES = ['GENERAL_TIP', 'SEAT_TIP', 'PUB_RECOMMENDATION', 'IM_GOING'];

// How many posts to return per page
const PAGE_SIZE = 10;

// GET /api/fanbase/countries
// Returns a deduplicated, alphabetically sorted list of all country names
// that have at least one league in our database.
export const getCountries = async (req: Request, res: Response) => {
  try {
    const leagues = await prisma.league.findMany({
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    });

    res.json({ countries: leagues.map(l => l.country) });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

// GET /api/fanbase/countries/:country/leagues
// Returns all leagues for a given country, sorted alphabetically by name.
// Country matching is case-sensitive — the URL param should match how it's stored in the DB.
export const getLeaguesByCountry = async (req: Request, res: Response) => {
  try {
    const { country } = req.params;

    const leagues = await prisma.league.findMany({
      where: { country },
      select: { id: true, name: true, country: true, logoUrl: true },
      orderBy: { name: 'asc' },
    });

    res.json({ leagues });
  } catch (error) {
    console.error('Error fetching leagues by country:', error);
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
};

// GET /api/fanbase/leagues/:leagueId/teams
// Returns all teams that have played in a given league (as home or away team),
// each with a post count badge. Uses a two-step query to avoid the N+1 problem:
// Step 1 collects team IDs from matches, Step 2 fetches those teams with counts.
export const getTeamsByLeague = async (req: Request, res: Response) => {
  try {
    const leagueId = parseInt(req.params.leagueId, 10);
    if (isNaN(leagueId)) {
      return res.status(400).json({ error: 'leagueId must be a number' });
    }

    // Step 1: collect all distinct team IDs from matches in this league
    const matches = await prisma.match.findMany({
      where: { leagueId },
      select: { homeTeamId: true, awayTeamId: true },
    });

    // Build a deduplicated set of team IDs from both home and away sides
    const teamIdSet = new Set<number>();
    for (const m of matches) {
      teamIdSet.add(m.homeTeamId);
      teamIdSet.add(m.awayTeamId);
    }
    const teamIds = Array.from(teamIdSet);

    // Step 2: fetch teams with post counts in one query (avoids N+1)
    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        _count: { select: { posts: true } }, // post count badge shown on team cards (FAN-05)
      },
      orderBy: { name: 'asc' },
    });

    res.json({ teams });
  } catch (error) {
    console.error('Error fetching teams by league:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

// GET /api/fanbase/teams/search?q=
// Case-insensitive team name search. q must be at least 2 characters to prevent
// returning too many results. Returns top 8 matches with league info for the search dropdown.
export const searchTeams = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string | undefined;

    // Require at least 2 characters to avoid overly broad results
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'q must be at least 2 characters' });
    }

    const teams = await prisma.team.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        // Include the league from the first home match so the search dropdown
        // can show "Chelsea — Premier League" style hints
        homeMatches: {
          take: 1,
          select: {
            league: { select: { id: true, name: true, country: true } },
          },
        },
      },
      take: 8,
      orderBy: { name: 'asc' },
    });

    // Flatten: pull the league out of the nested homeMatches relation
    // (may be null if a team has no home matches recorded yet)
    const result = teams.map(t => ({
      id: t.id,
      name: t.name,
      logoUrl: t.logoUrl,
      league: t.homeMatches[0]?.league ?? null,
    }));

    res.json({ teams: result });
  } catch (error) {
    console.error('Error searching teams:', error);
    res.status(500).json({ error: 'Failed to search teams' });
  }
};

// GET /api/fanbase/team/:teamId
// Returns a single team with its total post count.
// Returns 404 if the team does not exist.
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    if (isNaN(teamId)) {
      return res.status(400).json({ error: 'teamId must be a number' });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        _count: { select: { posts: true } }, // total post count shown on team header
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
};

// GET /api/fanbase/team/:teamId/posts?type=&page=
// Returns paginated posts for a team, newest first.
// - type: optional PostType filter (GENERAL_TIP, SEAT_TIP, PUB_RECOMMENDATION, IM_GOING)
// - page: page number (default 1), page size is PAGE_SIZE
// - Always excludes reported posts so only clean content is shown
export const getTeamPosts = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    if (isNaN(teamId)) {
      return res.status(400).json({ error: 'teamId must be a number' });
    }

    const type = req.query.type as string | undefined;
    if (type && !VALID_POST_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${VALID_POST_TYPES.join(', ')}` });
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);

    // Build the where clause — always exclude reported posts to keep content clean
    const where = {
      teamId,
      reported: false,
      ...(type ? { postType: type as PostType } : {}),
    };

    // Run count and data fetch in parallel — faster than running them sequentially
    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    res.json({ posts, total });
  } catch (error) {
    console.error('Error fetching team posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};
