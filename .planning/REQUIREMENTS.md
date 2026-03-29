# Requirements — v2.3 Multi-Game Search & UX Overhaul

**Milestone goal:** Introduce multi-city trip planning search, redesign Stadium Guide and FanBase team pages with richer content tabs, and clean up all known tech debt.

**Status:** Roadmap created — ready to execute

---

## v2.3 Requirements

### Code Cleanup & Tech Debt

- [x] **CLEAN-01**: Dead file `NearbyStadiumsSection.tsx` is deleted from the codebase
- [x] **CLEAN-02**: `nearbyStadiums` Haversine computation removed from `getStadiumById` controller; `NearbyStadium` interface and `nearbyStadiums` field removed from the `StadiumDetail` response type
- [x] **CLEAN-03**: `pubRecPosts` query removed from `getStadiumById` controller; `pubRecPosts` field removed from the `StadiumDetail` response type
- [x] **CLEAN-04**: Orphaned `token.helpers.ts` file from v1 is deleted
- [x] **CLEAN-05**: Stale "Phase 4 feature" comment removed from `frontend/src/types/index.ts`
- [x] **CLEAN-06**: `transportType` field on Getting There posts validated at the backend API layer (accepts: Metro / Bus / Train / Taxi / Walking / Other; rejects anything else with 400)
- [x] **CLEAN-07**: FanBase team page shows a "Stadium Guide →" link when `team.stadiumId` is non-null
- [x] **CLEAN-08**: Full codebase review run; any additional orphaned files, unused DB fields, or dead code identified and removed

### Multi-Game Search

- [ ] **SEARCH-01**: Homepage search form has a "Single Game / Multiple Games" toggle; Single Game mode is the default and behaves identically to current behavior
- [ ] **SEARCH-02**: Selecting "Multiple Games" expands the form to show multiple city + date-range input pairs
- [ ] **SEARCH-03**: User can add more city/date legs with an "Add Game" button (minimum 2, no hard maximum)
- [ ] **SEARCH-04**: User can remove any individual leg (except when only one leg remains in the set)
- [ ] **SEARCH-05**: Searching in Multiple Games mode returns results grouped into separate sections per city (e.g., "London — 3 matches", "Madrid — 2 matches"), each with its own match list
- [ ] **SEARCH-06**: Empty results per city show a per-section "No matches found" state rather than a full-page empty state

### Stadium Guide Hub Redesign

- [ ] **STAD-HUB-01**: Stadium Guide hub (`/stadiums`) has a refreshed visual layout with a branded header consistent with the site's green identity
- [ ] **STAD-HUB-02**: Stadium cards show team crest, stadium name, city, and capacity (capacity hidden gracefully if null)
- [ ] **STAD-HUB-03**: Hub page has a "Featured Stadiums" section at the top highlighting the most iconic/largest stadiums

### Stadium Detail Page Redesign

- [ ] **STAD-DETAIL-01**: Stadium detail page (`/stadiums/:id`) has a green hero header with a floating team identity card (team logo, stadium name, city, home team — logo floats half-on/half-off the header)
- [ ] **STAD-DETAIL-02**: Stadium detail page uses a 4-tab navigation bar: Transport, Matchday Guide, Food & Drink, Stadium Rules; each tab has a line-art icon
- [ ] **STAD-DETAIL-03**: Transport tab shows a 3-column card grid: Public Transit (metro/bus/train steps), Driving & Parking, and Address (with prominent green "Open in Google Maps" button); collapses to 1-column on mobile
- [ ] **STAD-DETAIL-04**: Matchday Guide tab shows a vertical arrival timeline (e.g., -3h, -2h, 0h) on the left and two pro-tip cards on the right (e.g., "Download the App", "Cashless Stadium")
- [ ] **STAD-DETAIL-05**: Food & Drink tab shows inside-stadium options and local recommendations in a two-column split; food categories use icons; includes a "Find Nearby Pubs" external link/button
- [ ] **STAD-DETAIL-06**: Stadium Rules tab shows bag policy as a checklist with green ✓ / red ✗ icons, and prohibited items as a multi-column list with red ✗ icons; "Important Policies" uses a red-tinted alert header
- [ ] **STAD-DETAIL-07**: Stadium model gains `matchdayGuide`, `foodAndDrink`, and `stadiumRules` JSON fields; Prisma migration runs; `GET /api/stadiums/:id` returns these fields
- [ ] **STAD-DETAIL-08**: All new tab content sections are hidden gracefully (empty state message) when their data is null
- [ ] **STAD-DETAIL-09**: Stadium detail layout is fully responsive; all tab content collapses from multi-column to single-column on mobile

