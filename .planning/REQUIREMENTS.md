---
milestone: v2.2
name: Stadium Guide
version: 1.0
created: 2026-03-25
---

# Milestone v2.2 — Stadium Guide Requirements

## Overview

Transform the generic Transportation Guide page into a structured Stadium Guide directory. Every stadium gets its own page with an embedded map, transport data, and community content pulled from FanBase. Users can find any stadium via search or Country → League → Team browse.

---

## Requirements

### Discovery

- [x] **STAD-01**: User can search for a stadium by typing a team or stadium name from the Stadium Guide hub and see matching results
- [x] **STAD-02**: User can browse to a stadium via Country → League → Team navigation from the Stadium Guide hub

### Stadium Page

- [x] **STAD-05**: Stadium page shows stadium name, hosting team (with crest), and city
- [x] **STAD-06**: Stadium page shows an embedded OpenStreetMap map using the stadium's stored lat/lng coordinates
- [x] **STAD-07**: Stadium page shows a Navigate button that opens Google Maps directions to the stadium
- [x] **STAD-08**: Stadium page shows transport options: nearby metro/train/bus lines, walking time from centre, general transport tip, and parking info
- [x] **STAD-09**: Stadium page shows the top 5 Pub Recommendation posts from the team's FanBase, ordered by upvotes
- [x] **STAD-10**: Stadium page shows the top 5 Getting There posts from the team's FanBase, ordered by upvotes

### Infrastructure

- [x] **STAD-11**: Stadium records in the database include `latitude` and `longitude` coordinate fields (populated via SQL/CSV)
- [x] **STAD-12**: Backend exposes a stadium search endpoint (search by team name or stadium name) and a stadium detail endpoint (returning transport data and top FanBase posts)

### Navigation

- [x] **STAD-13**: The Stadium Guide hub replaces the Transportation Guide link in the navbar and bottom navigation bar (old `/transportation-guide` page is removed)

### Stadium Transport Detail — Extended Sections (Phase 22)

- [x] **STAD-14**: Stadium model gains JSON fields: `airportTransport`, `travelTimes`, `paymentInfo`, `proTips`, `recommendedApps`, `budgetBreakdown`; migration runs cleanly and the detail endpoint returns them
- [ ] **STAD-15**: Stadium detail page shows an "From Airport" section with metro route steps/time/cost, taxi cost/time, and Uber/Bolt cost/time and surge warning
- [ ] **STAD-16**: Stadium detail page shows a "Travel Times" section with from-city-centre times for metro, bus, taxi, and walking
- [ ] **STAD-17**: Stadium detail page shows a "Payment & Tickets" section with accepted card types, recommended travel cards, and tips
- [ ] **STAD-18**: Stadium detail page shows a "Pro Tips" section listing practical advice (arrive early, best metro line, surge pricing, last train check)
- [ ] **STAD-19**: Stadium detail page shows a "Recommended Apps" section listing local metro app, Google Maps, Uber/Bolt
- [ ] **STAD-20**: Stadium detail page shows a "Budget Breakdown" section with budget/standard/comfort tiers and cost ranges
- [ ] **STAD-21**: Stadium detail page shows a "Community Tips" section with the top 3 FanBase "Getting There" posts and a "View all tips in FanBase →" link to `/fanbase/[team-slug]?tab=getting-there`
- [ ] **STAD-22**: Stadium detail page includes an interactive map (Leaflet + OpenStreetMap tiles) showing the stadium marker; transport stop markers shown only when coordinate data is available (Phase 22 ships stadium marker only)
- [x] **STAD-23**: Stadium detail page shows a "Nearby Stadiums" section with up to 3 stadiums within 20 km, each linking to their own stadium page
- [ ] **STAD-24**: All new sections are hidden gracefully (no broken UI) when their data fields are null or empty

---

## Future Requirements (deferred)

- User-submitted corrections to stadium data (address, transport info)
- Stadium capacity and founding year on stadium page
- Photo gallery for stadiums (fan-submitted)
- Stadium-scoped posts (separate from team FanBase) — currently FanBase posts are used instead

---

## Out of Scope

- Google Maps Embed API (requires billing) — using OpenStreetMap iframe (free)
- Stadium ticket sales integration — commercial deals required
- Live stadium occupancy / attendance data
- Stadium virtual tours

---

## Traceability

| REQ-ID | Phase | Plan | Status |
|--------|-------|------|--------|
| STAD-11 | Phase 19 | — | pending |
| STAD-12 | Phase 19 | — | pending |
| STAD-01 | Phase 20 | — | pending |
| STAD-02 | Phase 20 | — | pending |
| STAD-13 | Phase 20 | — | pending |
| STAD-05 | Phase 21 | — | pending |
| STAD-06 | Phase 21 | — | pending |
| STAD-07 | Phase 21 | — | pending |
| STAD-08 | Phase 21 | — | pending |
| STAD-09 | Phase 21 | — | pending |
| STAD-10 | Phase 21 | — | pending |
| STAD-14 | Phase 22 | — | pending |
| STAD-15 | Phase 22 | — | pending |
| STAD-16 | Phase 22 | — | pending |
| STAD-17 | Phase 22 | — | pending |
| STAD-18 | Phase 22 | — | pending |
| STAD-19 | Phase 22 | — | pending |
| STAD-20 | Phase 22 | — | pending |
| STAD-21 | Phase 22 | — | pending |
| STAD-22 | Phase 22 | — | pending |
| STAD-23 | Phase 22 | — | pending |
| STAD-24 | Phase 22 | — | pending |
