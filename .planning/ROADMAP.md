# Roadmap: Football Finder

## Milestones

- [x] **v1.0** — Foundation & Launch (8 phases, 24 plans, 32/32 requirements) — *Shipped 2026-03-19* — [Archive](.planning/milestones/v1.0-ROADMAP.md)
- [x] **v2.0 — Global & Real-Time** — OAuth, Photo Upload, Date Filters, UI Polish, Mobile Feel (5 phases, 12 plans) — *Shipped 2026-03-24* — [Archive](.planning/milestones/v2.0-ROADMAP.md)
- [x] **v2.1 — Transport & Polish** — Admin auth, match detail polish, transport guide redesign, stadium transport component, community transport tips (5 phases, 7 plans, 10/10 requirements) — *Shipped 2026-03-24* — [Archive](.planning/milestones/v2.1-ROADMAP.md)
- 🚧 **v2.2 — Stadium Guide** — Phases 19-22 (in progress)

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

<details>
<summary>v2.1 — Transport & Polish (Phases 14-18) — SHIPPED 2026-03-24</summary>

Phases 14-18 locked down the admin sync endpoint with API key auth, polished the match detail page (hero pill, CTA card), fully redesigned the transportation guide, added a "Getting to [Stadium]" component on match detail backed by DB data, and introduced a "Getting There" FanBase tab with community transport tips. 10/10 requirements shipped.

See: [.planning/milestones/v2.1-ROADMAP.md](.planning/milestones/v2.1-ROADMAP.md)

</details>

---

## 🚧 v2.2 — Stadium Guide (In Progress)

**Milestone Goal:** Transform the Transportation Guide page into a searchable stadium directory. Every stadium gets its own page with an embedded map, transport data, and top FanBase community posts. Users can find any stadium via search or Country → League → Team browse, and reach it from match detail and FanBase team pages.

### Phases

- [ ] **Phase 19: DB + Backend** — Add lat/lng to Stadium model, create search and detail API endpoints
- [ ] **Phase 20: Stadium Guide Hub** — Hub page with search + Country→League→Team browse, navbar/bottom-nav update
- [ ] **Phase 21: Stadium Detail Page** — Full stadium page: identity, OSM map, transport info, top FanBase posts
- [ ] **Phase 22: Cross-Links** — Link from match detail page and FanBase team page to stadium page

### Phase Details

#### Phase 19: DB + Backend
**Goal**: Stadium data can be stored with coordinates, and the API exposes stadium search and detail endpoints
**Depends on**: Nothing (first phase of this milestone)
**Requirements**: STAD-11, STAD-12
**Success Criteria** (what must be TRUE):
  1. `Stadium` table has `latitude` and `longitude` columns (nullable Float) and the migration runs cleanly on the Azure DB
  2. `GET /api/stadiums/search?q=Arsenal` returns matching stadiums with name, city, team crest, and googleMapsUrl
  3. `GET /api/stadiums/:id` returns full stadium data: transport fields, lat/lng, and top 5 Pub Rec + Getting There posts ordered by upvotes
  4. Both endpoints return empty/graceful responses when no data is found (no 500 errors)
**Plans**: 2 plans

Plans:
- [ ] 19-01-PLAN.md — Migration (lat/lng columns) + stadium search endpoint + search tests
- [ ] 19-02-PLAN.md — Stadium detail endpoint (primary team, top posts) + detail tests

#### Phase 20: Stadium Guide Hub
**Goal**: Users can reach any stadium from a dedicated hub page, and the navbar/bottom-nav point to it instead of the old Transportation Guide
**Depends on**: Phase 19
**Requirements**: STAD-01, STAD-02, STAD-13
**Success Criteria** (what must be TRUE):
  1. Typing a team or stadium name in the hub search box shows matching stadium results within ~300ms (debounced)
  2. User can tap through Country → League → Team in the hub browse and arrive at a stadium page
  3. The navbar link and bottom-nav link both go to `/stadiums` — the old `/transportation-guide` link is gone from both
  4. The hub renders correctly on mobile (bottom-nav visible, content scrollable)
**Plans**: TBD

Plans:
- [ ] 20-01: TBD

#### Phase 21: Stadium Detail Page
**Goal**: A stadium's dedicated page shows its identity, an embedded map, transport details, and the top community posts from FanBase
**Depends on**: Phase 19
**Requirements**: STAD-05, STAD-06, STAD-07, STAD-08, STAD-09, STAD-10
**Success Criteria** (what must be TRUE):
  1. Stadium page shows stadium name, hosting team crest, and city — visible without scrolling on mobile
  2. An OpenStreetMap iframe is rendered using the stadium's lat/lng (when coordinates are populated); when lat/lng is null the map section is hidden gracefully
  3. A "Navigate" button opens Google Maps directions in a new tab using the stored googleMapsUrl
  4. Transport section lists nearby metro/train/bus lines, walking time from centre, parking info, and general transport tip — each section hidden when data is empty
  5. Top 5 Pub Rec posts and top 5 Getting There posts (ordered by upvotes) are displayed; sections show an empty-state message when no posts exist
**Plans**: TBD

Plans:
- [ ] 21-01: TBD

#### Phase 22: Cross-Links
**Goal**: Users browsing a match or a FanBase team page can navigate directly to that stadium's page
**Depends on**: Phase 21
**Requirements**: STAD-03, STAD-04
**Success Criteria** (what must be TRUE):
  1. Match detail page shows a "Stadium Guide" link or button that navigates to the correct stadium page for that match's venue
  2. FanBase team page shows a "Stadium Guide" link or button that navigates to the team's stadium page
  3. Both links are absent (not broken) when a stadium page does not yet exist for that venue
**Plans**: TBD

Plans:
- [ ] 22-01: TBD

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | — | Complete | 2026-03-19 |
| 2. Match Discovery | v1.0 | — | Complete | 2026-03-19 |
| 3. FanBase Browse | v1.0 | — | Complete | 2026-03-19 |
| 4. FanBase Post | v1.0 | — | Complete | 2026-03-19 |
| 5. Auth | v1.0 | — | Complete | 2026-03-19 |
| 6. Match Detail | v1.0 | — | Complete | 2026-03-19 |
| 7. Static Pages | v1.0 | — | Complete | 2026-03-19 |
| 8. Tech Debt | v1.0 | — | Complete | 2026-03-19 |
| 9. Google OAuth | v2.0 | — | Complete | 2026-03-24 |
| 10. Photo Upload | v2.0 | — | Complete | 2026-03-24 |
| 11. Date Filters | v2.0 | — | Complete | 2026-03-24 |
| 12. UI Polish | v2.0 | — | Complete | 2026-03-24 |
| 13. Mobile Feel | v2.0 | — | Complete | 2026-03-24 |
| 14. Admin Auth | v2.1 | — | Complete | 2026-03-24 |
| 15. Match Detail Polish | v2.1 | — | Complete | 2026-03-24 |
| 16. Transport Guide Redesign | v2.1 | — | Complete | 2026-03-24 |
| 17. Stadium Transport Component | v2.1 | — | Complete | 2026-03-24 |
| 18. Getting There FanBase | v2.1 | — | Complete | 2026-03-24 |
| 19. DB + Backend | 1/2 | In Progress|  | - |
| 20. Stadium Guide Hub | v2.2 | 0/TBD | Not started | - |
| 21. Stadium Detail Page | v2.2 | 0/TBD | Not started | - |
| 22. Cross-Links | v2.2 | 0/TBD | Not started | - |
