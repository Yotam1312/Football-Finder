# Milestones

## v2.1 Transport & Polish (Shipped: 2026-03-24)

**Phases completed:** 5 phases (14-18), 7 plans
**Files changed:** 29 files, +2174 / -198 lines
**Timeline:** 2026-03-24 (single day execution)

**Key accomplishments:**
- Admin sync endpoint locked down with `x-admin-api-key` header auth — 401 without valid key
- Match detail page restructured: hero pill (time + date), team crests prominent, full-width venue tile, CTA card
- Transportation guide fully redesigned with hero, quick-tip cards, all mode sections, helpful apps, FAQ accordion
- "Getting to [Stadium]" component added to match detail — DB-backed per-stadium metro/train/bus/walking/parking data with graceful empty state
- "Getting There" FanBase tab with community transport tips — new GETTING_THERE post type, transport type dropdown, GettingThereCard component

**Known gaps (accepted as v3.0 backlog):**
- LEAGUE-01–04: Global league expansion (South America, MLS, Asia)
- LIVE-01–02: Live scores
- `transportType` backend validation deferred

**Archives:**
- `.planning/milestones/v2.1-ROADMAP.md`
- `.planning/milestones/v2.1-REQUIREMENTS.md`
- `.planning/v2.1-MILESTONE-AUDIT.md`

---

## v2.0 Global & Real-Time (Shipped: 2026-03-24)

**Phases completed:** 5 phases (9-13), 12 plans
**Files changed:** 61 files, +5522 / -580 lines
**Timeline:** 2026-03-19 → 2026-03-22 (4 days of execution)

**Key accomplishments:**
- Replaced email+password auth with Google OAuth — user table reset to clean slate, all Level 3 features preserved
- Photo uploads for Seat Tip posts via Azure Blob — in-form preview, lightbox, and profile avatar upload
- Quick-select date chips (Today / Tomorrow / This Weekend) and time-of-day filter chips (Morning / Afternoon / Evening / Night)
- UI polish — sticky navbar, new SVG football-pin logo, real flag images (flagcdn.com), auto-rotating testimonials
- App-like mobile feel — fixed bottom nav bar (md:hidden) and 200ms fade page transitions across all 12 pages

**Known gaps (accepted as v3.0 backlog):**
- LEAGUE-01–04: Global league expansion (South America, MLS, Asia) — deferred due to API cost/complexity

**Archives:**
- `.planning/milestones/v2.0-ROADMAP.md`
- `.planning/milestones/v2.0-REQUIREMENTS.md`
- `.planning/milestones/v2.0-MILESTONE-AUDIT.md`

---

## v1.0 Foundation & Launch (Shipped: 2026-03-19)

**Phases completed:** 8 phases (1-8), 24 plans, 32/32 requirements

**Key accomplishments:**
- Match discovery across 10 European leagues (3789+ fixtures synced)
- Full match detail pages with team stats, ticket links, and Google Maps navigation
- FanBase: country → league → team navigation with 4 post types
- Three-level auth (guest, email-only, full account) with upvote/edit/delete/favorites
- Static pages: transportation guide, contact form, 404
- 28 seeded FanBase posts at launch

**Archives:**
- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`
