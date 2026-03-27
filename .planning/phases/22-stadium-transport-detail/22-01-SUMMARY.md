---
phase: 22-stadium-transport-detail
plan: 01
subsystem: database, api, ui
tags: [prisma, json, haversine, typescript, postgresql]

# Dependency graph
requires:
  - phase: 21-stadium-transport-guide
    provides: Stadium model with flat string transport fields, seed-stadium-transport.ts, getStadiumById controller
provides:
  - 4 new JSON columns on Stadium model (airportTransport, travelTimes, budgetBreakdown, paymentDetails)
  - haversineKm helper and nearbyStadiums logic in getStadiumById
  - AirportTransport, TravelTimes, BudgetBreakdown, PaymentDetails, NearbyStadium frontend interfaces
  - StadiumDetail extended with JSON fields and nearbyStadiums array
  - Seed data with structured JSON for Emirates, Camp Nou/Estadi Olimpic, Allianz Arena, Anfield
affects:
  - 22-02: UI plan that builds the transport detail sections against these types and the extended API response

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Flat string fields and JSON fields coexist on Stadium model — UI prefers JSON when available, falls back to strings
    - Haversine distance formula for geospatial proximity filtering in controller layer
    - paymentDetails used instead of paymentInfo for new JSON field to avoid naming conflict with existing String? field

key-files:
  created:
    - backend/prisma/migrations/20260327082332_phase22_stadium_json_fields/migration.sql
    - backend/prisma/seed-stadium-transport.ts
  modified:
    - backend/prisma/schema.prisma
    - backend/src/controllers/stadium.controller.ts
    - frontend/src/types/index.ts

key-decisions:
  - "Used paymentDetails (not paymentInfo) for the new JSON field because paymentInfo String? already exists on the model — reusing would cause a migration conflict"
  - "haversineKm is a plain function above getStadiumById, not a utility module, to keep the change minimal and co-located"
  - "Nearby stadiums uses an in-memory filter (fetch all with coordinates, Haversine in JS) rather than raw SQL — appropriate for the small number of seeded stadiums"

patterns-established:
  - "JSON transport fields follow the shape: metro (steps, time, cost), taxi (time, cost), rideshare (time, cost, surgeWarning)"
  - "Nearby stadiums: fetch all other stadiums with lat/lng, filter <= 20 km, sort by distance, take 3"

requirements-completed: [STAD-14, STAD-23]

# Metrics
duration: 15min
completed: 2026-03-27
---

# Phase 22 Plan 01: Stadium Transport JSON Fields and Nearby Stadiums Summary

**4 new JSON columns on Stadium model (airportTransport, travelTimes, budgetBreakdown, paymentDetails), Haversine-based nearbyStadiums in getStadiumById, and TypeScript interfaces defined for Plan 02.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-27T08:23:00Z
- **Completed:** 2026-03-27T08:38:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Prisma migration `phase22_stadium_json_fields` adds 4 nullable JSON columns to Stadium (airportTransport, travelTimes, budgetBreakdown, paymentDetails) without naming conflict
- `getStadiumById` extended with `haversineKm` function and nearby stadiums logic — returns up to 3 stadiums within 20 km, sorted by distance rounded to 1 decimal
- Frontend `StadiumDetail` interface extended with 4 new JSON field types and `nearbyStadiums: NearbyStadium[]`
- Seed script updated with structured JSON transport data for all 4 stadiums (Emirates, Estadi Olimpic, Allianz Arena, Anfield)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add JSON fields to Stadium schema + extend backend controller** - `c6c8617` (feat)
2. **Task 2: Update frontend types + extend seed script with structured JSON data** - `76476ed` (feat)

## Files Created/Modified
- `backend/prisma/schema.prisma` - Added airportTransport, travelTimes, budgetBreakdown, paymentDetails Json? fields
- `backend/prisma/migrations/20260327082332_phase22_stadium_json_fields/migration.sql` - Migration for the 4 new columns
- `backend/src/controllers/stadium.controller.ts` - Added haversineKm function and nearbyStadiums logic in getStadiumById
- `backend/prisma/seed-stadium-transport.ts` - Extended all 4 stadium entries with structured JSON transport data
- `frontend/src/types/index.ts` - Added 5 new interfaces (AirportTransport, TravelTimes, BudgetBreakdown, PaymentDetails, NearbyStadium) and extended StadiumDetail

## Decisions Made
- Used `paymentDetails` (not `paymentInfo`) for the JSON field — `paymentInfo String?` already exists so reusing the name would break the migration
- Haversine calculation done in JavaScript after fetching all coordinates-bearing stadiums — correct approach given the small seeded dataset (avoids raw SQL complexity)
- Flat string fields and new JSON fields coexist intentionally — Phase 22 Plan 02 UI will prefer JSON when available and fall back to strings

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All types and interfaces are defined for Plan 02 to build the transport detail UI sections
- `nearbyStadiums` is in the API response and `NearbyStadium` type is defined — Plan 02 can render the nearby stadiums card directly
- Seed script ready to run against DB with: `cd backend && node -r ts-node/register prisma/seed-stadium-transport.ts`

## Self-Check: PASSED

All created/modified files confirmed present. Both task commits (c6c8617, 76476ed) verified in git log.

---
*Phase: 22-stadium-transport-detail*
*Completed: 2026-03-27*
