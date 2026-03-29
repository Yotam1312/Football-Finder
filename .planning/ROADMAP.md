# Roadmap: Football Finder

## Milestones

- [x] **v1.0** — Foundation & Launch (8 phases, 24 plans, 32/32 requirements) — *Shipped 2026-03-19* — [Archive](.planning/milestones/v1.0-ROADMAP.md)
- [x] **v2.0 — Global & Real-Time** — OAuth, Photo Upload, Date Filters, UI Polish, Mobile Feel (5 phases, 12 plans) — *Shipped 2026-03-24* — [Archive](.planning/milestones/v2.0-ROADMAP.md)
- [x] **v2.1 — Transport & Polish** — Admin auth, match detail polish, transport guide redesign, stadium transport component, community transport tips (5 phases, 7 plans, 10/10 requirements) — *Shipped 2026-03-24* — [Archive](.planning/milestones/v2.1-ROADMAP.md)
- [x] **v2.2 — Stadium Guide** — Stadium directory hub, individual stadium pages with Leaflet map + full transport guide, canonical page structure (5 phases, 9 plans, 21/21 requirements) — *Shipped 2026-03-27* — [Archive](.planning/milestones/v2.2-ROADMAP.md)
- 🚧 **v2.3 — Multi-Game Search & UX Overhaul** — Tech debt sweep, multi-city trip planning search, stadium detail tabbed redesign, hub refresh, FanBase team page overhaul (5 phases) — *In progress*

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

<details>
<summary>v2.1 — Transport & Polish (Phases 14-18) — SHIPPED 2026-03-24</summary>

Phases 14-18 locked down the admin sync endpoint with API key auth, polished the match detail page (hero pill, CTA card), fully redesigned the transportation guide, added a "Getting to [Stadium]" component on match detail backed by DB data, and introduced a "Getting There" FanBase tab with community transport tips. 10/10 requirements shipped.

See: [.planning/milestones/v2.1-ROADMAP.md](.planning/milestones/v2.1-ROADMAP.md)

</details>

<details>
<summary>v2.2 — Stadium Guide (Phases 19-23) — SHIPPED 2026-03-27</summary>

Phases 19-23 transformed the Transportation Guide into a full stadium directory: DB coordinates + search/detail API, hub page with debounced search and Country→League→Team browse, individual stadium pages with an interactive Leaflet map, rich JSON transport sections (airport routes, travel times, budget, payment), community tips linked to FanBase, and a canonical section order. 21/21 requirements shipped.

See: [.planning/milestones/v2.2-ROADMAP.md](.planning/milestones/v2.2-ROADMAP.md)

</details>

---

### 🚧 v2.3 — Multi-Game Search & UX Overhaul (Phases 24-28)

**Milestone Goal:** Introduce multi-city trip planning search, redesign Stadium Detail and FanBase team pages with richer content tabs and filter pills, refresh the Stadium Guide hub card design, and eliminate all known tech debt from v2.2.

## Phases

- [ ] **Phase 24: Code Cleanup & Tech Debt** - Remove dead files, orphaned queries, and fix validation gaps left from v2.2
- [ ] **Phase 25: Multi-Game Search** - Add multi-city trip planning mode to the homepage search form and results page
- [ ] **Phase 26: Stadium Detail Redesign** - DB migration for new content fields + tabbed UI (Transport, Matchday Guide, Food & Drink, Stadium Rules)
- [ ] **Phase 27: Stadium Guide Hub Redesign** - Refreshed hub cards with team crests, capacity, and a Featured Stadiums section
- [ ] **Phase 28: FanBase Team Page Redesign** - New header, horizontal filter pills, category-specific empty states, and Stadium Guide link

## Phase Details

### Phase 24: Code Cleanup & Tech Debt
**Goal**: All known tech debt from v2.2 is eliminated — dead files deleted, orphaned backend queries removed, missing validation added, and a full codebase review run
**Depends on**: Nothing (first phase of milestone)
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04, CLEAN-05, CLEAN-06, CLEAN-07, CLEAN-08
**Success Criteria** (what must be TRUE):
  1. `NearbyStadiumsSection.tsx` and `token.helpers.ts` no longer exist anywhere in the codebase
  2. The `getStadiumById` controller does not run a `nearbyStadiums` Haversine calculation or `pubRecPosts` query; the response type has no corresponding fields
  3. Submitting a Getting There post with an invalid transport type (e.g., "Helicopter") returns a 400 error from the backend API
  4. The FanBase team page shows a clickable "Stadium Guide →" link when the team has a `stadiumId`
  5. The "Phase 4 feature" stale comment in `frontend/src/types/index.ts` is gone and no new orphaned files exist after the full review
**Plans**: 2 plans

Plans:
- [ ] 24-01-PLAN.md — Delete orphaned files, remove dead backend queries, fix stale comment
- [ ] 24-02-PLAN.md — Add backend `transportType` validation, add Stadium Guide link to FanBase team page, run full codebase review

### Phase 25: Multi-Game Search
**Goal**: Users can plan a multi-city football trip by entering multiple city and date-range pairs in a single search, with results grouped per city
**Depends on**: Phase 24
**Requirements**: SEARCH-01, SEARCH-02, SEARCH-03, SEARCH-04, SEARCH-05, SEARCH-06
**Success Criteria** (what must be TRUE):
  1. The homepage search form has a visible "Single Game / Multiple Games" toggle; Single Game is the default and behaves exactly as before
  2. Switching to Multiple Games mode shows at least two city + date-range input pairs on the form
  3. User can add more city/date legs with an "Add Game" button and remove individual legs (but cannot reduce below one remaining leg)
  4. Submitting a multi-leg search returns results grouped into clearly labelled city sections (e.g., "London — 3 matches"), each with its own match list
  5. A city with no matches shows a "No matches found" message scoped to that section, not a full-page empty state
