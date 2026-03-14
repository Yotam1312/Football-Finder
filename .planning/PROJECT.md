# Football Finder

## What This Is

Football Finder is a web platform that helps football fans discover matches across European cities by searching a location and date range. Users get a list of all matches happening in that city, can explore full match details, buy tickets, navigate to stadiums, and connect with fan communities through the FanBase feature — all in one place.

## Core Value

A traveler or local types a city and date range and instantly sees every football match happening there — no Googling, no scattered sites.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can search matches by city + date range and see all results
- [ ] User can view full match details (teams, date/time, venue, stats, tickets, navigation)
- [ ] User can browse FanBase posts for any team without an account
- [ ] User can post to FanBase after email verification (no password needed)
- [ ] User can create a full account to edit/delete posts, upvote, track favorite teams
- [ ] FanBase supports multiple post types: general tips, seat tips (with photos), pub recommendations, "I'm Going"
- [ ] FanBase 3-step navigation: Country → League → Team
- [ ] Match details link to both teams' FanBase pages
- [ ] Navigate to Stadium button opens Google Maps directions
- [ ] Transportation guide page with transit options and app links
- [ ] Contact page with social links and contact form

### Out of Scope

- Google/Facebook OAuth — deferred to Phase 2 (complexity vs value tradeoff for v1)
- Push notifications — deferred to Phase 2
- AI chatbot — deferred to Phase 2
- Mobile app (PWA installable) — deferred to Phase 2
- South America / Asia / MLS coverage — Phase 1 is Europe only

## Context

- **Tech stack**: Node.js + Express + TypeScript + PostgreSQL (Azure) for backend; React 18 + TypeScript + Vite + Tailwind CSS for frontend; deployed on Azure (backend/DB) and Vercel (frontend)
- **Match data**: API-Football (api-football.com) — API key not yet obtained; first development phase will use real API once key is acquired
- **FanBase seeding**: Will be seeded manually by the developer with real/plausible posts to avoid cold-start emptiness at launch
- **Student project**: 2nd year CS student — keep code simple, clear, and well-commented. Standard patterns over clever ones.
- **Geographic scope**: Europe only for v1 — England, Spain, Germany, Italy, France (top 2 leagues each)
- **Design**: Modern, clean, minimalist. Green (#16a34a) primary. Inspired by Airbnb/Booking.com for sports. Framer Motion animations.

## Constraints

- **Tech stack**: Node.js + Express + TypeScript + PostgreSQL + React + Tailwind — fixed, no deviation
- **API dependency**: API-Football key must be obtained before match data features can be fully tested with live data
- **Simplicity**: Code must remain readable and maintainable for a student — no over-engineering
- **Deployment**: Azure (backend + DB) + Vercel (frontend) — infrastructure already chosen

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| API-Football for match data | Good coverage of European leagues, reasonable pricing, established API | — Pending |
| Hybrid 3-level auth (guest/email/full account) | 90% of users just browse; low friction for contributors; email verification prevents spam | — Pending |
| Seed FanBase manually at launch | Avoids cold-start emptiness; gives real users something to react to | — Pending |
| PostgreSQL on Azure | Consistent with backend deployment, relational data fits match/team/post structure | — Pending |

---
*Last updated: 2026-03-15 after initialization*
