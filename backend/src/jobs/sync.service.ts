import axios from 'axios';
import prisma from '../config/database';

// The 10 European leagues we track — top 2 per country
// IMPORTANT: These IDs were sourced from API-Football documentation.
// Confirm the second-tier IDs (Championship, Segunda, etc.) are correct
// by calling GET /leagues?country=England (etc.) once you have your key.
const TRACKED_LEAGUES = [
  // England
  { id: 39,  name: 'Premier League',  country: 'England',  timezone: 'Europe/London' },
  { id: 40,  name: 'Championship',    country: 'England',  timezone: 'Europe/London' },
  // Spain
  { id: 140, name: 'La Liga',         country: 'Spain',    timezone: 'Europe/Madrid' },
  { id: 141, name: 'Segunda',         country: 'Spain',    timezone: 'Europe/Madrid' },
  // Germany
  { id: 78,  name: 'Bundesliga',      country: 'Germany',  timezone: 'Europe/Berlin' },
  { id: 79,  name: '2. Bundesliga',   country: 'Germany',  timezone: 'Europe/Berlin' },
  // Italy
  { id: 135, name: 'Serie A',         country: 'Italy',    timezone: 'Europe/Rome' },
  { id: 136, name: 'Serie B',         country: 'Italy',    timezone: 'Europe/Rome' },
  // France
  { id: 61,  name: 'Ligue 1',         country: 'France',   timezone: 'Europe/Paris' },
  { id: 62,  name: 'Ligue 2',         country: 'France',   timezone: 'Europe/Paris' },
];

// Season arithmetic — API-Football uses the year the season started.
// Seasons that start mid-year (e.g. August 2025) are referred to as "2025".
// So in March 2026 we are in the 2025/26 season → season = 2025.
//
// NOTE: The free API-Football plan only grants access to seasons 2022–2024.
// Until a paid plan is active, this function caps at 2024. Remove the cap
// once you upgrade to a paid plan and the 2025 season becomes accessible.
function getCurrentSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() is 0-indexed

  // If it's June or later, the current season started this year
  // If it's before June, the current season started last year
  const season = month >= 6 ? year : year - 1;

  // Free plan cap — remove this line when upgrading to a paid API plan
  return Math.min(season, 2024);
}

// Remove diacritics (accented characters) from city names so they can be searched
// by users who type plain ASCII — e.g. "Munchen" matches "München"
function normalizeCity(city: string): string {
  return city
    .normalize('NFD')                   // decompose accented chars into base + accent
    .replace(/[\u0300-\u036f]/g, '')    // remove the accent characters
    .toLowerCase()
    .trim();
}

// Fetch fixtures for a single league from API-Football
// Returns the raw response array or throws on network/API error
//
// NOTE: When on a paid plan with current season access, restore the date filter
// (from: today, to: today + 3 months) to limit API response size.
// With the free plan and season 2024, we fetch all season fixtures (no date filter)
// since the 2024/25 season is fully in the past and date filtering would return nothing.
async function fetchLeagueFixtures(leagueId: number, season: number): Promise<any[]> {
  const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
    headers: {
      'x-apisports-key': process.env.API_FOOTBALL_KEY!,
    },
    params: {
      league: leagueId,
      season: season,
    },
  });

  // API returns errors inside the response body, not as HTTP error codes
  if (response.data.errors && Object.keys(response.data.errors).length > 0) {
    throw new Error(`API-Football error: ${JSON.stringify(response.data.errors)}`);
  }

  return response.data.response || [];
}

// Upsert a single fixture into the database.
// "Upsert" = insert if new, update if already exists (matched by apiFootballId).
// This means running the sync again safely re-applies without duplicating data.
async function upsertFixture(fixture: any, leagueRecord: any, countryTimezone: string): Promise<void> {
  // Defensively handle null venue data — API-Football sometimes omits venue info
  const venueName = fixture.fixture.venue?.name ?? 'Unknown Venue';
  const venueCity = fixture.fixture.venue?.city ?? 'Unknown City';

  // Upsert the League record
  const league = await prisma.league.upsert({
    where: { apiFootballId: fixture.league.id },
    update: {
      name: fixture.league.name,
      logoUrl: fixture.league.logo ?? null,
    },
    create: {
      apiFootballId: fixture.league.id,
      name: fixture.league.name,
      country: fixture.league.country,
      logoUrl: fixture.league.logo ?? null,
    },
  });

  // Upsert the home team
  const homeTeam = await prisma.team.upsert({
    where: { apiFootballId: fixture.teams.home.id },
    update: {
      name: fixture.teams.home.name,
      logoUrl: fixture.teams.home.logo ?? null,
    },
    create: {
      apiFootballId: fixture.teams.home.id,
      name: fixture.teams.home.name,
      logoUrl: fixture.teams.home.logo ?? null,
    },
  });

  // Upsert the away team
  const awayTeam = await prisma.team.upsert({
    where: { apiFootballId: fixture.teams.away.id },
    update: {
      name: fixture.teams.away.name,
      logoUrl: fixture.teams.away.logo ?? null,
    },
    create: {
      apiFootballId: fixture.teams.away.id,
      name: fixture.teams.away.name,
      logoUrl: fixture.teams.away.logo ?? null,
    },
  });

  // Upsert the Stadium — keyed by name + city combination
  // Note: We can't upsert by a unique key here since Stadium has no apiFootballId.
  // We use findFirst + create/update pattern instead.
  let stadium = await prisma.stadium.findFirst({
    where: { name: venueName, city: venueCity },
  });

  if (!stadium) {
    stadium = await prisma.stadium.create({
      data: {
        name: venueName,
        city: venueCity,
        cityNormalized: normalizeCity(venueCity),
        // Use the country-level timezone — per-venue IANA strings require a
        // separate geocoding step (Phase 2 enhancement). Country-level is
        // accurate for all 10 leagues we track (single timezone per country).
        timezone: countryTimezone,
      },
    });
  }

  // Upsert the Match — this is the main record
  // matchDate comes from API as ISO 8601 UTC string — new Date() parses it as UTC
  await prisma.match.upsert({
    where: { apiFootballId: fixture.fixture.id },
    update: {
      matchDate: new Date(fixture.fixture.date),
      status: fixture.fixture.status.short,
      stadiumId: stadium.id,
    },
    create: {
      apiFootballId: fixture.fixture.id,
      leagueId: league.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      stadiumId: stadium.id,
      matchDate: new Date(fixture.fixture.date),
      status: fixture.fixture.status.short,
    },
  });
}

