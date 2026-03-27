/**
 * Stadium Transport Guide Seed Script (Phase 21)
 *
 * Populates the new transport guide fields for 3 well-known stadiums:
 *   - Emirates Stadium (Arsenal, London)
 *   - Camp Nou / Estadi Olímpic (Barcelona)
 *   - Allianz Arena (Bayern Munich)
 *
 * This is mockup data — realistic enough to demonstrate the UI, to be
 * replaced with accurate data before launch.
 *
 * Idempotent: safe to re-run. Matches by partial name so it works
 * regardless of exact stadium name in the DB.
 *
 * Run from backend/ directory:
 *   node -r ts-node/register prisma/seed-stadium-transport.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Each entry targets one stadium. `nameContains` is matched case-insensitively.
const stadiumData = [
  {
    nameContains: 'Emirates',
    data: {
      fromAirportInfo:
        'From Heathrow: Take the Piccadilly Line to King\'s Cross (~45 min), then the Northern Line to Highbury & Islington (5 min). Cost: £5.60–£6.80 with Oyster/contactless. From Gatwick: Thameslink to St Pancras (~30 min), then 10 min on the Victoria line. Taxi from Heathrow ~£60–80 (45–90 min depending on traffic).',
      travelTimesInfo:
        'City Centre (Holborn): ~20 min by tube. King\'s Cross St Pancras: ~15 min. Victoria: ~25 min. Wembley: ~40 min.',
      paymentInfo:
        'Contactless bank cards and Apple/Google Pay work at all tube gates and bus readers — no need for an Oyster card. Cash is not accepted on buses or at tube gates.',
      proTips: [
        'Avoid the Victoria line on matchday — take the Piccadilly or Northern line instead, they run direct to Highbury & Islington.',
        'Arrive at least 45 min early to avoid turnstile queues, especially for Premier League fixtures.',
        'After the final whistle, walk 10 min to Highbury & Islington before hailing a taxi or rideshare — pricing surges near the ground.',
        'Bus routes 4 and 153 stop outside the stadium but fill up instantly after full time. Consider waiting 20–30 min for queues to clear.',
      ],
      recommendedApps: ['Citymapper', 'TfL Go', 'Google Maps', 'Uber'],
      budgetCheap: '£4–6 — Tube with Oyster/contactless from central London',
      budgetStandard: '£12–20 — Taxi or Uber from nearby zones (split with friends)',
      budgetComfort: '£45–70 — Pre-booked private hire from Zone 1 or Heathrow',
      airportTransport: {
        metro: { steps: ['Piccadilly Line to King\'s Cross (~45 min)', 'Northern Line to Highbury & Islington (5 min)'], time: '50 min', cost: '£5.60-£6.80' },
        taxi: { time: '45-90 min', cost: '£60-80' },
        rideshare: { time: '45-90 min', cost: '£40-60', surgeWarning: 'Prices surge 2-3x after matches near the ground' },
      },
      travelTimes: { metro: '20 min', bus: '30 min', taxi: '15 min', walking: '35 min' },
      budgetBreakdown: {
        budget: { how: 'Tube with Oyster/contactless', cost: '£4-6' },
        standard: { how: 'Uber from nearby zones', cost: '£12-20' },
        comfort: { how: 'Pre-booked private hire from Zone 1', cost: '£45-70' },
      },
      paymentDetails: {
        acceptedCards: ['Contactless', 'Apple Pay', 'Google Pay', 'Oyster'],
        recommendedTravelCard: 'Oyster card or contactless bank card',
        tips: 'Cash is not accepted on buses or at tube gates.',
      },
    },
  },
  {
    // Covers "Camp Nou", "Estadi Olímpic Lluís Companys", or any Barcelona stadium
    nameContains: 'Estadi Ol',
    data: {
      fromAirportInfo:
        'From Barcelona-El Prat (BCN): Take the Aerobus to Plaça de Catalunya (€6.75, ~35 min), then Metro L3 (green) to Palau Reial (~15 min). Alternatively take the Renfe train to Barcelona Sants, then Metro L3 (10 min). Taxi from airport €25–35 (30 min without traffic, up to 60 min on matchday).',
      travelTimesInfo:
        'City Centre (Les Ramblas): ~20 min by metro. Sagrada Família: ~25 min. Port Olímpic: ~30 min. Gràcia neighbourhood: ~15 min.',
      paymentInfo:
        'Buy a T-Casual 10-trip card (€11.35) on arrival — it covers metro, bus, and FGC and saves money vs single fares (€2.40 each). Contactless payment is accepted at metro ticket machines. Cash also accepted at station windows.',
      proTips: [
        'Get off at Palau Reial (L3) — it\'s less crowded than Collblanc on matchday.',
        'Buy a T-Casual card at the airport — it covers all transport to the stadium and around the city.',
        'Avoid taxis immediately outside the stadium post-match — hail via app or walk 5 min to Les Corts neighbourhood for a faster pickup.',
        'The Les Corts area around the stadium has great tapas bars — worth arriving early and having a drink before kick-off.',
      ],
      recommendedApps: ['TMB App', 'Google Maps', 'Citymapper', 'Cabify'],
      budgetCheap: '€4–8 — Metro L3 from Las Ramblas using T-Casual card',
      budgetStandard: '€15–25 — Bolt or Cabify from city centre',
      budgetComfort: '€35–60 — Private transfer from hotel or El Prat airport',
      airportTransport: {
        metro: { steps: ['Aerobus to Placa de Catalunya (~35 min)', 'Metro L3 to Palau Reial (~15 min)'], time: '50 min', cost: '€6.75 + €2.40' },
        taxi: { time: '30-60 min', cost: '€25-35' },
        rideshare: { time: '30-60 min', cost: '€20-30', surgeWarning: 'High demand on matchday evenings' },
      },
      travelTimes: { metro: '20 min', bus: '25 min', taxi: '15 min', walking: '40 min' },
      budgetBreakdown: {
        budget: { how: 'Metro L3 with T-Casual card', cost: '€4-8' },
        standard: { how: 'Bolt or Cabify from city centre', cost: '€15-25' },
        comfort: { how: 'Private transfer from hotel', cost: '€35-60' },
      },
      paymentDetails: {
        acceptedCards: ['Visa', 'Mastercard', 'Contactless'],
        recommendedTravelCard: 'T-Casual 10-trip card (€11.35)',
        tips: 'Buy a T-Casual at the airport — it covers metro, bus, and FGC.',
      },
    },
  },
  {
    nameContains: 'Allianz Arena',
    data: {
      fromAirportInfo:
        'From Munich Airport (MUC): Take the S8 S-Bahn to Marienplatz (~40 min, €13.60), then U6 U-Bahn to Fröttmaning (~10 min). Total journey ~50 min. Taxi from airport ~€50–70 (30–45 min without traffic). On matchday, allow extra time — taxis in Munich are metered and reliable.',
      travelTimesInfo:
        'City Centre (Marienplatz): ~20 min by U-Bahn. Hauptbahnhof (Central Station): ~25 min. Schwabing district: ~15 min. Olympiapark: ~10 min.',
      paymentInfo:
        'A Bayern Ticket day pass covers all MVV transport (S-Bahn, U-Bahn, buses, trams) across the Munich area for a flat fee — excellent value on matchdays. Single U-Bahn fare is €3.40. Contactless payment accepted at all MVV machines and gates.',
      proTips: [
        'Buy a Bayern Ticket (MVV day pass) — it covers all public transport all day and costs less than two single fares.',
        'After the match, wait 20–30 min inside the stadium concourse. Fröttmaning U6 has a single exit point and the queues after full time are very long.',
        'The U6 runs frequent matchday services directly to Fröttmaning — it\'s the best option by far.',
        'If driving, pre-book a parking spot via the stadium website — matchday parking without a reservation is very limited.',
      ],
      recommendedApps: ['MVV App', 'DB Navigator', 'Google Maps', 'FREE NOW'],
      budgetCheap: '€3–6 — U6 U-Bahn from city centre with Bayern Ticket day pass',
      budgetStandard: '€15–25 — Shared taxi (4 people) from Schwabing or city centre',
      budgetComfort: '€50–70 — Pre-booked private transfer from city centre or airport',
      airportTransport: {
        metro: { steps: ['S8 S-Bahn to Marienplatz (~40 min)', 'U6 U-Bahn to Frottmaning (~10 min)'], time: '50 min', cost: '€13.60' },
        taxi: { time: '30-45 min', cost: '€50-70' },
        rideshare: { time: '30-45 min', cost: '€35-55', surgeWarning: 'Limited availability near Frottmaning after matches' },
      },
      travelTimes: { metro: '20 min', bus: '30 min', taxi: '15 min', walking: '50 min' },
      budgetBreakdown: {
        budget: { how: 'U6 U-Bahn with Bayern Ticket day pass', cost: '€3-6' },
        standard: { how: 'Shared taxi from city centre', cost: '€15-25' },
        comfort: { how: 'Pre-booked private transfer', cost: '€50-70' },
      },
      paymentDetails: {
        acceptedCards: ['Visa', 'Mastercard', 'EC-Karte', 'Contactless'],
        recommendedTravelCard: 'Bayern Ticket MVV day pass',
        tips: 'Bayern Ticket covers all MVV transport all day — costs less than two single fares.',
      },
    },
  },
  {
    nameContains: 'Anfield',
    data: {
      fromAirportInfo:
        'From Liverpool John Lennon Airport (LPL): Take the 500 Arriva bus to the city centre (~35 min, £3), then catch the 26 or 27 bus to Anfield (~20 min). Alternatively take a taxi directly from the airport (~£18–22, 20–30 min). There is no direct rail link to the stadium.',
      travelTimesInfo:
        'City Centre (Lime Street): ~20 min by bus. Liverpool Central: ~20 min. Birkenhead (via ferry/tunnel): ~40 min.',
      paymentInfo:
        'Contactless payment is accepted on Arriva and Stagecoach buses in Liverpool. Cash also accepted. The Saveaway day ticket covers all buses and Merseyrail trains for ~£6 — good value if travelling multiple legs.',
      proTips: [
        'Bus routes 26 and 27 run directly from the city centre to Anfield — they\'re the easiest and cheapest option.',
        'Arrive 60 min early — parking near Anfield is extremely limited and surrounding streets fill up fast.',
        'The Arkles, The Albert, and The Sandon are classic pre-match pubs within walking distance — expect them to be very busy.',
        'Post-match, many fans walk to Kirkdale or Lime Street station rather than wait for crowded buses.',
      ],
      recommendedApps: ['Merseytravel App', 'Google Maps', 'Uber', 'Bolt'],
      budgetCheap: '£3–6 — Bus routes 26/27 from city centre with contactless',
      budgetStandard: '£10–18 — Uber or taxi from city centre (split with others)',
      budgetComfort: '£22–35 — Private hire direct from John Lennon Airport',
      airportTransport: {
        metro: { steps: ['Bus 500 to city centre (~35 min)', 'Bus 26 or 27 to Anfield (~20 min)'], time: '55 min', cost: '£3 + £2' },
        taxi: { time: '20-30 min', cost: '£18-22' },
        rideshare: { time: '20-30 min', cost: '£15-20', surgeWarning: 'Surge pricing common around Anfield post-match' },
      },
      travelTimes: { metro: null, bus: '20 min', taxi: '15 min', walking: '45 min' },
      budgetBreakdown: {
        budget: { how: 'Bus routes 26/27 with contactless', cost: '£3-6' },
        standard: { how: 'Uber or taxi from city centre', cost: '£10-18' },
        comfort: { how: 'Private hire from airport', cost: '£22-35' },
      },
      paymentDetails: {
        acceptedCards: ['Contactless', 'Apple Pay', 'Cash'],
        recommendedTravelCard: 'Saveaway day ticket (~£6)',
        tips: 'Contactless payment accepted on Arriva and Stagecoach buses.',
      },
    },
  },
];

async function main() {
  console.log('Seeding stadium transport data...');

  for (const entry of stadiumData) {
    // Find the stadium by partial name match (case-insensitive)
    const stadium = await prisma.stadium.findFirst({
      where: {
        name: { contains: entry.nameContains, mode: 'insensitive' },
      },
    });

    if (!stadium) {
      console.log(`  Skipped: no stadium found matching "${entry.nameContains}"`);
      continue;
    }

    await prisma.stadium.update({
      where: { id: stadium.id },
      data: entry.data,
    });

    console.log(`  Updated: ${stadium.name} (id=${stadium.id})`);
  }

  console.log('Done.');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
