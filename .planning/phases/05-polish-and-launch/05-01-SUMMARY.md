---
phase: 05-polish-and-launch
plan: 01
subsystem: auth
tags: [prisma, postgresql, bcrypt, jwt, express, tdd]

# Dependency graph
requires:
  - phase: 04-auth-and-posting
    provides: auth controller with setAuthCookie helper, login/logout/me endpoints, bcryptjs, jwt cookie pattern
provides:
  - POST /api/auth/register endpoint — creates Level 3 accounts with email+password+name
  - User.age and User.favoriteClubId fields in PostgreSQL (migration applied)
  - Hybrid email-verify-per-post system retired (request-post, verify/:token, resend removed)
affects: [05-02, frontend-auth, registration-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-level auth: Guest (no cookie) + Registered (Level 3 with password) — hybrid Level 2 retired"
    - "Register endpoint returns 201 + sets httpOnly JWT cookie immediately (no email verification step)"
    - "Optional fields (age, favoriteClubId) passed through parseInt to ensure Int type stored in DB"

key-files:
  created:
    - backend/prisma/migrations/20260317210109_add_user_registration_fields/migration.sql
  modified:
    - backend/prisma/schema.prisma
    - backend/src/controllers/auth.controller.ts
    - backend/src/routes/auth.routes.ts
    - backend/src/__tests__/auth.test.ts

key-decisions:
  - "Hybrid three-level auth fully retired — requestPost, verifyToken, resendVerification removed from controller and routes"
  - "register() issues Level 3 cookie immediately — no email verification step in new auth model"
  - "age and favoriteClubId stored as null when not provided — parseInt guards against string inputs from form data"
  - "VerificationToken table left in schema (no migration cost, harmless to keep for historical data)"

patterns-established:
  - "New user registration: POST /api/auth/register — validates, hashes password with bcrypt(10), creates user, issues JWT cookie"

requirements-completed: [PAGE-05]

# Metrics
duration: 3min
completed: 2026-03-17
---

# Phase 5 Plan 01: Auth Backend Overhaul Summary

**Replaced hybrid email-verify-per-post system with direct registration: new POST /api/auth/register endpoint, User model extended with age and favoriteClubId, three hybrid endpoints removed**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-17T21:00:35Z
- **Completed:** 2026-03-17T21:03:48Z
- **Tasks:** 2
- **Files modified:** 5 (schema.prisma, migration.sql, auth.controller.ts, auth.routes.ts, auth.test.ts)

## Accomplishments

- Prisma schema updated with age (Int?) and favoriteClubId (Int?) on User, plus FavoriteClub relation to Team — migration applied to Azure PostgreSQL
- POST /api/auth/register implemented: validates required fields, checks for duplicate email (409), hashes password with bcrypt(10), creates user, issues Level 3 JWT cookie immediately
- Three hybrid endpoints (request-post, verify/:token, resend) removed from both controller and routes — those paths now return 404
- Auth test suite updated: 9 tests all passing, covering register success/409/400 and removed endpoint 404s

## Task Commits

Each task was committed atomically:

1. **Task 1: Prisma schema migration — add age and favoriteClubId to User** - `0760643` (feat)
2. **Task 2: register endpoint + remove hybrid endpoints + update tests** - `a4043c5` (feat)

## Files Created/Modified

- `backend/prisma/schema.prisma` - Added age, favoriteClubId, favoriteClub relation to User; usersWithFavorite back-relation to Team
- `backend/prisma/migrations/20260317210109_add_user_registration_fields/migration.sql` - Migration SQL applied to Azure PostgreSQL
- `backend/src/controllers/auth.controller.ts` - Added register(), removed requestPost/verifyToken/resendVerification; also removed unused imports (createVerificationToken, sendVerificationEmail)
- `backend/src/routes/auth.routes.ts` - Added POST /register; removed /request-post, /verify/:token, /resend routes
- `backend/src/__tests__/auth.test.ts` - Replaced hybrid endpoint tests with register tests + 404 removal tests; added user.create mock

## Decisions Made

- Hybrid three-level auth fully retired: requestPost, verifyToken, resendVerification removed entirely from controller and routes. Those paths return 404 which is the correct signal that the feature no longer exists.
- register() issues Level 3 cookie immediately — no email verification step in the new simplified auth model.
- age and favoriteClubId use parseInt guards when converting form data strings to integers, stored as null when omitted.
- VerificationToken table left in schema (no migration cost, harmless for historical data and potential future use).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npx jest --testPathPattern=auth` failed with "Option replaced by --testPathPatterns" error in the installed Jest version. Used `npx jest auth` (positional pattern) instead — worked correctly.

## User Setup Required

None - no external service configuration required. Migration was applied automatically to the Azure PostgreSQL database during task execution.

## Next Phase Readiness

- Register endpoint live and tested — frontend registration UI (Plan 05-02) can now wire up to POST /api/auth/register
- Login endpoint unchanged and working — returning users can log in normally
- Hybrid flow fully removed — no dead code paths remain in the auth surface

---
*Phase: 05-polish-and-launch*
*Completed: 2026-03-17*
