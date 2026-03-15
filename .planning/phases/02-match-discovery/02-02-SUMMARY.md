---
phase: 02-match-discovery
plan: "02"
subsystem: database
tags: [prisma, postgresql, api-football, sync, standings]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Prisma schema, DB connection, sync job (runFixtureSync), TRACKED_LEAGUES array
provides:
  - TeamStanding Prisma model with unique constraint [teamId, leagueId, season]
  - ticketUrl nullable field on Match model
  - syncStandings() function wired into runFixtureSync()
  - DB migration: add_team_standing_and_ticket_url
affects:
  - 02-match-discovery (Plan 06 — match detail page reads TeamStanding for team stats)
  - 02-match-discovery (Plan 03/04 — search/detail endpoints may join standings)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Standings upsert pattern: findUnique team/league by apiFootballId, then upsert TeamStanding by composite unique key"
    - "Same error-handling pattern as fixture sync: log and continue on per-league failure"

key-files:
  created:
    - backend/prisma/migrations/20260315_add_team_standing_and_ticket_url/migration.sql
  modified:
    - backend/prisma/schema.prisma
    - backend/src/jobs/sync.service.ts

key-decisions:
  - "syncStandings() reuses TRACKED_LEAGUES and getCurrentSeason() — consistent with fixture sync, no new constants needed"
  - "Standings are fetched after fixtures in runFixtureSync() — single entry point means admin trigger and cron both get standings"
  - "Per-team lookup by apiFootballId inside standings loop — avoids bulk queries, keeps code simple and readable"

patterns-established:
  - "Standings upsert: teamId_leagueId_season composite unique key as Prisma where clause"
  - "Nested API response navigation: response.data?.response?.[0]?.league?.standings?.[0]"

requirements-completed: [MATCH-03, MATCH-04]

# Metrics
duration: 20min
completed: 2026-03-15
---

# Phase 2 Plan 02: TeamStanding Schema and Standings Sync Summary

**TeamStanding Prisma model + migration applied, syncStandings() wired into runFixtureSync() to fetch 2024-season standings from API-Football for all 10 tracked leagues**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-15T14:00:00Z
- **Completed:** 2026-03-15T14:20:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- TeamStanding model added to Prisma schema with composite unique key [teamId, leagueId, season] and teamId index
- ticketUrl nullable String field added to Match model (hides Buy Tickets button when null)
- Migration `add_team_standing_and_ticket_url` applied — both columns/tables confirmed in DB
- syncStandings() function added to sync.service.ts following exact same pattern as fixture sync
- syncStandings() called at end of runFixtureSync() — admin trigger and nightly cron both run standings sync automatically

## Task Commits

Each task was committed atomically:

1. **Task 1: Add TeamStanding model and ticketUrl field to Prisma schema** - `3b881b5` (feat)
2. **Task 2: Add standings sync to nightly job** - `92adc24` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `backend/prisma/schema.prisma` - Added TeamStanding model, ticketUrl on Match, back-relations on Team and League
- `backend/prisma/migrations/20260315_add_team_standing_and_ticket_url/migration.sql` - SQL migration with ALTER TABLE and CREATE TABLE
- `backend/prisma/migrations/migration_lock.toml` - Updated migration lock
- `backend/src/jobs/sync.service.ts` - Added syncStandings() and wired it into runFixtureSync()

## Decisions Made
- syncStandings() reuses TRACKED_LEAGUES (which is the actual name in the codebase — plan referred to it as LEAGUE_IDS) and getCurrentSeason() for consistency with fixture sync
- Standings are fetched after fixture sync in a single runFixtureSync() call — ensures admin trigger and cron job both keep standings current
- Used per-team findUnique lookups inside the standings loop rather than bulk queries — simple, readable, and sufficient for 20 teams per league

## Deviations from Plan

### Auto-fixed Issues

None.

### Notes

The plan referred to the league array as `LEAGUE_IDS`, but the actual codebase variable is `TRACKED_LEAGUES` (an array of objects with `{ id, name, country, timezone }`). The syncStandings() implementation uses `TRACKED_LEAGUES` directly — consistent with the existing codebase.

The plan's main sync function was named `runSync()` but the actual function is `runFixtureSync()`. syncStandings() was correctly wired into `runFixtureSync()`.

Both schema changes (`TeamStanding` model and `ticketUrl` on Match) were already present in the schema file before this plan executed — they had been added to the schema ahead of the migration. The migration and Prisma client regeneration were also already applied. Task 1 consisted of committing these pre-existing changes.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required. Standings will populate automatically on the next admin sync trigger or nightly cron run (requires API_FOOTBALL_KEY environment variable, already configured in Phase 1).

## Next Phase Readiness
- TeamStanding table in DB, Prisma client has `prisma.teamStanding` available
- After one sync run (admin trigger or nightly cron), standings will be populated with 2024-season data for all 10 leagues
- Plan 06 (match detail page) can query TeamStanding via `prisma.teamStanding.findFirst({ where: { teamId, leagueId, season } })`
- ticketUrl field on Match is ready — defaults to null; no affiliate integration needed until Phase 5+

---
*Phase: 02-match-discovery*
*Completed: 2026-03-15*
