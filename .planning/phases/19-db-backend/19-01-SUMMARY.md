---
phase: 19-db-backend
plan: 01
subsystem: database, api
tags: [prisma, postgres, express, typescript, stadium, search]

# Dependency graph
requires: []
provides:
  - "Stadium model with latitude Float? and longitude Float? columns (STAD-11)"
  - "Prisma migration: 20260325202842_add_stadium_coordinates"
  - "GET /api/stadiums/search?q= endpoint returning up to 10 stadiums with team crest (STAD-12)"
  - "Placeholder GET /api/stadiums/:id returning 501 (for Plan 02)"
  - "Integration tests: 6 passing tests for the search endpoint"
affects: [19-02, 20-frontend-stadium, 21-map-embed]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stadium routes follow match.routes.ts pattern — specific /search before parameterized /:id"
    - "Stadium controller follows fanbase.controller.ts pattern — explicit try/catch, prisma import"
    - "Search controller maps nested Prisma includes to flat response shape before returning JSON"

key-files:
  created:
    - backend/prisma/migrations/20260325202842_add_stadium_coordinates/migration.sql
    - backend/src/routes/stadium.routes.ts
    - backend/src/controllers/stadium.controller.ts
    - backend/src/__tests__/stadium.search.test.ts
  modified:
    - backend/prisma/schema.prisma
    - backend/src/app.ts

key-decisions:
  - "latitude/longitude added as Float? (nullable) so existing rows stay valid — user populates via CSV/SQL"
  - "Search uses Prisma OR: stadium name OR team name via relation, single query (no N+1)"
  - "Cap at take: 10, orderBy name asc per STAD-12 spec"
  - "getStadiumById returns 501 stub — implemented in Plan 02 to keep plans atomic"

patterns-established:
  - "Stadium endpoint pattern: routes file with /search before /:id to prevent Express shadowing"

requirements-completed: [STAD-11, STAD-12]

# Metrics
duration: 15min
completed: 2026-03-25
---

# Phase 19 Plan 01: Stadium Lat/Lng Migration and Search Endpoint Summary

**Prisma Stadium model extended with nullable lat/lng Float fields and GET /api/stadiums/search endpoint delivering case-insensitive name/team search, max 10 results, with team crest — 6 integration tests all green**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-25T20:15:00Z
- **Completed:** 2026-03-25T20:30:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added `latitude Float?` and `longitude Float?` to Prisma Stadium model with `@@index([name])`
- Migration `20260325202842_add_stadium_coordinates` applied to Azure PostgreSQL — existing rows get NULL
- Created `GET /api/stadiums/search?q=` endpoint: validates q, OR-queries by stadium name + home team name, returns max 10 ordered by name asc, each result includes team crest
- Registered `/api/stadiums` route prefix in `app.ts`
- 6 integration tests written and passing (400 on missing/empty q, 200 with array, correct shape, empty result, no auth required)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add lat/lng to Stadium model and create search endpoint with route scaffold** - `f3ecefe` (feat)
2. **Task 2: Write integration tests for stadium search endpoint** - `9597f44` (test)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `backend/prisma/schema.prisma` - Added latitude, longitude Float? fields and @@index([name])
- `backend/prisma/migrations/20260325202842_add_stadium_coordinates/migration.sql` - Migration SQL
- `backend/src/routes/stadium.routes.ts` - Stadium route definitions (/search before /:id)
- `backend/src/controllers/stadium.controller.ts` - searchStadiums and getStadiumById stub
- `backend/src/app.ts` - Registered /api/stadiums route prefix
- `backend/src/__tests__/stadium.search.test.ts` - 6 integration tests for the search endpoint

## Decisions Made
- latitude/longitude are `Float?` (nullable) so all existing stadium rows remain valid without data migration — user populates coordinates later via CSV/SQL as noted in STATE.md pending todos
- Search uses a single Prisma `findMany` with Prisma OR combining stadium name match and team name match via `matches.some.homeTeam.name` — avoids N+1 queries
- `getStadiumById` is a 501 stub so the routes file compiles and the endpoint is reserved for Plan 02

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Windows file-lock warning during `prisma migrate dev --generate` (EPERM rename on query_engine DLL) — this is a known Windows issue when another process holds the DLL. The migration and DB schema update completed successfully; the client regeneration warning is cosmetic.

## User Setup Required
None - no external service configuration required. Lat/lng coordinates can be populated by the user via SQL/CSV after this migration as documented in STATE.md.

## Next Phase Readiness
- Stadium search endpoint is live and tested — ready for frontend integration in Phase 20
- Plan 02 can implement `getStadiumById` (currently returns 501) — route and controller file already exist
- Coordinates columns exist and are null — user can populate via `UPDATE stadiums SET latitude = ..., longitude = ... WHERE name = ...`

---
## Self-Check: PASSED

All files verified present. All commits verified in git log.

- `backend/prisma/schema.prisma` — FOUND
- `backend/src/routes/stadium.routes.ts` — FOUND
- `backend/src/controllers/stadium.controller.ts` — FOUND
- `backend/src/__tests__/stadium.search.test.ts` — FOUND
- `.planning/phases/19-db-backend/19-01-SUMMARY.md` — FOUND
- commit f3ecefe — FOUND
- commit 9597f44 — FOUND

*Phase: 19-db-backend*
*Completed: 2026-03-25*
