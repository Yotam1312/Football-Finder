/**
 * seed-test-matches.js
 *
 * Inserts fake upcoming (status=NS) matches into the DB for development/testing.
 * Uses real teams, leagues, and stadiums already in the DB so the search and
 * match detail pages render with real logos and names.
 *
 * Run with:  node prisma/seed-test-matches.js
 * Remove with: node prisma/seed-test-matches.js --clean
 *
 * apiFootballId values start at 9_000_000 to avoid colliding with real data.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fake upcoming fixtures — all dates are in the future (relative to March 2026)
// Each entry maps to real DB IDs found in the database.
//
// Stadium IDs and their cities:
//   1  = Old Trafford       (manchester)
//   3  = St. James' Park    (newcastle upon tyne)
//   4  = Emirates Stadium   (london)
//   5  = Goodison Park      (liverpool)
//   7  = London Stadium     (london)
//   9  = Stamford Bridge    (london)
//  11  = Anfield            (liverpool)      -- fetched dynamically below
//  21  = Etihad Stadium     (manchester)     -- fetched dynamically below
//
// Team IDs:
//   1=Man Utd  4=Liverpool  7=Arsenal  9=Everton  13=West Ham
//   14=Aston Villa  17=Chelsea  18=Man City  5=Newcastle  20=Tottenham

const FAKE_FIXTURES = [
  // London matches
  { apiId: 9_000_001, leagueId: 1, home: 7,  away: 20, stadiumId: 4,  date: '2026-03-22T15:00:00Z' }, // Arsenal vs Tottenham
  { apiId: 9_000_002, leagueId: 1, home: 17, away: 14, stadiumId: 9,  date: '2026-03-22T17:30:00Z' }, // Chelsea vs Aston Villa
  { apiId: 9_000_003, leagueId: 1, home: 13, away: 4,  stadiumId: 7,  date: '2026-03-29T15:00:00Z' }, // West Ham vs Liverpool
  { apiId: 9_000_004, leagueId: 1, home: 7,  away: 17, stadiumId: 4,  date: '2026-04-05T14:00:00Z' }, // Arsenal vs Chelsea
  { apiId: 9_000_005, leagueId: 1, home: 13, away: 1,  stadiumId: 7,  date: '2026-04-12T14:00:00Z' }, // West Ham vs Man Utd

  // Manchester matches
  { apiId: 9_000_006, leagueId: 1, home: 1,  away: 7,  stadiumId: 1,  date: '2026-03-21T15:00:00Z' }, // Man Utd vs Arsenal
  { apiId: 9_000_007, leagueId: 1, home: 1,  away: 4,  stadiumId: 1,  date: '2026-04-18T14:00:00Z' }, // Man Utd vs Liverpool
  { apiId: 9_000_008, leagueId: 1, home: 1,  away: 20, stadiumId: 1,  date: '2026-05-02T14:00:00Z' }, // Man Utd vs Tottenham

  // Liverpool matches
  { apiId: 9_000_009, leagueId: 1, home: 9,  away: 7,  stadiumId: 5,  date: '2026-03-28T15:00:00Z' }, // Everton vs Arsenal
  { apiId: 9_000_010, leagueId: 1, home: 9,  away: 17, stadiumId: 5,  date: '2026-04-11T14:00:00Z' }, // Everton vs Chelsea

  // Newcastle matches
  { apiId: 9_000_011, leagueId: 1, home: 5,  away: 1,  stadiumId: 3,  date: '2026-03-20T20:00:00Z' }, // Newcastle vs Man Utd
  { apiId: 9_000_012, leagueId: 1, home: 5,  away: 4,  stadiumId: 3,  date: '2026-04-04T14:00:00Z' }, // Newcastle vs Liverpool
];

async function getOrCreateEtihadStadium() {
  // Etihad may or may not be in the DB — create it if missing
  let stadium = await prisma.stadium.findFirst({
    where: { name: 'Etihad Stadium' },
  });
  if (!stadium) {
    stadium = await prisma.stadium.create({
      data: {
        name: 'Etihad Stadium',
        city: 'Manchester',
        cityNormalized: 'manchester',
        timezone: 'Europe/London',
      },
    });
    console.log('Created Etihad Stadium (id:', stadium.id, ')');
  }
  return stadium;
}

async function getOrCreateAnfield() {
  let stadium = await prisma.stadium.findFirst({
    where: { name: 'Anfield' },
  });
  if (!stadium) {
    stadium = await prisma.stadium.create({
      data: {
        name: 'Anfield',
        city: 'Liverpool',
        cityNormalized: 'liverpool',
        timezone: 'Europe/London',
      },
    });
    console.log('Created Anfield (id:', stadium.id, ')');
  }
  return stadium;
}

async function seed() {
  console.log('Seeding test upcoming matches...\n');

  // Ensure Etihad and Anfield exist so we can add Man City and Liverpool home games
  const etihad = await getOrCreateEtihadStadium();
  const anfield = await getOrCreateAnfield();

  // Extra Man City and Liverpool home fixtures using the stadiums above
  const extraFixtures = [
    { apiId: 9_000_013, leagueId: 1, home: 18, away: 7,  stadiumId: etihad.id, date: '2026-03-22T16:30:00Z' }, // Man City vs Arsenal
    { apiId: 9_000_014, leagueId: 1, home: 18, away: 4,  stadiumId: etihad.id, date: '2026-04-19T14:00:00Z' }, // Man City vs Liverpool
    { apiId: 9_000_015, leagueId: 1, home: 4,  away: 18, stadiumId: anfield.id, date: '2026-03-29T16:30:00Z' }, // Liverpool vs Man City
    { apiId: 9_000_016, leagueId: 1, home: 4,  away: 7,  stadiumId: anfield.id, date: '2026-04-25T14:00:00Z' }, // Liverpool vs Arsenal
  ];

  const allFixtures = [...FAKE_FIXTURES, ...extraFixtures];
  let created = 0;
  let skipped = 0;

  for (const f of allFixtures) {
    // Check if this fake fixture already exists (safe to re-run)
    const existing = await prisma.match.findUnique({
      where: { apiFootballId: f.apiId },
    });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.match.create({
      data: {
        apiFootballId: f.apiId,
        leagueId:      f.leagueId,
        homeTeamId:    f.home,
        awayTeamId:    f.away,
        stadiumId:     f.stadiumId,
        matchDate:     new Date(f.date),
        status:        'NS', // Not Started — required by the search endpoint
      },
    });
    created++;
  }

  console.log(`Done. Created: ${created}, Skipped (already existed): ${skipped}`);
  console.log('\nTest these cities:  london  manchester  liverpool  newcastle upon tyne');
  console.log('Date range example: from=2026-03-01&to=2026-06-01\n');
}

async function clean() {
  // Remove all fake fixtures (apiFootballId >= 9_000_000)
  const deleted = await prisma.match.deleteMany({
    where: { apiFootballId: { gte: 9_000_000 } },
  });
  console.log(`Cleaned up ${deleted.count} test matches.`);
}

const isClean = process.argv.includes('--clean');
(isClean ? clean() : seed())
  .catch(console.error)
  .finally(() => prisma.$disconnect());
