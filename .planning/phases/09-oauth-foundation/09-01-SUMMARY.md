---
phase: 09-oauth-foundation
plan: 01
subsystem: database
tags: [prisma, postgresql, oauth, google-oauth, migration, schema]

# Dependency graph
requires:
  - phase: 08-nyquist-compliance
    provides: stable v1.0 schema baseline and all prior migrations applied
provides:
  - User model with googleId (unique, nullable), avatarUrl, country columns
  - Cascade delete rules: Upvote and UserFavorite deleted with their User
  - SetNull delete rule: Post.userId set to null when User is deleted
  - VerificationToken table dropped from schema and database
  - User table truncated (clean slate for OAuth flow)
  - set-password route removed from auth.routes.ts
affects: [09-oauth-foundation plan 02, all plans using User model]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "onDelete: Cascade on user-owned join table relations (Upvote, UserFavorite)"
    - "onDelete: SetNull on user-authored content relations (Post) — posts survive user deletion as anonymous"
    - "Manually authored migration SQL + prisma migrate deploy for non-interactive environments"

key-files:
  created:
    - backend/prisma/migrations/20260319200000_phase9_oauth_schema/migration.sql
  modified:
    - backend/prisma/schema.prisma
    - backend/src/routes/auth.routes.ts
    - backend/src/lib/token.helpers.ts

key-decisions:
  - "Used prisma migrate deploy (non-interactive) instead of migrate dev — Claude Code shell environment does not allocate a TTY, which prisma migrate dev requires"
  - "Authored migration SQL manually to match exact Prisma-generated format, then applied with migrate deploy — clean alternative for CI/non-interactive environments"
  - "Replaced token.helpers.ts content with a comment stub rather than deleting — preserves file history and explains the removal for future reference"
  - "Left setPassword function in auth.controller.ts — plan specifies removal in Plan 02 when auth.controller.ts is rewritten; route removal is sufficient to make it unreachable now"

patterns-established:
  - "Schema migration workflow for non-interactive environments: write SQL to migrations/<timestamp>_<name>/migration.sql, then npx prisma migrate deploy"

requirements-completed: [OAUTH-01, OAUTH-02, OAUTH-03, OAUTH-04]

# Metrics
duration: 51min
completed: 2026-03-19
---

# Phase 9 Plan 01: OAuth Schema Foundation Summary

**PostgreSQL schema migrated to support Google OAuth: googleId/avatarUrl/country added to User, cascade delete rules fixed on Upvote/UserFavorite/Post, VerificationToken table dropped, User table truncated to zero rows**

## Performance

- **Duration:** 51 min
- **Started:** 2026-03-19T20:01:42Z
- **Completed:** 2026-03-19T20:52:00Z
- **Tasks:** 2 (Task 1 was a human-action checkpoint resolved before execution)
- **Files modified:** 4

## Accomplishments
- User model updated with `googleId` (unique, nullable), `avatarUrl`, `country` columns — all three required for the OAuth flow in Plan 02
- Delete cascade rules corrected: `Upvote` and `UserFavorite` cascade-delete with their user; `Post.userId` is set to null (posts survive anonymously)
- `VerificationToken` table dropped from both schema and database (the email-based Level 2 flow is replaced by Google OAuth)
- User table truncated to 0 rows — clean slate before the OAuth user creation flow is wired up in Plan 02
- `set-password` route removed from `auth.routes.ts` — the Level 2 upgrade path is gone
- TypeScript compiles cleanly; backend starts without errors

## Task Commits

Each task was committed atomically:

1. **Task 2: Update schema.prisma** - `73f2c94` (feat)
2. **Task 3: Run migration, truncate users, remove set-password route** - `9fad2d9` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `backend/prisma/schema.prisma` - User model updated; VerificationToken model removed; onDelete rules added to Post, Upvote, UserFavorite
- `backend/prisma/migrations/20260319200000_phase9_oauth_schema/migration.sql` - Hand-authored migration SQL for non-interactive apply
- `backend/src/routes/auth.routes.ts` - set-password route removed
- `backend/src/lib/token.helpers.ts` - Dead code replaced with explanatory comment stub

## Decisions Made
- **prisma migrate deploy instead of migrate dev:** Claude Code's shell does not allocate a TTY, which `prisma migrate dev` strictly requires. Authored the migration SQL manually and applied it with `prisma migrate deploy` (the standard non-interactive path).
- **token.helpers.ts as stub:** Nothing imported `createVerificationToken`, so the file was dead. Replaced the broken Prisma reference with a comment explaining the removal rather than deleting the file — keeps the git history readable.
- **setPassword function retained in controller:** The plan explicitly says to leave it in `auth.controller.ts` until Plan 02 rewrites that file. With no route pointing to it, it is unreachable.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced broken prisma.verificationToken reference in token.helpers.ts**
- **Found during:** Task 3 (TypeScript compile check after migration)
- **Issue:** `backend/src/lib/token.helpers.ts` called `prisma.verificationToken.create()` — after the VerificationToken model was dropped from the schema, this caused `TS2339: Property 'verificationToken' does not exist on type 'PrismaClient'`
- **Fix:** File had no importers (confirmed via grep), so replaced its body with a comment stub explaining the removal
- **Files modified:** `backend/src/lib/token.helpers.ts`
- **Verification:** `npx tsc --noEmit` passed with zero errors
- **Committed in:** 9fad2d9 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking TypeScript error)
**Impact on plan:** Required fix to achieve a clean TypeScript compile. No scope creep — the file was dead code whose broken reference had to be cleared.

## Issues Encountered
- `npx prisma migrate dev` is non-interactive and failed in the Claude Code shell environment (no TTY allocation). Resolved by writing the migration SQL manually and applying with `npx prisma migrate deploy` — the correct non-interactive path for CI-like environments.

## Next Phase Readiness
- Schema is fully prepared for Plan 02: `passport-google-oauth20` strategy implementation and OAuth callback route
- User table is empty and has all required columns (`googleId`, `avatarUrl`, `country`)
- `auth.routes.ts` has stub hooks ready for Google OAuth routes (to be added in Plan 02)
- No blockers for Plan 02

## Self-Check: PASSED

All files verified present. All task commits verified in git log.

---
*Phase: 09-oauth-foundation*
*Completed: 2026-03-19*
