# Roadmap: Football Finder

## Milestones

- [x] **v1.0** — Foundation & Launch (8 phases, 24 plans, 32/32 requirements) — *Shipped 2026-03-19* — [Archive](.planning/milestones/v1.0-ROADMAP.md)
- [x] **v2.0 — Global & Real-Time** — OAuth, Photo Upload, Date Filters, UI Polish, Mobile Feel (5 phases, 12 plans) — *Shipped 2026-03-24* — [Archive](.planning/milestones/v2.0-ROADMAP.md)
- 🚧 **v2.1 — Transport & Polish** — Security hardening, match detail polish, transportation system (5 phases) — *In progress*

---

<details>
<summary>v1.0 — Foundation & Launch (Phases 1-8) — SHIPPED 2026-03-19</summary>

Phases 1-8 delivered the full v1.0 product: match discovery across 10 European leagues, FanBase browsing and posting, three-level auth, match detail pages, static pages, mobile responsiveness, and post-launch tech debt cleanup. 32/32 requirements shipped.

See: [.planning/milestones/v1.0-ROADMAP.md](.planning/milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>v2.0 — Global & Real-Time (Phases 9-13) — SHIPPED 2026-03-24</summary>

Phases 9-13 replaced email+password with Google OAuth, added Azure Blob photo uploads for Seat Tip posts, introduced date quick-select and time-of-day filter chips, polished the UI (sticky navbar, new logo, real flags, rotating testimonials), and added a mobile-app-like feel with a bottom nav bar and page fade transitions.

See: [.planning/milestones/v2.0-ROADMAP.md](.planning/milestones/v2.0-ROADMAP.md)

</details>

---

## v2.1 — Transport & Polish (In Progress)

**Milestone Goal:** Harden the admin endpoint, polish the match detail UI, and build a 3-part transportation system: a generic guide redesign, a stadium-specific transport component on match detail, and community transport tips in FanBase.

### Phases

- [x] **Phase 14: Security & Match Polish** - Lock down admin endpoint + visual polish on match detail page (completed 2026-03-24)
- [ ] **Phase 15: Transport DB Schema** - Prisma migrations for stadium transport fields and GETTING_THERE post type
- [ ] **Phase 16: Transportation Guide Redesign** - Full frontend redesign of the `/transportation-guide` page
- [ ] **Phase 17: Stadium Transport Component** - "Getting to [Stadium]" section on match detail, powered by DB data
- [ ] **Phase 18: Getting There FanBase Tab** - Community transport tips tab and post creation in FanBase

## Phase Details

### Phase 14: Security & Match Polish
**Goal**: The admin sync endpoint is protected and the match detail page has a clean, polished visual layout
**Depends on**: Nothing (first phase of milestone)
**Requirements**: SEC-01, MATCH-01, MATCH-02
**Success Criteria** (what must be TRUE):
  1. Calling `POST /api/admin/sync` without a valid API key header returns 401 and does not trigger a sync
  2. Calling `POST /api/admin/sync` with the correct API key header succeeds as before
  3. Match detail page displays team crests prominently with clear score/date area and improved visual hierarchy
  4. Ticket links and Navigate to Stadium section has a clean call-to-action treatment that draws the eye
**Plans:** 2/2 plans complete
Plans:
- [ ] 14-01-PLAN.md — Admin sync endpoint API key protection (SEC-01)
- [ ] 14-02-PLAN.md — Match detail page hero restructure and CTA card polish (MATCH-01, MATCH-02)

### Phase 15: Transport DB Schema
**Goal**: The database has the schema to store per-stadium transport data and GETTING_THERE community posts
**Depends on**: Phase 14
**Requirements**: TRANS-02, TRANS-05
**Success Criteria** (what must be TRUE):
  1. Prisma migration runs cleanly and adds transport fields to the Stadium table (`nearbyMetros`, `nearbyTrains`, `nearbyBuses`, `walkingTimeFromCenter`, `publicTransportInfo`, `parkingInfo`)
  2. Prisma migration adds `GETTING_THERE` to the `PostType` enum and optional fields (`transportType`, `travelCost`, `travelTime`) to the `FanbasePost` table
  3. Existing stadium records and FanBase posts are unaffected by the migration
**Plans**: TBD

### Phase 16: Transportation Guide Redesign
**Goal**: The `/transportation-guide` page is a rich, useful resource that fans actually want to read before travelling to a match
**Depends on**: Phase 14
**Requirements**: TRANS-01
**Success Criteria** (what must be TRUE):
  1. The page has a hero section, four quick-tip cards (Plan Ahead / Arrive Early / Payment Ready / Download Apps), and sections for metro/bus/tram, ride services, walking/cycling, and long-distance travel
  2. The page shows a payment methods section, a helpful apps section with links, a safety tips section, budget tier breakdowns, and FAQs
  3. All content sections render correctly on both mobile and desktop without layout issues
**Plans**: TBD

### Phase 17: Stadium Transport Component
**Goal**: Users viewing a match detail page can see transport options for the specific stadium without leaving the page
**Depends on**: Phase 15
**Requirements**: TRANS-03, TRANS-04
**Success Criteria** (what must be TRUE):
  1. Match detail page shows a "Getting to [Stadium Name]" section that lists nearby metro, train, and bus lines from the DB when data exists
  2. The section displays walking time from center, a travel tip, parking info, and a Navigate button that opens Google Maps
  3. When no transport data exists for a stadium the section shows a graceful empty state with the Navigate button and a "Check local transport apps" message instead of a broken or blank area
**Plans**: TBD

### Phase 18: Getting There FanBase Tab
**Goal**: Fans can read and contribute community transport tips for any team's stadium directly within FanBase
**Depends on**: Phase 15
**Requirements**: TRANS-06, TRANS-07
**Success Criteria** (what must be TRUE):
  1. FanBase team pages have a "Getting There" tab that lists community transport posts for that team's stadium, ordered by upvotes
  2. An authenticated user can open the post creation flow and select "Getting There" as the post type
  3. The Getting There post form has fields for title, transport type dropdown (Metro / Bus / Train / Taxi / Walking / Other), optional cost, optional travel time, and description — and the submitted post appears in the Getting There tab
**Plans**: TBD

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-8. Foundation → Launch | v1.0 | 24/24 | Complete | 2026-03-19 |
| 9. OAuth Foundation | v2.0 | 5/5 | Complete | 2026-03-20 |
| 10. Photo Upload | v2.0 | 2/2 | Complete | 2026-03-21 |
| 11. Date Filters | v2.0 | 2/2 | Complete | 2026-03-22 |
| 12. UI Improvements | v2.0 | 1/1 | Complete | 2026-03-22 |
| 13. Mobile Feel | v2.0 | 2/2 | Complete | 2026-03-22 |
| 14. Security & Match Polish | 2/2 | Complete   | 2026-03-24 | - |
| 15. Transport DB Schema | v2.1 | 0/? | Not started | - |
| 16. Transportation Guide Redesign | v2.1 | 0/? | Not started | - |
| 17. Stadium Transport Component | v2.1 | 0/? | Not started | - |
| 18. Getting There FanBase Tab | v2.1 | 0/? | Not started | - |
