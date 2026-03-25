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
- [ ] **STAD-03**: User can reach a stadium's page from the match detail page via a "Stadium Guide" link
- [ ] **STAD-04**: User can reach a stadium's page from a team's FanBase page via a "Stadium Guide" link

### Stadium Page

- [ ] **STAD-05**: Stadium page shows stadium name, hosting team (with crest), and city
- [ ] **STAD-06**: Stadium page shows an embedded OpenStreetMap map using the stadium's stored lat/lng coordinates
- [ ] **STAD-07**: Stadium page shows a Navigate button that opens Google Maps directions to the stadium
- [ ] **STAD-08**: Stadium page shows transport options: nearby metro/train/bus lines, walking time from centre, general transport tip, and parking info
- [ ] **STAD-09**: Stadium page shows the top 5 Pub Recommendation posts from the team's FanBase, ordered by upvotes
- [ ] **STAD-10**: Stadium page shows the top 5 Getting There posts from the team's FanBase, ordered by upvotes

### Infrastructure

- [x] **STAD-11**: Stadium records in the database include `latitude` and `longitude` coordinate fields (populated via SQL/CSV)
- [x] **STAD-12**: Backend exposes a stadium search endpoint (search by team name or stadium name) and a stadium detail endpoint (returning transport data and top FanBase posts)

### Navigation

- [x] **STAD-13**: The Stadium Guide hub replaces the Transportation Guide link in the navbar and bottom navigation bar (old `/transportation-guide` page is removed)

---

## Future Requirements (deferred)

- User-submitted corrections to stadium data (address, transport info)
- Stadium capacity and founding year on stadium page
- Photo gallery for stadiums (fan-submitted)
- "Nearby stadiums" section on stadium page
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
| STAD-03 | Phase 22 | — | pending |
| STAD-04 | Phase 22 | — | pending |
