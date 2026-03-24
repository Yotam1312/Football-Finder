---
phase: 15-transport-db-schema
plan: 01
subsystem: database
tags: [prisma, postgresql, migration, schema]

# Dependency graph
requires:
  - phase: 14-security-match-polish
    provides: stable schema baseline — no pending migrations before this phase
provides:
  - Stadium model with 6 transport fields (nearbyMetros, nearbyTrains, nearbyBuses arrays + 3 nullable text fields)
  - PostType enum with GETTING_THERE value
  - Post model with 3 nullable transport tip fields (transportType, travelCost, travelTime)
  - Prisma migration 20260324161018_phase15_transport_schema applied to Azure PostgreSQL
affects: [17-transport-component, 18-getting-there-fanbase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Batch related schema changes in one migration — both TRANS-02 and TRANS-05 in one prisma migrate dev call"
    - "String[] maps to PostgreSQL TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[] — existing rows get empty arrays, never null"
    - "String? maps to nullable TEXT — safe additive change for existing rows"

key-files:
  created:
    - backend/prisma/migrations/20260324161018_phase15_transport_schema/migration.sql
  modified:
    - backend/prisma/schema.prisma

key-decisions:
  - "transportType stored as String? not an enum — Phase 18 enforces allowed values (Metro/Bus/Train/Taxi/Walking/Other) at application layer, keeps schema flexible"
  - "All new columns are nullable or have empty-array defaults — existing stadium and post rows unaffected"
  - "Prisma client TypeScript types updated in index.d.ts (DLL rename blocked by running server on Windows, non-blocking — types already correct)"

patterns-established:
  - "Pattern: Always use prisma migrate dev (never db push) so migration SQL is generated and replayable on production via prisma migrate deploy"

requirements-completed: [TRANS-02, TRANS-05]

# Metrics
duration: 5min
completed: 2026-03-24
---

# Phase 15 Plan 01: Transport DB Schema Summary

**Prisma migration adding 6 Stadium transport columns (TEXT arrays + nullable TEXT), GETTING_THERE PostType enum value, and 3 nullable Post transport tip columns — applied to Azure PostgreSQL in one migration**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-24T16:09:15Z
- **Completed:** 2026-03-24T16:14:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Stadium model extended with nearbyMetros, nearbyTrains, nearbyBuses (String[] arrays) and walkingTimeFromCenter, publicTransportInfo, parkingInfo (String? nullable)
- PostType enum extended with GETTING_THERE for community transport tip posts
- Post model extended with transportType, travelCost, travelTime (String? nullable) for Getting There post content
- Single migration (20260324161018_phase15_transport_schema) generated and applied to football_finder on Azure — database schema up to date, no pending migrations

## Task Commits

Each task was committed atomically:

1. **Task 1: Edit Prisma schema** - `058fa3a` (feat)
2. **Task 2: Run Prisma migration and verify generated SQL** - `cea0c6c` (feat)

**Plan metadata:** (docs commit — see final commit)

## Files Created/Modified

- `backend/prisma/schema.prisma` - Added 6 Stadium transport fields, GETTING_THERE enum value, 3 Post transport fields
- `backend/prisma/migrations/20260324161018_phase15_transport_schema/migration.sql` - Auto-generated SQL: ALTER TYPE PostType ADD VALUE, ALTER TABLE Stadium ADD COLUMN x6, ALTER TABLE Post ADD COLUMN x3

## Decisions Made

- `transportType` is `String?` not an enum — Phase 18 enforces allowed values (Metro/Bus/Train/Taxi/Walking/Other) at the application layer. Keeps the schema simple and avoids another enum migration if labels change.
- All new columns are nullable (`String?`) or have an implicit empty-array default (`String[]`) — no backfill needed, existing rows unaffected.
- Batched both TRANS-02 (Stadium fields) and TRANS-05 (PostType + Post fields) into a single `prisma migrate dev` call per the STATE.md decision — one migration file, simpler deploy history.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- On Windows, the Prisma client DLL (`query_engine-windows.dll.node`) was locked by the running backend server, preventing `prisma generate` from completing the file rename step. This is a Windows-specific file locking issue. The `index.d.ts` TypeScript types were already updated correctly (confirmed by grepping for `nearbyMetros`, `GETTING_THERE`). The DLL will be replaced on next clean server start or when the file is no longer locked.

## User Setup Required

None — no external service configuration required. Transport data (nearbyMetros, nearbyTrains, etc.) is populated per-stadium by admin via CSV/SQL as noted in STATE.md.

## Next Phase Readiness

- Phase 16 (Guide Redesign, frontend-only): No dependency on this phase — can proceed immediately
- Phase 17 (Transport Component): Stadium model now has all required transport fields — ready to build the stadium transport UI component
- Phase 18 (Getting There FanBase tab): Post model has transportType/travelCost/travelTime and GETTING_THERE enum — ready to build the Getting There tab and post creation form

---
*Phase: 15-transport-db-schema*
*Completed: 2026-03-24*
