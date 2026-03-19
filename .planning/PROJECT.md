# Football Finder

## What This Is

Football Finder is a web platform that helps football fans discover matches across European cities by searching a location and date range. Users get a list of all matches happening in that city, can explore full match details, buy tickets, navigate to stadiums, and connect with fan communities through the FanBase feature — all in one place.

## Core Value

A traveler or local types a city and date range and instantly sees every football match happening there — no Googling, no scattered sites.

## Current State

**Version:** v1.0 — *Shipped 2026-03-19*

### What's Live

- Match discovery: city + date range search across 10 European leagues
- Full match detail pages: team stats, ticket links, Google Maps navigation
- FanBase: Country → League → Team navigation, team post pages, 5 post tabs
- All 4 post types: General Tip, Seat Tip, Pub Recommendation, I'm Going
- Auth: register, login, 7-day sessions, upvote/edit/delete/favorites
- Static pages: transportation guide, contact form, 404 page
- Mobile responsive (48px touch targets, no horizontal scroll)
- FanBase seeded: 28 posts across 7 major teams at launch

### Known Tech Debt

- `token.helpers.ts` — orphaned file, remove in v2
- `POST /api/admin/sync` — unprotected dev endpoint, lock down before public traffic
- `CreatePostModal.tsx` line 229 — sends unused `teamName` field
- Photo upload (POST-08) — deferred to v2; `photoUrl` column exists in schema

## Next Milestone Goals (v2.0)

*To be defined — start with `/gsd:new-milestone`*

Candidates from backlog:
- Photo upload for Seat Tip posts (POST-08 — deferred from v1)
- Google/Facebook OAuth login
- Advanced search filters (league, price range, capacity)
- Non-European coverage (South America, MLS, Asia)
- Live scores and match tracking
- PWA / installable mobile app

---

<details>
<summary>v1.0 Initial Context (archived)</summary>

## Requirements (v1 — archived)

See: [.planning/milestones/v1.0-REQUIREMENTS.md](.planning/milestones/v1.0-REQUIREMENTS.md)

### Active (at project start)

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

### Out of Scope (v1)

- Google/Facebook OAuth — deferred to v2
- Push notifications — deferred to v2
- AI chatbot — deferred to v2
- Mobile app (PWA installable) — deferred to v2
- South America / Asia / MLS coverage — Europe only in v1

</details>

## Context

- **Tech stack**: Node.js + Express + TypeScript + PostgreSQL (Azure) for backend; React 18 + TypeScript + Vite + Tailwind CSS for frontend; deployed on Azure (backend/DB) and Vercel (frontend)
- **Match data**: API-Football (api-football.com) — free tier capped at seasons 2022-2024; upgrade to paid plan to remove cap
- **Student project**: 2nd year CS student — keep code simple, clear, and well-commented. Standard patterns over clever ones.
- **Geographic scope**: Europe only for v1 — England, Spain, Germany, Italy, France (top 2 leagues each)
- **Design**: Modern, clean, minimalist. Green (#16a34a) primary. Inspired by Airbnb/Booking.com for sports. Framer Motion animations.

## Constraints

- **Tech stack**: Node.js + Express + TypeScript + PostgreSQL + React + Tailwind — fixed, no deviation
- **Simplicity**: Code must remain readable and maintainable for a student — no over-engineering
- **Deployment**: Azure (backend + DB) + Vercel (frontend) — infrastructure already chosen

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| API-Football for match data | Good coverage of European leagues, reasonable pricing, established API | Validated — 3789 fixtures synced |
| Password account (not hybrid email-verify) | Phase 5 retired hybrid flow — direct register+login simpler and less error-prone | Validated |
| Seed FanBase manually at launch | Avoids cold-start emptiness; gives real users something to react to | Validated — 28 posts across 7 teams |
| PostgreSQL on Azure | Consistent with backend deployment, relational data fits match/team/post structure | Validated |

---
*Last updated: 2026-03-19 — v1.0 milestone archived*
