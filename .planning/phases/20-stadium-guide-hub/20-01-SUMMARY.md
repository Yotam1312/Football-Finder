---
phase: 20-stadium-guide-hub
plan: "01"
subsystem: frontend-nav + frontend-types + backend-fanbase
tags: [navigation, types, routing, stadium-guide, refactor]
dependency_graph:
  requires: []
  provides: [StadiumSearchResult type, basePath prop on CountryGrid/LeagueList, getNavigateTo prop on TeamGrid, /stadiums routes, stadium guide nav entry]
  affects: [frontend/src/App.tsx, frontend/src/components/Navbar.tsx, frontend/src/components/BottomNav.tsx, frontend/src/types/index.ts]
tech_stack:
  added: []
  patterns: [optional props for component reuse, Navigate redirect for old URLs]
key_files:
  created:
    - frontend/src/pages/StadiumGuidePage.tsx
  modified:
    - frontend/src/types/index.ts
    - frontend/src/components/Navbar.tsx
    - frontend/src/components/BottomNav.tsx
    - frontend/src/App.tsx
    - frontend/src/components/fanbase/CountryGrid.tsx
    - frontend/src/components/fanbase/LeagueList.tsx
    - frontend/src/components/fanbase/TeamGrid.tsx
    - frontend/src/components/fanbase/CreatePostModal.tsx
  deleted:
    - frontend/src/pages/TransportPage.tsx
decisions:
  - Backend stadiumId select reverted: Team model has no stadiumId column in Prisma schema; frontend type kept as forward-looking contract for Plan 02
  - StadiumGuidePage created as placeholder so App.tsx compiles; full implementation deferred to Plan 02
metrics:
  duration_seconds: 278
  completed_date: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 9
---

# Phase 20 Plan 01: Stadium Guide Infrastructure Summary

**One-liner:** Wired stadium guide navigation infrastructure by replacing Transport nav links with Stadium Guide (MapPin icon, /stadiums routes), adding reuse props to CountryGrid/LeagueList/TeamGrid, and exporting StadiumSearchResult type contract.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Add types + reuse props to browse components | 480a4ef | types/index.ts, fanbase.controller.ts, CountryGrid.tsx, LeagueList.tsx, TeamGrid.tsx |
| 2 | Update nav bars, retire TransportPage, register stadium routes | 87d09c3 | Navbar.tsx, BottomNav.tsx, App.tsx, StadiumGuidePage.tsx, (deleted) TransportPage.tsx |

## What Was Built

- **StadiumSearchResult type** exported from `frontend/src/types/index.ts` with all fields Plan 02 needs
- **TeamWithPostCount** extended with `stadiumId: number | null` as forward-looking contract
- **CountryGrid** accepts optional `basePath` prop (defaults to `/fanbase`) for reuse in Stadium Guide hub
- **LeagueList** accepts optional `basePath` prop with same default behavior
- **TeamGrid** accepts optional `getNavigateTo` function prop so Stadium Guide hub can override navigation target
- **Navbar** shows "Stadium Guide" with MapPin icon linking to `/stadiums`
- **BottomNav** shows "Stadiums" tab with MapPin icon linking to `/stadiums`
- **App.tsx** registers three `/stadiums` routes and redirects `/transport` to `/stadiums` via `<Navigate replace />`
- **StadiumGuidePage.tsx** placeholder created so TypeScript compiles; full implementation in Plan 02
- **TransportPage.tsx** deleted from codebase

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-existing unused variable in CreatePostModal.tsx**
- **Found during:** Task 2 build verification
- **Issue:** `photoFile` was declared via `useState` but its read value was never consumed, causing `tsc -b` to fail with TS6133
- **Fix:** Renamed destructured read variable to `_photoFile` with explanatory comment; `setPhotoFile` continues to work normally
- **Files modified:** `frontend/src/components/fanbase/CreatePostModal.tsx`
- **Commit:** 87d09c3

### Plan Requirements Not Fully Met

**1. Backend stadiumId select — reverted (schema mismatch)**
- **Planned:** Add `stadiumId: true` to `getTeamsByLeague` Prisma select
- **Issue:** The `Team` model in `schema.prisma` has no `stadiumId` column. The field exists on the `Match` model, not `Team`. Adding `stadiumId: true` to a Team select causes TS2353.
- **Resolution:** Reverted the backend change. The `stadiumId: number | null` field remains on `TeamWithPostCount` as a forward-looking type contract. Plan 02 will need to derive stadium linkage from a team's home matches (e.g., first home match's stadiumId) rather than a direct Team.stadiumId field.
- **Impact:** Plan 02 implementers must not expect `stadiumId` in the API response from `GET /api/fanbase/leagues/:leagueId/teams`. Stadium linkage requires a different approach.

## Self-Check: PASSED

All key files exist, TransportPage.tsx is deleted, both task commits verified (480a4ef, 87d09c3).
