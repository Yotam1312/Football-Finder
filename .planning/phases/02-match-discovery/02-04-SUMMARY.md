---
phase: 02-match-discovery
plan: "04"
subsystem: backend-api
tags: [api, search, endpoints, normalizeCity, prisma, tdd]
dependency_graph:
  requires:
    - 02-02  # standings sync (TeamStanding table must exist)
    - 02-03  # frontend scaffold (app.ts pattern established)
  provides:
    - GET /api/matches/search — city + date range search returning NS matches
    - GET /api/matches/:id — full match detail with standings
    - normalizeCity() utility exported from backend/src/utils/normalizeCity.ts
  affects:
    - 02-05  # Results page frontend — consumes /api/matches/search
    - 02-06  # Detail page frontend — consumes /api/matches/:id
tech_stack:
  added: []
  patterns:
    - Express router with GET /search before GET /:id to avoid route conflicts
    - Prisma findMany with nested where on related model (stadium.cityNormalized)
    - Promise.all for parallel standing lookups
    - End-of-day normalization (setHours(23,59,59,999)) for inclusive date range queries
key_files:
  created:
    - backend/src/utils/normalizeCity.ts
    - backend/src/controllers/match.controller.ts
    - backend/src/routes/match.routes.ts
  modified:
    - backend/src/app.ts
decisions:
  - "Used default import for prisma (import prisma from '../config/database') because database.ts uses export default — plan interface showed named import but actual module uses default"
  - "Route order: /search registered before /:id so 'search' is not interpreted as a numeric id"
  - "End-of-day toDate normalization ensures matches on the final search day (e.g. 20:00 UTC kick-off) are included"
metrics:
  duration: "~3 minutes"
  completed_date: "2026-03-15"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 02 Plan 04: Match Search and Detail Endpoints Summary

**One-liner:** City + date-range search endpoint and full match detail endpoint with team standings, turning all 10 red test scaffolds green.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create normalizeCity utility and match search/detail endpoints | f36fbac | normalizeCity.ts, match.controller.ts, match.routes.ts, app.ts |
| 2 | Verify detail endpoint and run full backend test suite | — (verification only) | — |

## What Was Built

### normalizeCity utility (`backend/src/utils/normalizeCity.ts`)

Extracts the city normalization logic used in the sync job into a shared utility:
- Decomposes Unicode characters (NFD normalization)
- Strips combining diacritical marks (U+0300–U+036F)
- Lowercases and trims whitespace
- Ensures "München" → "munchen" at search time matches the stored "munchen" in the DB

### Search endpoint (`GET /api/matches/search`)

- Requires `city`, `from`, and `to` query params; returns 400 if any is missing
- Normalizes city using `normalizeCity()` before querying
- Filters by `stadium.cityNormalized`, `matchDate` range, and `status = 'NS'` (upcoming only)
- Sets end-of-day (23:59:59.999) on `to` date to include evening matches on the final day
- Returns `{ matches: [...], total: N }` sorted by `matchDate` ascending

### Detail endpoint (`GET /api/matches/:id`)

- Validates id is numeric; returns 400 for non-numeric (e.g. `/abc`)
- Returns 404 for unknown id
- Includes `homeTeam`, `awayTeam`, `league`, `stadium` via Prisma `include`
- Fetches `homeTeamStanding` and `awayTeamStanding` in parallel via `Promise.all`
- Season capped at 2024 (same cap as sync job for free API-Football tier)
- Standing fields may be null (recently promoted teams, etc.)

### Routes and registration

- `match.routes.ts`: `/search` registered before `/:id` to prevent route conflict
- `app.ts`: `app.use('/api/matches', matchRoutes)` added after admin routes

## Test Results

All 10 tests green across 3 test suites:
- `utils.normalizeCity.test.ts`: 4/4 (lowercase, diacritics, trim, multiple diacritics)
- `match.search.test.ts`: 4/4 (missing city 400, missing from 400, missing to 400, valid params 200)
- `match.detail.test.ts`: 2/2 (non-existent id 404, non-numeric id 400)

TypeScript: `npx tsc --noEmit` exits 0.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used correct default import for prisma**
- **Found during:** Task 1
- **Issue:** Plan interface specified `import { prisma } from '../config/database'` (named import), but `database.ts` uses `export default prisma` (default export). Using the named import would cause a TypeScript/runtime error.
- **Fix:** Used `import prisma from '../config/database'` matching the actual module export
- **Files modified:** `backend/src/controllers/match.controller.ts`
- **Commit:** f36fbac

## Self-Check: PASSED

All created files verified on disk. Task commit f36fbac confirmed in git log.