// Fetches league standings from API-Football and upserts into TeamStanding.
// Called once per league per night — 10 leagues = 10 API calls.
// Uses the same season cap as fixture sync (2024 on free plan).
// Each standing entry is upserted by the unique key [teamId, leagueId, season].
async function syncStandings(): Promise<void> {
  const season = getCurrentSeason(); // already capped at 2024 for free plan

  for (const league of TRACKED_LEAGUES) {
    try {
      // Fetch standings from API-Football
      const response = await axios.get('https://v3.football.api-sports.io/standings', {
        params: { league: league.id, season },
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY!,
        },
      });

      // Navigate the nested response structure:
      // response.data.response[0].league.standings[0] is the main standings group
      const leagueStandings = response.data?.response?.[0]?.league?.standings?.[0];
      if (!leagueStandings || !Array.isArray(leagueStandings)) {
        console.log(`[Sync] No standings data for league ${league.name} (ID: ${league.id}) season ${season}`);
        continue;
      }

      // Look up our internal League record by its API-Football ID
      const leagueRecord = await prisma.league.findUnique({
        where: { apiFootballId: league.id },
      });
      if (!leagueRecord) {
        console.log(`[Sync] League ${league.name} not found in DB — skipping standings`);
        continue;
      }

      // Upsert each team's standing row
      for (const standing of leagueStandings) {
        // Look up our internal Team record using the API-Football team id
        const team = await prisma.team.findUnique({
          where: { apiFootballId: standing.team.id },
        });
        if (!team) continue; // team not tracked in our DB — skip

        await prisma.teamStanding.upsert({
          where: {
            teamId_leagueId_season: {
              teamId: team.id,
              leagueId: leagueRecord.id,
              season,
            },
          },
          update: {
            position:     standing.rank,
            played:       standing.all.played,
            wins:         standing.all.win,
            draws:        standing.all.draw,
            losses:       standing.all.lose,
            goalsFor:     standing.all.goals.for,
            goalsAgainst: standing.all.goals.against,
            points:       standing.points,
          },
          create: {
            teamId:       team.id,
            leagueId:     leagueRecord.id,
            season,
            position:     standing.rank,
            played:       standing.all.played,
            wins:         standing.all.win,
            draws:        standing.all.draw,
            losses:       standing.all.lose,
            goalsFor:     standing.all.goals.for,
            goalsAgainst: standing.all.goals.against,
            points:       standing.points,
          },
        });
      }

      console.log(`[Sync] Standings synced for ${league.name} (ID: ${league.id}) season ${season}`);
    } catch (error) {
      // Log failure and continue to the next league — same pattern as fixture sync.
      // Old standings stay in DB; this league will retry on the next nightly run.
      console.error(`[Sync] Failed to sync standings for ${league.name}:`, error);
    }
  }
}

// Main sync function — called by the cron job and the admin trigger endpoint
// Fetches all 10 leagues sequentially to avoid rate limiting
export async function runFixtureSync(): Promise<void> {
  console.log(`[Sync] Starting fixture sync at ${new Date().toISOString()}`);

  const season = getCurrentSeason();
  console.log(`[Sync] Syncing season ${season}`);

  let totalFixtures = 0;
  let failedLeagues = 0;

  for (const league of TRACKED_LEAGUES) {
    try {
      console.log(`[Sync] Fetching ${league.name} (ID: ${league.id})...`);
      const fixtures = await fetchLeagueFixtures(league.id, season);

      // Process fixtures one at a time — keeps memory usage low
      for (const fixture of fixtures) {
        await upsertFixture(fixture, league, league.timezone);
      }

      totalFixtures += fixtures.length;
      console.log(`[Sync] ${league.name}: ${fixtures.length} fixtures upserted`);

    } catch (error) {
      // On failure, log and continue to the next league
      // Decision: no retry, no alert — old data stays in DB
      failedLeagues++;
      console.error(`[Sync] Failed to sync ${league.name}:`, error);
    }
  }

  console.log(`[Sync] Completed. Total fixtures: ${totalFixtures}. Failed leagues: ${failedLeagues}/10`);

  // Sync standings after fixtures — one API call per league (10 calls total)
  // Standings data is used on the match detail page to show team form (Plan 06)
  console.log('[Sync] Starting standings sync...');
  await syncStandings();
  console.log('[Sync] Standings sync complete');
}
