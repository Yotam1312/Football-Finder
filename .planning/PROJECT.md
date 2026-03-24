# Football Finder

## What This Is

Football Finder is a web platform that helps football fans discover matches across cities worldwide by searching a location and date range. Users get a list of all matches happening in that city, can explore full match details, navigate to stadiums, and connect with fan communities through the FanBase feature — including photo-rich Seat Tips, pub recommendations, and match attendance posts — all in one place.

## Core Value

A traveler or local types a city and date range and instantly sees every football match happening there — no Googling, no scattered sites.

## Current State

**Version:** v2.0 — *Shipped 2026-03-24*

### What's Live

- Match discovery: city + date range search with quick-select chips (Today / Tomorrow / This Weekend) and time-of-day filters
- Full match detail pages: team stats, ticket links, Google Maps navigation
- FanBase: Country → League → Team navigation, team post pages, 4 post types
- Seat Tip posts: accept one photo (jpg/png/webp, max 5MB) via Azure Blob with in-form preview and lightbox
- Auth: Google OAuth (primary) + email+password — all Level 3 features (create, upvote, edit/delete, favorites)
- User profiles: avatar (Google photo or upload), name/age/country edit, password change, account delete
- Sticky navbar with Football Finder SVG logo; real country flag images (flagcdn.com) in FanBase
- Mobile feel: fixed bottom nav bar (Search / FanBase / Profile), 200ms fade page transitions on all pages
- iPhone safe-area respected on bottom nav; desktop nav hidden on mobile (BottomNav shows instead)
- Static pages: transportation guide, contact form, 404

### Known Tech Debt

- `token.helpers.ts` — orphaned file from v1, still present
- `POST /api/admin/sync` — unprotected dev endpoint, lock down before public traffic
- `GOOGLE_CALLBACK_URL` env var in `google-oauth.ts` is set but unused at runtime (dynamic URL wins)
- Stale comment in `frontend/src/types/index.ts:90` — "Phase 4 feature" label on photoUrl
- Global league expansion (South America, MLS, Asia) — deferred to v3.0

## Requirements

### Validated

- ✓ User can search matches by city + date range — v1.0
- ✓ User can view full match details (teams, date/time, venue, stats, tickets, navigation) — v1.0
- ✓ User can browse FanBase posts for any team without an account — v1.0
- ✓ User can post to FanBase after authentication — v1.0
- ✓ User can create a full account to edit/delete posts, upvote, track favorite teams — v1.0
- ✓ FanBase supports multiple post types: general tips, seat tips (with photos), pub recommendations, "I'm Going" — v1.0 / v2.0
- ✓ FanBase 3-step navigation: Country → League → Team — v1.0
- ✓ Navigate to Stadium button opens Google Maps directions — v1.0
- ✓ Transportation guide page — v1.0
- ✓ Contact page — v1.0
- ✓ Google OAuth sign-in (replaces email+password as primary) — v2.0
- ✓ Photo upload for Seat Tip posts (Azure Blob, 5MB, jpg/png/webp) — v2.0
- ✓ Photo preview in creation form; photo display on published post — v2.0
- ✓ Quick-select date chips on homepage (Today / Tomorrow / This Weekend) — v2.0
- ✓ Time-of-day filter chips on results page (Morning / Afternoon / Evening / Night) — v2.0
- ✓ Sticky navbar, new SVG logo, real flag images, auto-rotating testimonials — v2.0
- ✓ Mobile bottom nav bar and smooth page transitions — v2.0

## Current Milestone: v2.1 — Transport & Polish

**Goal:** Harden the admin endpoint, polish the match detail UI, and build a 3-part transportation system (generic guide redesign, stadium-specific component, community tips tab).

**Target features:**
- Lock down `POST /api/admin/sync` with API key auth
- Match detail page visual polish (crests, score area, ticket/nav section)
- `/transportation-guide` page full redesign (rich sections, icons, content)
- "Getting to [Stadium]" component on match detail (DB-backed per-stadium transport data)
- "Getting There" tab in FanBase team pages (community transport tips, new post type)

### Active (next milestone)

### Out of Scope

- In-app ticket purchasing — commercial deals and payment processing required
- PWA (service workers + offline) — v2 mobile feel achieved without PWA complexity
- Facebook OAuth — `passport-facebook` library unmaintained; Google-only for now
- Google One Tap — can layer on top of current OAuth in a minor update
- Push notifications / email match reminders — not yet prioritized
- AI chatbot — deferred indefinitely
- Social graph (follow users, DMs) — deferred indefinitely
- Redux / Zustand / Jotai — no complex client state justifies a state manager

## Context

- **Tech stack**: Node.js + Express + TypeScript + PostgreSQL (Azure) for backend; React 18 + TypeScript + Vite + Tailwind CSS for frontend; deployed on Azure (backend/DB) and Vercel (frontend)
- **Match data**: API-Football (api-football.com) — free tier, seasons 2022-2024; upgrade to paid plan for live scores and wider coverage
- **Photos**: Azure Blob Storage — `AZURE_STORAGE_CONNECTION_STRING` in backend .env
- **Auth**: Google OAuth via `google-auth-library`, JWT cookies (7-day), cookie-based sessions; email+password still supported
- **Student project**: 2nd year CS student — keep code simple, clear, and well-commented. Standard patterns over clever ones.
- **Geographic scope**: Europe in v1/v2; expanding to South America, MLS, Asia in v3

## Constraints

- **Tech stack**: Node.js + Express + TypeScript + PostgreSQL + React + Tailwind — fixed, no deviation
- **Simplicity**: Code must remain readable and maintainable for a student — no over-engineering
- **Deployment**: Azure (backend + DB) + Vercel (frontend) — infrastructure already chosen
- **API cost**: API-Football free tier limits live scores and coverage expansion — upgrade before v3 league work

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| API-Football for match data | Good coverage of European leagues, reasonable pricing, established API | ✓ Validated — 3789+ fixtures synced |
| Password account (not hybrid email-verify) | Phase 5 retired hybrid flow — direct register+login simpler | ✓ Validated |
| Seed FanBase manually at launch | Avoids cold-start emptiness; gives real users something to react to | ✓ Validated — 28 posts across 7 teams |
| PostgreSQL on Azure | Consistent with backend deployment, relational data fits structure | ✓ Validated |
| Google OAuth as primary (replace email+password) | Simpler UX, no password management, higher trust — user table reset was safe at this stage | ✓ Validated — clean migration |
| Azure Blob for photo storage | Already on Azure stack, cheap blob storage, CORS configurable | ✓ Validated — upload endpoint working |
| Client-side time-of-day filtering | No backend query complexity, instant UI response, works with existing search API | ✓ Validated |
| Inline SVG logo instead of image file | No extra network request, scales perfectly, matches brand colors exactly | ✓ Validated |
| Framer Motion AnimatePresence for page transitions | Simple, declarative, pairs well with React Router, small bundle add | ✓ Validated — 200ms fade clean |
| BottomNav outside AnimatePresence | Nav bar must not animate on route changes — stable element | ✓ Validated |
| Defer global league expansion to v3 | API rate limits and timezone complexity underestimated; MLS multi-tz needs careful sync.service work | — Pending v3 |

---
*Last updated: 2026-03-24 — v2.1 milestone started*
