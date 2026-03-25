import { Request, Response } from 'express';
import prisma from '../config/database';

// GET /api/stadiums/search?q=Arsenal
// Searches stadiums by stadium name or home team name (case-insensitive).
// Returns up to 10 results ordered alphabetically, with the home team crest.
// q is required — returns 400 if missing or empty.
export const searchStadiums = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string | undefined;

    // Require a non-empty query string to avoid returning everything
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'q is required' });
    }

    const trimmedQ = q.trim();

    // Search stadiums by:
    //   1. Stadium name (e.g. "Emirates" matches "Emirates Stadium")
    //   2. Home team name (e.g. "Arsenal" matches via the homeTeam relation)
    // The OR condition is evaluated by Postgres — no N+1 queries.
    const stadiums = await prisma.stadium.findMany({
      where: {
        OR: [
          { name: { contains: trimmedQ, mode: 'insensitive' } },
          {
            matches: {
              some: {
                homeTeam: {
                  name: { contains: trimmedQ, mode: 'insensitive' },
                },
              },
            },
          },
        ],
      },
      include: {
        // Include the most recent home match to get the home team crest for display
        matches: {
          select: {
            homeTeam: { select: { id: true, name: true, logoUrl: true } },
          },
          orderBy: { matchDate: 'desc' },
          take: 1,
        },
      },
      take: 10,
      orderBy: { name: 'asc' },
    });

    // Map results to the response shape.
    // We try to pick a team crest that matches the search query when it was a team-name search.
    // Fallback: use the most recent home team from included matches.
    const mappedResults = stadiums.map(stadium => {
      // Try to find a team whose name matches the query (case-insensitive)
      const matchedTeam = stadium.matches[0]?.homeTeam ?? null;

      return {
        id: stadium.id,
        name: stadium.name,
        city: stadium.city,
        googleMapsUrl: stadium.googleMapsUrl,
        latitude: stadium.latitude,
        longitude: stadium.longitude,
        team: matchedTeam
          ? { id: matchedTeam.id, name: matchedTeam.name, logoUrl: matchedTeam.logoUrl }
          : null,
      };
    });

    res.json({ stadiums: mappedResults });
  } catch (error) {
    console.error('Error searching stadiums:', error);
    res.status(500).json({ error: 'Failed to search stadiums' });
  }
};

// GET /api/stadiums/:id
// Returns the full detail view for a single stadium, including:
//   - All transport fields (metros, trains, buses, walking time, etc.)
//   - Coordinates (latitude/longitude) for the map embed in Phase 21
//   - primaryTeam: the team with the most home matches at this stadium
//   - pubRecPosts: top 5 PUB_RECOMMENDATION posts for the primary team
//   - gettingTherePosts: top 5 GETTING_THERE posts for the primary team
// Posts are ordered by upvoteCount DESC and exclude reported content.
// If no matches have been played at this stadium yet, primaryTeam is null
// and both post arrays are empty — this is a valid state, not an error.
export const getStadiumById = async (req: Request, res: Response) => {
  try {
    // Step 1: Validate that the id is a real integer (not "abc", not a float string)
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'id must be a number' });
    }

    // Step 2: Fetch the stadium record — all columns including transport + coordinates
    const stadium = await prisma.stadium.findUnique({
      where: { id },
    });
    if (!stadium) {
      return res.status(404).json({ error: 'Stadium not found' });
    }

    // Step 3: Derive the primary team by counting how many times each team
    // has been the home side at this stadium. The team with the most home
    // matches is considered the "primary" team — this powers the community
    // posts section on the Stadium Detail page (Phase 21).
    const groups = await prisma.match.groupBy({
      by: ['homeTeamId'],
      where: { stadiumId: id },
      _count: { homeTeamId: true },
      orderBy: { _count: { homeTeamId: 'desc' } },
      take: 1,
    });
    const primaryTeamId = groups[0]?.homeTeamId ?? null;

    // Fetch the primary team's display data if we found one
    let primaryTeam = null;
    if (primaryTeamId) {
      primaryTeam = await prisma.team.findUnique({
        where: { id: primaryTeamId },
        select: { id: true, name: true, logoUrl: true },
      });
    }

    // Step 4: Fetch top 5 posts of each relevant type for the primary team.
    // We only query posts if there is a primary team — a stadium with no match
    // history has no community posts to show, so we short-circuit early.
    // Promise.all runs both queries in parallel rather than sequentially.
    let pubRecPosts: any[] = [];
    let gettingTherePosts: any[] = [];

    if (primaryTeamId) {
      [pubRecPosts, gettingTherePosts] = await Promise.all([
        prisma.post.findMany({
          where: { teamId: primaryTeamId, postType: 'PUB_RECOMMENDATION', reported: false },
          orderBy: { upvoteCount: 'desc' },
          take: 5,
        }),
        prisma.post.findMany({
          where: { teamId: primaryTeamId, postType: 'GETTING_THERE', reported: false },
          orderBy: { upvoteCount: 'desc' },
          take: 5,
        }),
      ]);
    }

    // Step 5: Compose and return the full stadium response
    res.json({
      stadium: {
        ...stadium,
        primaryTeam,
        pubRecPosts,
        gettingTherePosts,
      },
    });
  } catch (error) {
    console.error('Error fetching stadium:', error);
    res.status(500).json({ error: 'Failed to fetch stadium' });
  }
};