**Plans**: TBD

Plans:
- [ ] 25-01: Backend — multi-city search endpoint (accepts array of city + date pairs, returns grouped results)
- [ ] 25-02: Frontend — toggle UI, multi-leg form inputs, add/remove leg controls
- [ ] 25-03: Frontend — grouped results page with per-city sections and per-section empty states

### Phase 26: Stadium Detail Redesign
**Goal**: Stadium detail pages have a redesigned hero header and a 4-tab navigation layout (Transport, Matchday Guide, Food & Drink, Stadium Rules) backed by new DB fields, with all tab content responsive and gracefully hidden when data is absent
**Depends on**: Phase 24
**Requirements**: STAD-DETAIL-01, STAD-DETAIL-02, STAD-DETAIL-03, STAD-DETAIL-04, STAD-DETAIL-05, STAD-DETAIL-06, STAD-DETAIL-07, STAD-DETAIL-08, STAD-DETAIL-09
**Success Criteria** (what must be TRUE):
  1. The stadium page has a green hero header with a floating team identity card (logo, stadium name, city, home team name) that visually overlaps the header edge
  2. A 4-tab bar (Transport, Matchday Guide, Food & Drink, Stadium Rules) with line-art icons is visible and switching tabs changes the displayed content
  3. Transport tab shows a 3-column card grid (Public Transit, Driving & Parking, Address with Google Maps button) that collapses to 1 column on mobile
  4. Matchday Guide tab shows a vertical arrival timeline and two pro-tip cards; Food & Drink tab shows inside-stadium and local recommendations with a Find Nearby Pubs link; Stadium Rules tab shows bag policy checklist and prohibited items list
  5. Each tab with no data shows an empty state message rather than broken UI or blank space
  6. Prisma migration has run; `GET /api/stadiums/:id` returns `matchdayGuide`, `foodAndDrink`, and `stadiumRules` fields
**Plans**: TBD

Plans:
- [ ] 26-01: DB — add `matchdayGuide`, `foodAndDrink`, `stadiumRules` JSON fields to Stadium model; run Prisma migration; update API response
- [ ] 26-02: Frontend — green hero header with floating team identity card
- [ ] 26-03: Frontend — 4-tab navigation bar and Transport tab content
- [ ] 26-04: Frontend — Matchday Guide, Food & Drink, and Stadium Rules tab content; empty states; mobile responsiveness

### Phase 27: Stadium Guide Hub Redesign
**Goal**: The Stadium Guide hub (`/stadiums`) has a refreshed visual identity — a branded header, stadium cards showing team crests and capacity, and a Featured Stadiums section at the top
**Depends on**: Phase 24
**Requirements**: STAD-HUB-01, STAD-HUB-02, STAD-HUB-03
**Success Criteria** (what must be TRUE):
  1. The `/stadiums` hub page has a branded green header consistent with the site's visual identity
  2. Each stadium card shows the team crest, stadium name, city, and capacity (capacity is hidden gracefully when null)
  3. A "Featured Stadiums" section appears at the top of the hub, showcasing the most iconic or largest stadiums before the full directory
**Plans**: TBD

Plans:
- [ ] 27-01: Frontend — hub branded header, updated stadium cards (crest + capacity), Featured Stadiums section

### Phase 28: FanBase Team Page Redesign
**Goal**: The FanBase team page has a redesigned header, horizontal filter pills for post types, category-specific empty states with contextual CTAs, and co-exists with the existing Getting There tab
**Depends on**: Phase 24
**Requirements**: FAN-01, FAN-02, FAN-03, FAN-04, FAN-05, FAN-06, FAN-07, FAN-08
**Success Criteria** (what must be TRUE):
  1. The team page header shows the team crest, "[Team Name] FanBase" title, a tagline, and a prominent green "+ Add Your Tip" button
  2. Horizontal scrollable filter pills (All, Where to Sit, Local Crowd, Pubs & Food, I'm Going) are visible below the header; selecting a pill filters the post list to that type
  3. Each post category shows a contextual empty state message when no posts exist in that category
  4. The "Where to Sit" empty state includes a dashed-border photo placeholder with a camera icon and "Share Your Seat" button; the "Pubs & Food" empty state includes a "Recommend a Place" CTA with a location pin icon
  5. Clicking "+ Add Your Tip" or a category CTA while unauthenticated prompts the user to sign in rather than opening the submission modal
  6. The Getting There tab/section remains accessible alongside the new filter pill system
**Plans**: TBD

Plans:
- [ ] 28-01: Frontend — redesigned header with crest, title, tagline, and "+ Add Your Tip" button
- [ ] 28-02: Frontend — horizontal filter pills with post type filtering logic
- [ ] 28-03: Frontend — category-specific empty states (including "Where to Sit" photo placeholder and "Pubs & Food" CTA); auth guard on CTA buttons

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1–8. Foundation → Tech Debt | v1.0 | 24/24 | Complete | 2026-03-19 |
| 9–13. OAuth → Mobile Feel | v2.0 | 12/12 | Complete | 2026-03-24 |
| 14–18. Admin Auth → Getting There FanBase | v2.1 | 7/7 | Complete | 2026-03-24 |
| 19–23. Stadium Guide | v2.2 | 9/9 | Complete | 2026-03-27 |
| 24. Code Cleanup & Tech Debt | 1/2 | In Progress|  | - |
| 25. Multi-Game Search | v2.3 | 0/3 | Not started | - |
| 26. Stadium Detail Redesign | v2.3 | 0/4 | Not started | - |
| 27. Stadium Guide Hub Redesign | v2.3 | 0/1 | Not started | - |
| 28. FanBase Team Page Redesign | v2.3 | 0/3 | Not started | - |
