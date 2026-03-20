---
phase: 09-oauth-foundation
plan: 03
subsystem: api
tags: [bcrypt, express, prisma, typescript, users, profile, password]

# Dependency graph
requires:
  - phase: 09-oauth-foundation plan 01
    provides: User model with passwordHash, googleId, age, country, favoriteClubId, avatarUrl fields
provides:
  - PATCH /api/users/me — partial profile update for authenticated user
  - PATCH /api/users/me/password — password change with current-password verification (email users only)
  - DELETE /api/users/me — account deletion with cookie clear and cascade deletes
affects: [09-05-profile-page, any frontend that needs profile editing or account deletion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Partial update pattern: build updateData object with only provided fields to avoid overwriting with undefined"
    - "Google-account guard: check passwordHash null before allowing password change"
    - "TDD with bcryptjs mock: jest.mock bcryptjs so password tests are fast and deterministic"

key-files:
  created: []
  modified:
    - backend/src/controllers/users.controller.ts
    - backend/src/routes/users.routes.ts
    - backend/src/__tests__/users.test.ts

key-decisions:
  - "updateProfile uses a typed partial updateData object to safely handle optional fields — prevents accidentally nulling fields not in the request body"
  - "changePassword checks passwordHash === null to detect Google-only accounts before any bcrypt comparison"
  - "deleteAccount calls res.clearCookie('token') after prisma.user.delete — session must end immediately after account removal"

patterns-established:
  - "Partial update pattern: build typed partial object, only assign keys that are !== undefined in req.body"
  - "Google-account gate: if (!user.passwordHash) return 400 — use before any password operation"

requirements-completed: [OAUTH-03, OAUTH-04]

# Metrics
duration: 33min
completed: 2026-03-20
---

# Phase 09 Plan 03: Profile Management API Summary

**Three profile management endpoints (update profile fields, change password, delete account) added to users controller with bcrypt password verification and partial-update pattern**

## Performance

- **Duration:** 33 min
- **Started:** 2026-03-20T09:32:31Z
- **Completed:** 2026-03-20T10:05:00Z
- **Tasks:** 2 (Task 1 with TDD: RED + GREEN)
- **Files modified:** 3

## Accomplishments

- `updateProfile` handles partial updates — only fields present in the request body are written to the DB
- `changePassword` rejects Google-only users with 400, verifies currentPassword with bcrypt before allowing change
- `deleteAccount` deletes the user row (cascade handles related records) and clears the auth cookie
- All three routes registered under `/api/users/` with `requireLevel3` guard
- 12 new tests added (18 total in users.test.ts), all passing; full suite 81/81 green

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests for updateProfile, changePassword, deleteAccount** - `652fe5e` (test)
2. **Task 1 GREEN + Task 2: Controller functions and routes** - `877d819` (feat)

_Note: TDD — RED commit first, then GREEN commit with controller + routes together_

## Files Created/Modified

- `backend/src/controllers/users.controller.ts` - Added bcrypt import + three new exported functions (updateProfile, changePassword, deleteAccount)
- `backend/src/routes/users.routes.ts` - Registered PATCH /me, PATCH /me/password, DELETE /me with requireLevel3
- `backend/src/__tests__/users.test.ts` - Added bcryptjs mock, user.update/delete Prisma mocks, 12 new test cases across 3 describe blocks

## Decisions Made

- Used a typed partial `updateData` object in `updateProfile` to handle optional fields cleanly — avoids accidentally passing `undefined` to Prisma which would clear fields not intended for update
- Checked `user.passwordHash === null` before any bcrypt comparison in `changePassword` — Google-only users should never reach the bcrypt call
- Mocked `bcryptjs` in tests with `jest.mock('bcryptjs', ...)` to keep tests fast and avoid real hashing cost in CI

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — tests ran cleanly, TypeScript compiled without errors on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Profile management API is complete; frontend profile page (Plan 05) can now wire up all three endpoints
- `PATCH /me`, `PATCH /me/password`, and `DELETE /me` are all protected and tested
- No blockers for subsequent plans in phase 09

---
*Phase: 09-oauth-foundation*
*Completed: 2026-03-20*
