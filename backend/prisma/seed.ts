/**
 * FanBase Seed Script
 *
 * Creates 5 fictional user accounts and 28+ realistic posts spread across
 * 7 major teams: Chelsea, Arsenal, Barcelona, Real Madrid, Bayern Munich,
 * PSG, Juventus — covering all 4 post types per team.
 *
 * Purpose: Avoids cold-start emptiness on launch day. First visitors
 * see an active community instead of blank pages.
 *
 * Idempotent: re-running this script is safe — it skips all inserts if
 * seed posts (identified by @seed.footballfinder.com emails) already exist.
 *
 * Run from backend/ directory:
 *   node -r ts-node/register prisma/seed.ts
 */

import { PrismaClient, PostType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting FanBase seed...');

  // ── Idempotency check ─────────────────────────────────────────────────────
  // If any posts with our seed domain already exist, skip everything.
  const existingPostCount = await prisma.post.count({
    where: { authorEmail: { endsWith: '@seed.footballfinder.com' } }
  });

  if (existingPostCount > 0) {
    console.log(`Seed posts already exist (${existingPostCount} found). Skipping.`);
    return;
  }

  // ── Seed users (5 fictional accounts) ────────────────────────────────────
  // All use @seed.footballfinder.com domain so they are easy to identify.
  // passwordHash is null — these are email-only accounts that don't log in.
  console.log('Creating seed users...');

  const user1 = await prisma.user.upsert({
    where: { email: 'travelfan88@seed.footballfinder.com' },
    update: {},
    create: {
      email: 'travelfan88@seed.footballfinder.com',
      name: 'TravelFan88',
      passwordHash: null
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'matchdaymike@seed.footballfinder.com' },
    update: {},
    create: {
      email: 'matchdaymike@seed.footballfinder.com',
      name: 'MatchdayMike',
      passwordHash: null
    }
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'stadiumsally@seed.footballfinder.com' },
    update: {},
    create: {
      email: 'stadiumsally@seed.footballfinder.com',
      name: 'StadiumSally',
      passwordHash: null
    }
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'euroaway23@seed.footballfinder.com' },
    update: {},
    create: {
      email: 'euroaway23@seed.footballfinder.com',
      name: 'EuroAway23',
      passwordHash: null
    }
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'footietraveller@seed.footballfinder.com' },
    update: {},
    create: {
      email: 'footietraveller@seed.footballfinder.com',
      name: 'FootieTraveller',
      passwordHash: null
    }
  });

  console.log('Seed users created/found.');

  // ── Team lookup ───────────────────────────────────────────────────────────
  // Use `contains` queries for resilience against exact name variations
  // from API-Football (e.g. "FC Barcelona" vs "Barcelona").
  console.log('Looking up teams...');

  const findTeam = async (label: string, searchTerm: string) => {
    const result = await prisma.team.findFirst({
      where: { name: { contains: searchTerm, mode: 'insensitive' } }
    });
    if (result) {
      console.log(`  Found ${label}: "${result.name}" (id: ${result.id})`);
    } else {
      console.warn(`  WARNING: ${label} not found (searched: contains "${searchTerm}")`);
    }
    return result;
  };

  const chelsea     = await findTeam('Chelsea',       'Chelsea');
  const arsenal     = await findTeam('Arsenal',       'Arsenal');
  const barcelona   = await findTeam('Barcelona',     'Barcelona');
  const realMadrid  = await findTeam('Real Madrid',   'Real Madrid');
  const bayern      = await findTeam('Bayern Munich', 'Bayern');
  const psg         = await findTeam('PSG',           'Saint Germain');
  const juventus    = await findTeam('Juventus',      'Juventus');

  // ── Post creation ─────────────────────────────────────────────────────────
  // We build a list of posts then createMany with skipDuplicates for safety.
  // Each post needs: teamId, userId, postType, title, body, authorName,
  // authorEmail, upvoteCount, and type-specific optional fields.

  let totalPostsCreated = 0;
  let teamsWithPosts = 0;

  // Helper: creates posts for a team, skips safely if team wasn't found
  const seedTeamPosts = async (
    teamName: string,
    team: { id: number } | null,
    posts: Prisma.PostCreateManyInput[]
  ) => {
    if (!team) {
      console.warn(`  Skipping posts for ${teamName} — team not in database.`);
      return;
    }
    const result = await prisma.post.createMany({
      data: posts,
      skipDuplicates: true
    });
    console.log(`  Created ${result.count} posts for ${teamName}`);
    totalPostsCreated += result.count;
    teamsWithPosts++;
  };

  // ── CHELSEA ───────────────────────────────────────────────────────────────
  await seedTeamPosts('Chelsea', chelsea, [
    {
      teamId: chelsea?.id ?? 0,
      userId: user1.id,
      postType: PostType.SEAT_TIP,
      title: 'Matthew Harding Stand, Row F — best atmosphere',
      body: "Sat in Matthew Harding Upper, row F, seat 22. Standing atmosphere even when everyone's seated. Sight lines are perfect — you can see both corners clearly. Get there 30 mins early as Fulham Road entry gets very packed on derby days.",
      authorName: 'TravelFan88',
      authorEmail: 'travelfan88@seed.footballfinder.com',
      seatSection: 'Matthew Harding Upper',
      seatRow: 'F',
      seatNumber: '22',
      seatRating: 5,
      upvoteCount: 12
    },
    {
      teamId: chelsea?.id ?? 0,
      userId: user2.id,
      postType: PostType.PUB_RECOMMENDATION,
      title: "The Butcher's Hook on Fulham Road",
      body: "Classic pre-match spot. 5 minute walk from the ground. Gets busy 2 hours before kick-off so arrive early. Good selection of ales, friendly staff who are used to away fans too.",
      authorName: 'MatchdayMike',
      authorEmail: 'matchdaymike@seed.footballfinder.com',
      pubName: "The Butcher's Hook",
      pubAddress: 'Fulham Road, London SW6',
      pubDistance: '5 min walk',
      upvoteCount: 8
    },
    {
      teamId: chelsea?.id ?? 0,
      userId: user3.id,
      postType: PostType.GENERAL_TIP,
      title: 'Underground: Fulham Broadway is packed after full time',
      body: 'District Line from Fulham Broadway gets absolutely packed after the final whistle. Walk 10-15 mins to Parsons Green instead — much less crowded and you\'ll get a seat on the train back.',
      authorName: 'StadiumSally',
      authorEmail: 'stadiumsally@seed.footballfinder.com',
      upvoteCount: 15
    },
    {
      teamId: chelsea?.id ?? 0,
      userId: user4.id,
      postType: PostType.IM_GOING,
      title: 'First visit to Stamford Bridge',
      body: "Travelling from Amsterdam for the Champions League group stage. Anyone got tips for the North Stand away section? Is it covered?",
      authorName: 'EuroAway23',
      authorEmail: 'euroaway23@seed.footballfinder.com',
      matchId: null,
      upvoteCount: 3
    }
  ]);

  // ── ARSENAL ───────────────────────────────────────────────────────────────
  await seedTeamPosts('Arsenal', arsenal, [
    {
      teamId: arsenal?.id ?? 0,
      userId: user2.id,
      postType: PostType.SEAT_TIP,
      title: 'Clock End Upper — worth the extra cost',
      body: 'Block 108, row 12, seat 5. Clear view of the entire pitch with no obstructions. The lower tier gets more atmosphere but the sightlines up here are genuinely perfect. Book early — these go fast.',
      authorName: 'MatchdayMike',
      authorEmail: 'matchdaymike@seed.footballfinder.com',
      seatSection: 'Clock End Upper',
      seatRow: '12',
      seatNumber: '5',
      seatRating: 4,
      upvoteCount: 9
    },
    {
      teamId: arsenal?.id ?? 0,
      userId: user1.id,
      postType: PostType.PUB_RECOMMENDATION,
      title: 'The Gunners on Blackstock Road',
      body: "Best pre-match pub by far. About 10 mins walk from the ground through the side streets. Packed 2 hours before kick-off — arrive early or you won't get in. Does a good pie. Home and away fans welcome.",
      authorName: 'TravelFan88',
      authorEmail: 'travelfan88@seed.footballfinder.com',
      pubName: 'The Gunners',
      pubAddress: 'Blackstock Road, London N4',
      pubDistance: '10 min walk',
      upvoteCount: 11
    },
    {
      teamId: arsenal?.id ?? 0,
      userId: user5.id,
      postType: PostType.GENERAL_TIP,
      title: 'Tube tip: avoid Holloway Road station after the game',
      body: 'Holloway Road station (Piccadilly Line) gets overwhelmed after full time. Better to walk 15 mins to Finsbury Park and take the Victoria or Piccadilly lines from there — much faster in total.',
      authorName: 'FootieTraveller',
      authorEmail: 'footietraveller@seed.footballfinder.com',
      upvoteCount: 19
    },
    {
      teamId: arsenal?.id ?? 0,
      userId: user4.id,
      postType: PostType.IM_GOING,
      title: 'Away end experience?',
      body: "Coming to the NLD next month, in the visiting section. Anyone been to the away end recently? I've heard the view from the Clock End corner isn't ideal.",
      authorName: 'EuroAway23',
      authorEmail: 'euroaway23@seed.footballfinder.com',
      matchId: null,
      upvoteCount: 5
    }
  ]);

  // ── BARCELONA ─────────────────────────────────────────────────────────────
  await seedTeamPosts('Barcelona', barcelona, [
    {
      teamId: barcelona?.id ?? 0,
      userId: user4.id,
      postType: PostType.SEAT_TIP,
      title: 'Gol Nord upper tier — electric atmosphere',
      body: 'Section 309, row 8. The Gol Nord (North Goal end) is where the ultras are. Even in the upper tier you feel the energy. Bring earplugs if you\'re sensitive to noise — the drums are relentless. Absolutely worth it.',
      authorName: 'EuroAway23',
      authorEmail: 'euroaway23@seed.footballfinder.com',
      seatSection: 'Gol Nord',
      seatRow: '8',
      seatNumber: 'multiple',
      seatRating: 5,
      upvoteCount: 14
    },
    {
      teamId: barcelona?.id ?? 0,
      userId: user3.id,
      postType: PostType.PUB_RECOMMENDATION,
      title: 'Bar Canigó in Gràcia — local favourite',
      body: 'Skip the tourist bars near the stadium. Take the Metro to Gràcia and drink at Bar Canigó on Plaça de la Vila de Gràcia. Legendary Catalan bar, cheap local beers, real football fans. About 20 mins on Metro from stadium.',
      authorName: 'StadiumSally',
      authorEmail: 'stadiumsally@seed.footballfinder.com',
      pubName: 'Bar Canigó',
      pubAddress: 'Plaça de la Vila de Gràcia, Barcelona',
      pubDistance: '20 min by Metro',
      upvoteCount: 7
    },
    {
      teamId: barcelona?.id ?? 0,
      userId: user2.id,
      postType: PostType.GENERAL_TIP,
      title: 'Pre-purchase food tokens — queues are brutal',
      body: "Inside the stadium, buy your food and drink tokens at the kiosks furthest from the main entrances — the central ones have massive queues. Or bring your own snacks in — they're relaxed about outside food.",
      authorName: 'MatchdayMike',
      authorEmail: 'matchdaymike@seed.footballfinder.com',
      upvoteCount: 10
    },
    {
      teamId: barcelona?.id ?? 0,
      userId: user1.id,
      postType: PostType.IM_GOING,
      title: 'El Clásico bucket list trip',
      body: 'Finally making it to the Clásico in March. Travelling from London. If anyone else is making the trip and wants to grab a beer beforehand, drop a reply.',
      authorName: 'TravelFan88',
      authorEmail: 'travelfan88@seed.footballfinder.com',
      matchId: null,
      upvoteCount: 6
    }
  ]);

  // ── REAL MADRID ───────────────────────────────────────────────────────────
  await seedTeamPosts('Real Madrid', realMadrid, [
    {
      teamId: realMadrid?.id ?? 0,
      userId: user5.id,
      postType: PostType.SEAT_TIP,
      title: 'Fondos Norte — the atmosphere end',
      body: 'Block 121 in the Fondo Norte is where the hardcore ultras sit. The Bernabéu is a beautiful stadium but can be quiet in Fondo Sur — Norte has the energy. Sit as low as possible in that section for best atmosphere.',
      authorName: 'FootieTraveller',
      authorEmail: 'footietraveller@seed.footballfinder.com',
      seatSection: 'Fondo Norte',
      seatRow: '5',
      seatNumber: '14',
      seatRating: 4,
      upvoteCount: 11
    },
    {
      teamId: realMadrid?.id ?? 0,
      userId: user4.id,
      postType: PostType.PUB_RECOMMENDATION,
      title: 'Cervecería Alemana — classic Madrid pre-match',
      body: "On Plaza de Santa Ana, about 20 mins Metro from the ground. One of Hemingway's old haunts. Get there at least 3 hours before kick-off to get a table. Order the house beer and montaditos. Worth the journey.",
      authorName: 'EuroAway23',
      authorEmail: 'euroaway23@seed.footballfinder.com',
      pubName: 'Cervecería Alemana',
      pubAddress: 'Plaza de Santa Ana, Madrid',
      pubDistance: '20 min by Metro',
      upvoteCount: 9
    },
    {
      teamId: realMadrid?.id ?? 0,
      userId: user1.id,
      postType: PostType.GENERAL_TIP,
      title: 'The Bernabéu renovation — new roof is stunning',
      body: "They've finished the renovation and the retractable roof is genuinely incredible. Acoustics are much better now. The upper tiers feel less vertiginous than before too — wider steps.",
      authorName: 'TravelFan88',
      authorEmail: 'travelfan88@seed.footballfinder.com',
      upvoteCount: 13
    },
    {
      teamId: realMadrid?.id ?? 0,
      userId: user3.id,
      postType: PostType.IM_GOING,
      title: 'Champions League final leg — who else is coming?',
      body: "Got tickets to the second leg of the last-16 tie. Flying in from Dublin. Anyone know if there's an Irish supporters meetup happening in Madrid before the game?",
      authorName: 'StadiumSally',
      authorEmail: 'stadiumsally@seed.footballfinder.com',
      matchId: null,
      upvoteCount: 4
    }
  ]);

  // ── BAYERN MUNICH ─────────────────────────────────────────────────────────
  await seedTeamPosts('Bayern Munich', bayern, [
    {
      teamId: bayern?.id ?? 0,
      userId: user3.id,
      postType: PostType.SEAT_TIP,
      title: 'Block 114, Südkurve — loudest section',
      body: 'Row 20 in the Südkurve (south end). This is where the Bayern fan club ultras are. Constant singing, flares at big games, absolutely electric. Not for anyone who wants a quiet matchday. The best football atmosphere I\'ve ever been in.',
      authorName: 'StadiumSally',
      authorEmail: 'stadiumsally@seed.footballfinder.com',
      seatSection: 'Südkurve',
      seatRow: '20',
      seatNumber: '8',
      seatRating: 5,
      upvoteCount: 17
    },
    {
      teamId: bayern?.id ?? 0,
      userId: user5.id,
      postType: PostType.PUB_RECOMMENDATION,
      title: 'Augustiner Bräustuben — best pre-match beer in Munich',
      body: 'Augustiner Bräustuben on Landsberger Strasse — about 15 mins walk from the U6 line that goes to the Allianz. Traditional Munich beer hall, Augustiner from the wooden barrel (not kegs). Massive portions of pork knuckle too. Get there 2 hours early.',
      authorName: 'FootieTraveller',
      authorEmail: 'footietraveller@seed.footballfinder.com',
      pubName: 'Augustiner Bräustuben',
      pubAddress: 'Landsberger Str. 19, Munich',
      pubDistance: '15 min walk + U6',
      upvoteCount: 16
    },
    {
      teamId: bayern?.id ?? 0,
      userId: user2.id,
      postType: PostType.GENERAL_TIP,
      title: 'U6 from Marienplatz — do NOT take a taxi',
      body: 'The U6 underground line runs directly to Fröttmaning station, right next to the stadium. Runs until late after the game. Takes 25 mins from Marienplatz city centre. Taxis are a nightmare on match days — overpriced and stuck in traffic.',
      authorName: 'MatchdayMike',
      authorEmail: 'matchdaymike@seed.footballfinder.com',
      upvoteCount: 21
    },
    {
      teamId: bayern?.id ?? 0,
      userId: user1.id,
      postType: PostType.IM_GOING,
      title: 'First Bundesliga game — tips needed',
      body: "Coming from the UK for my first Bundesliga match. What should I know about German match-day culture vs the Premier League? Is it true you can bring beer to your seat?",
      authorName: 'TravelFan88',
      authorEmail: 'travelfan88@seed.footballfinder.com',
      matchId: null,
      upvoteCount: 8
    }
  ]);

  // ── PSG ───────────────────────────────────────────────────────────────────
  await seedTeamPosts('PSG', psg, [
    {
      teamId: psg?.id ?? 0,
      userId: user4.id,
      postType: PostType.SEAT_TIP,
      title: 'Virage Auteuil — the real PSG atmosphere',
      body: 'Block K4 in the Virage Auteuil (south stand). This is the ultras section, the Collectif Ultras Paris. Banners, drums, non-stop chanting. Standing the whole game even in seated tickets. World class atmosphere. Not for families with kids.',
      authorName: 'EuroAway23',
      authorEmail: 'euroaway23@seed.footballfinder.com',
      seatSection: 'Virage Auteuil',
      seatRow: 'K',
      seatNumber: '4',
      seatRating: 5,
      upvoteCount: 13
    },
    {
      teamId: psg?.id ?? 0,
      userId: user1.id,
      postType: PostType.PUB_RECOMMENDATION,
      title: 'La Brasserie du Parc near the stadium',
      body: 'Right on Boulevard Murat, 3 mins walk from the stadium. Pre-match atmosphere is decent. Gets busy 90 mins before kick-off. Standard French brasserie food — steak frites and a demi. Nothing fancy but convenient.',
      authorName: 'TravelFan88',
      authorEmail: 'travelfan88@seed.footballfinder.com',
      pubName: 'La Brasserie du Parc',
      pubAddress: 'Boulevard Murat, Paris 16e',
      pubDistance: '3 min walk',
      upvoteCount: 6
    },
    {
      teamId: psg?.id ?? 0,
      userId: user3.id,
      postType: PostType.GENERAL_TIP,
      title: 'Metro Line 9 — avoid at full time for 20 mins',
      body: 'Metro Line 9 from Exelmans stops directly at the stadium. After the game, wait 20 minutes before heading to the Metro — the crush at Exelmans at full time is intense. Walk to the next stop (Michel-Ange Molitor) instead.',
      authorName: 'StadiumSally',
      authorEmail: 'stadiumsally@seed.footballfinder.com',
      upvoteCount: 9
    },
    {
      teamId: psg?.id ?? 0,
      userId: user5.id,
      postType: PostType.IM_GOING,
      title: 'Paris trip — combining Louvre and PSG',
      body: "Taking 4 days in Paris with my partner. PSG match on the Saturday evening, Louvre on Sunday. Anyone been to both in one trip? Worth getting the Virage Auteuil for atmosphere or is there a better neutral section?",
      authorName: 'FootieTraveller',
      authorEmail: 'footietraveller@seed.footballfinder.com',
      matchId: null,
      upvoteCount: 5
    }
  ]);

  // ── JUVENTUS ──────────────────────────────────────────────────────────────
  await seedTeamPosts('Juventus', juventus, [
    {
      teamId: juventus?.id ?? 0,
      userId: user2.id,
      postType: PostType.SEAT_TIP,
      title: 'Curva Sud — Juve ultras section',
      body: 'Block 40 in the Curva Sud. The Juventus ultras (Drughi and others) are here. Giant tifo displays, coordinated chanting, passionate support. The rest of the Allianz Stadium can be quiet so this end is essential for atmosphere. Booking early is a must.',
      authorName: 'MatchdayMike',
      authorEmail: 'matchdaymike@seed.footballfinder.com',
      seatSection: 'Curva Sud',
      seatRow: '8',
      seatNumber: '40',
      seatRating: 4,
      upvoteCount: 10
    },
    {
      teamId: juventus?.id ?? 0,
      userId: user3.id,
      postType: PostType.PUB_RECOMMENDATION,
      title: 'Il Punto Verde near Juventus station',
      body: "Small bar on Via Druento, 5 mins walk from the Juventus stop on the tram. Classic Italian sports bar — espresso and tramezzini before the game, grappa after. Genuinely local crowd, no tourist prices. Staff are massive Juve fans.",
      authorName: 'StadiumSally',
      authorEmail: 'stadiumsally@seed.footballfinder.com',
      pubName: 'Il Punto Verde',
      pubAddress: 'Via Druento, Turin',
      pubDistance: '5 min walk',
      upvoteCount: 7
    },
    {
      teamId: juventus?.id ?? 0,
      userId: user4.id,
      postType: PostType.GENERAL_TIP,
      title: 'Tram from Porta Susa — cheapest and most reliable',
      body: 'The tram (line 10) from Porta Susa train station goes directly to the stadium in about 20 mins. Way cheaper than a taxi. After the game the tram is packed but it runs frequently. Buy a ticket at the station before you board.',
      authorName: 'EuroAway23',
      authorEmail: 'euroaway23@seed.footballfinder.com',
      upvoteCount: 12
    },
    {
      teamId: juventus?.id ?? 0,
      userId: user5.id,
      postType: PostType.IM_GOING,
      title: 'Turin weekend trip — stadium + food',
      body: 'Doing a long weekend in Turin for the Derby della Mole (Juve vs Torino). Any recommendations for the best gelato and coffee spots near the centre? Planning to eat as well as possible between the match.',
      authorName: 'FootieTraveller',
      authorEmail: 'footietraveller@seed.footballfinder.com',
      matchId: null,
      upvoteCount: 6
    }
  ]);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\nSeed complete: created ${totalPostsCreated} posts across ${teamsWithPosts} teams.`);
}

main()
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
