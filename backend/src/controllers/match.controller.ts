import { Request, Response } from 'express';
import prisma from '../config/database';
import { normalizeCity } from '../utils/normalizeCity';

// GET /api/matches/search?city=london&from=2026-04-01&to=2026-04-30
// Returns all upcoming (status=NS) matches in the given city and date range.
// Results are sorted by date ascending (earliest match first).
export const searchMatches = async (req: Request, res: Response) => {
  try {
    const { city, from, to } = req.query as { city?: string; from?: string; to?: string };

    // All three parameters are required
    if (!city || !from || !to) {
      return res.status(400).json({ error: 'city, from, and to are required' });
    }

    // Normalize city input the same way the sync job normalizes stored values
    const cityNorm = normalizeCity(city);

    const fromDate = new Date(from);
    const toDate   = new Date(to);

    // Set end-of-day on the to date so matches on the final day are included.
    // Without this, a 20:00 UTC match on the last day would be excluded because
    // new Date('2026-04-30') defaults to midnight (00:00:00 UTC).
    toDate.setHours(23, 59, 59, 999);

    const matches = await prisma.match.findMany({
      where: {
        stadium: { cityNormalized: cityNorm },
        matchDate: { gte: fromDate, lte: toDate },
        status: 'NS', // only upcoming matches
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league:   true,
        stadium:  true,
      },
      orderBy: { matchDate: 'asc' },
    });

    res.json({ matches, total: matches.length });
  } catch (error) {
    console.error('Error searching matches:', error);
    res.status(500).json({ error: 'Failed to search matches' });
  }
};

// GET /api/matches/:id
// Returns full match details including team standings for the stats section.
export const getMatchById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Validate that the id is a number
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Match id must be a number' });
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        league:   true,
        stadium:  true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Fetch current season standings for both teams in this league.
    // We use a separate query here to keep the main match query simple.
    // getCurrentSeason is not exported from sync.service.ts, so we inline the logic.
    const season = Math.min(new Date().getFullYear() - 1, 2024); // same cap as sync job

    const [homeTeamStanding, awayTeamStanding] = await Promise.all([
      prisma.teamStanding.findUnique({
        where: {
          teamId_leagueId_season: {
            teamId:   match.homeTeamId,
            leagueId: match.leagueId,
            season,
          },
        },
      }),
      prisma.teamStanding.findUnique({
        where: {
          teamId_leagueId_season: {
            teamId:   match.awayTeamId,
            leagueId: match.leagueId,
            season,
          },
        },
      }),
    ]);

    // Return match with standings attached
    // homeTeamStanding and awayTeamStanding may be null (new teams, recently promoted, etc.)
    res.json({ ...match, homeTeamStanding, awayTeamStanding });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
};
