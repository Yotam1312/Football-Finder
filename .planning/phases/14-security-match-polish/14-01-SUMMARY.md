---
phase: 14-security-match-polish
plan: 01
subsystem: api
tags: [middleware, security, api-key, express, jest, supertest, tdd]

requires: []
provides:
  - requireAdminKey middleware that gates POST /api/admin/sync behind an x-admin-api-key header check
  - Three integration tests proving missing/wrong key returns 401 and correct key proceeds
  - ADMIN_API_KEY documented in .env.example
affects: [future admin routes that need key-based auth]

tech-stack:
  added: []
  patterns:
    - "Admin API key auth: x-admin-api-key header checked against ADMIN_API_KEY env var in middleware before handler fires"
    - "TDD: RED test commit before GREEN implementation commit, run full suite after to verify no regressions"

key-files:
  created:
    - backend/src/middleware/adminAuth.middleware.ts
    - backend/src/__tests__/admin.sync.test.ts
  modified:
    - backend/src/routes/admin.routes.ts
    - backend/.env.example

key-decisions:
  - "Used x-admin-api-key request header (not Authorization Bearer) — cleaner for machine-to-machine cron/script callers"
  - "Middleware rejects all requests when ADMIN_API_KEY env var is unset — prevents accidental exposure in unconfigured environments"

patterns-established:
  - "Admin key middleware pattern: read header, compare to env var, 401 if mismatch, next() if match"

requirements-completed: [SEC-01]

duration: 3min
completed: 2026-03-24
---

# Phase 14 Plan 01: Admin Sync Auth Summary

**Express middleware `requireAdminKey` gates POST /api/admin/sync behind an `x-admin-api-key` header so unauthorized callers receive 401 without triggering a database sync**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-24T15:35:11Z
- **Completed:** 2026-03-24T15:37:46Z
- **Tasks:** 1 (TDD: test + implement)
- **Files modified:** 4

## Accomplishments

- Created `requireAdminKey` middleware that compares the `x-admin-api-key` request header to the `ADMIN_API_KEY` env var
- Updated `admin.routes.ts` to insert `requireAdminKey` before `triggerSync` — the sync handler never fires for unauthorized callers
- Three integration tests prove the behavior: missing key returns 401, wrong key returns 401, correct key proceeds
- Documented `ADMIN_API_KEY` in `.env.example` with setup instructions

## Task Commits

1. **RED — admin sync auth tests (failing)** - `4f822df` (test)
2. **GREEN — requireAdminKey middleware + route update + env.example** - `eb86391` (feat)

## Files Created/Modified

- `backend/src/middleware/adminAuth.middleware.ts` — new middleware: reads `x-admin-api-key` header, returns 401 if missing or wrong, calls `next()` if correct
- `backend/src/__tests__/admin.sync.test.ts` — three supertest integration tests for admin sync auth
- `backend/src/routes/admin.routes.ts` — inserted `requireAdminKey` before `triggerSync`
- `backend/.env.example` — added `ADMIN_API_KEY=your_secret_here` with setup comment

## Decisions Made

- Used `x-admin-api-key` header (not `Authorization: Bearer`) — standard for machine-to-machine API key auth where callers are cron jobs or admin scripts, not browser users
- Middleware returns 401 when `ADMIN_API_KEY` env var is unset — prevents unprotected access in environments where the variable was forgotten during deployment

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Jest printed "Cannot log after tests are done" warnings from the async sync service making real API calls after the test process ended. This is a pre-existing issue in the sync service (it makes real network calls, not mocked). It did not affect test results — all 89 tests across 15 suites passed.

## User Setup Required

Set `ADMIN_API_KEY` in:
- Local: add to `backend/.env`
- Azure: App Service -> Configuration -> Application settings -> add `ADMIN_API_KEY`

Callers (cron jobs, scripts) must send the header: `x-admin-api-key: <your-key>`

## Next Phase Readiness

- SEC-01 complete — POST /api/admin/sync is locked down before v2.1 ships
- Ready to proceed to Plan 14-02

---
*Phase: 14-security-match-polish*
*Completed: 2026-03-24*
