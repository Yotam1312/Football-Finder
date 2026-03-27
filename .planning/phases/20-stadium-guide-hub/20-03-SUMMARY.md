---
phase: 20-stadium-guide-hub
plan: 03
subsystem: api
tags: [prisma, express, typescript, stadium-guide]

# Dependency graph
requires:
  - phase: 20-01
    provides: stadium routes and StadiumGuidePage infrastructure
  - phase: 20-02
    provides: StadiumGuidePage with browse flow and frontend filter t.stadiumId != null
provides:
  - getTeamsByLeague returns stadiumId per team derived from home match data
  - STAD-02 Country -> League -> Team -> Stadium browse flow now functional
affects: [StadiumGuidePage, fanbase.controller, STAD-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Derive team attribute from related Match rows using an in-memory Map after bulk fetch (avoids extra query)"

key-files:
  created: []
  modified:
    - backend/src/controllers/fanbase.controller.ts

key-decisions:
  - "stadiumId is derived from the first home match with non-null stadiumId using a Map built from the existing Step 1 match query — no additional DB query added"
  - "Away-only teams (teams with no home matches in the league) correctly receive stadiumId: null"

patterns-established:
  - "Post-query Map enrichment: fetch bulk data, build a Map from it, then attach derived fields to final response objects"

requirements-completed: [STAD-02]

# Metrics
duration: 5min
completed: 2026-03-25
---

# Phase 20 Plan 03: Stadium Guide Hub — stadiumId Derivation Summary

**getTeamsByLeague now derives and returns stadiumId per team from home match data, unblocking the STAD-02 Country -> League -> Team -> Stadium browse flow that was permanently empty**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-25T22:10:00Z
- **Completed:** 2026-03-25T22:14:27Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Fixed the root cause of the empty team grid in Stadium Guide browse: the API never included stadiumId on team objects, so the frontend filter `t.stadiumId != null` excluded every team
- Expanded Step 1 match query to also select `stadiumId` (no extra DB round-trip)
- Built a `stadiumByTeam` Map from home match records to derive each team's primary stadium
- Mapped the team list to attach the derived `stadiumId` (number or null) before sending the response

## Task Commits

Each task was committed atomically:

1. **Task 1: Derive stadiumId per team from home match data** - `53fa708` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `backend/src/controllers/fanbase.controller.ts` - Modified `getTeamsByLeague` to select stadiumId in match query, build stadiumByTeam Map, and return teamsWithStadium

## Decisions Made

- Used an in-memory Map built from the already-fetched Step 1 match rows — no additional Prisma query needed. The Team model has no stadiumId column, so the only way to derive it is from Match records.
- First-encountered home match with non-null stadiumId wins (no orderBy needed — a team's home ground is consistent across matches).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- STAD-02 browse flow (Country -> League -> Team -> Stadium) is now unblocked end-to-end
- The frontend StadiumGuidePage.tsx filter `t.stadiumId != null` will now receive real stadium IDs and render the team grid correctly
- No further backend changes needed for this requirement

---
*Phase: 20-stadium-guide-hub*
*Completed: 2026-03-25*
