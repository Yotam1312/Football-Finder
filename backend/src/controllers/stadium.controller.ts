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
// Full stadium detail — implemented in Plan 02.
export const getStadiumById = async (req: Request, res: Response) => {
  // Implemented in Plan 02
  res.status(501).json({ error: 'Not implemented yet' });
};