### FanBase Team Page Redesign

- [ ] **FAN-01**: FanBase team page has a redesigned header: team crest, "[Team Name] FanBase" title, "Community tips and experiences from fellow fans" tagline, and a prominent green "+ Add Your Tip" button
- [ ] **FAN-02**: Post type filter renders as horizontal scrollable pills: All, Where to Sit, Local Crowd, Pubs & Food, I'm Going (mapping to existing post types SEAT_TIP, GENERAL, PUB_RECOMMENDATION, IM_GOING)
- [ ] **FAN-03**: Selecting a filter pill shows only posts of that type; "All" shows all post types combined
- [ ] **FAN-04**: Each category shows a contextual empty state when no posts exist ("No posts in this category yet — Be the first to share your experience!")
- [ ] **FAN-05**: "Where to Sit" empty state includes a photo-share placeholder with dashed border, camera icon, and "Share Your Seat" button
- [ ] **FAN-06**: "Pubs & Food" empty state includes a "Recommend a Place" CTA with location pin icon
- [ ] **FAN-07**: "+ Add Your Tip" and category-specific CTA buttons verify authentication before opening the submission modal; unauthenticated users are prompted to sign in
- [ ] **FAN-08**: Getting There tab / section co-exists with the new pill filter system (not removed)

---

## Future Requirements (Deferred)

- Global league expansion (South America, MLS, Asia) — v3.0
- Live scores — v3.0
- FanBase post search / keyword search — v3.0
- Trending posts cross-team feed — v3.0
- Stadium food/drink data via third-party API (e.g., Google Places) — future
- Google One Tap overlay — future minor update
- Push notifications / email match reminders — not yet prioritized

---

## Out of Scope (v2.3)

- In-app ticket purchasing
- PWA / offline support
- Stadium food menu data automated import (manual seeding only in v2.3)
- Matchday Guide timeline data automated import (manual seeding only in v2.3)
- Social graph (follow users, DMs)

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLEAN-01 | Phase 24 | Complete |
| CLEAN-02 | Phase 24 | Complete |
| CLEAN-03 | Phase 24 | Complete |
| CLEAN-04 | Phase 24 | Complete |
| CLEAN-05 | Phase 24 | Complete |
| CLEAN-06 | Phase 24 | Complete |
| CLEAN-07 | Phase 24 | Complete |
| CLEAN-08 | Phase 24 | Complete |
| SEARCH-01 | Phase 25 | Pending |
| SEARCH-02 | Phase 25 | Pending |
| SEARCH-03 | Phase 25 | Pending |
| SEARCH-04 | Phase 25 | Pending |
| SEARCH-05 | Phase 25 | Pending |
| SEARCH-06 | Phase 25 | Pending |
| STAD-DETAIL-01 | Phase 26 | Pending |
| STAD-DETAIL-02 | Phase 26 | Pending |
| STAD-DETAIL-03 | Phase 26 | Pending |
| STAD-DETAIL-04 | Phase 26 | Pending |
| STAD-DETAIL-05 | Phase 26 | Pending |
| STAD-DETAIL-06 | Phase 26 | Pending |
| STAD-DETAIL-07 | Phase 26 | Pending |
| STAD-DETAIL-08 | Phase 26 | Pending |
| STAD-DETAIL-09 | Phase 26 | Pending |
| STAD-HUB-01 | Phase 27 | Pending |
| STAD-HUB-02 | Phase 27 | Pending |
| STAD-HUB-03 | Phase 27 | Pending |
| FAN-01 | Phase 28 | Pending |
| FAN-02 | Phase 28 | Pending |
| FAN-03 | Phase 28 | Pending |
| FAN-04 | Phase 28 | Pending |
| FAN-05 | Phase 28 | Pending |
| FAN-06 | Phase 28 | Pending |
| FAN-07 | Phase 28 | Pending |
| FAN-08 | Phase 28 | Pending |
