---
phase: 05-polish-and-launch
plan: "06"
subsystem: database
tags: [prisma, seed, fanbase, postgresql]

# Dependency graph
requires:
  - phase: 05-01
    provides: auth system with seed-compatible User model (passwordHash nullable)
  - phase: 04
    provides: Post model with all 4 PostType variants and FanBase API
provides:
  - "28 realistic seed posts across 7 major teams in the live database"
  - "5 fictional seed user accounts with @seed.footballfinder.com emails"
  - "Idempotent seed script: re-run safe, skips if already seeded"
affects: [launch, fanbase-browse, cold-start-problem]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Idempotency check via count() on seed-domain emails before any inserts", "prisma.post.createMany with skipDuplicates for batch safety", "ts-node/register to run TypeScript seed outside rootDir"]

key-files:
  created:
    - backend/prisma/seed.ts
  modified: []

key-decisions:
  - "PSG team stored as 'Paris Saint Germain' (no hyphen) not 'Paris Saint-Germain' — searched with 'Saint Germain' for resilience"
  - "Idempotency implemented via count() on @seed.footballfinder.com authorEmail — single check, zero inserts if any seed posts exist"
  - "ts-node/register used directly since prisma/seed.ts is outside tsconfig rootDir (src/)"
  - "PSG posts added as a direct one-off after main seed ran with wrong search term — seed script updated with corrected search term for future re-runs from scratch"

patterns-established:
  - "Seed domain pattern: all seed accounts use @seed.footballfinder.com emails for easy identification and idempotency checking"

requirements-completed:
  - PAGE-05

# Metrics
duration: 15min
completed: 2026-03-17
---

# Phase 05 Plan 06: FanBase Seed Script Summary

**Prisma seed script creating 28 realistic posts and 5 fictional users across 7 major teams (Chelsea, Arsenal, Barcelona, Real Madrid, Bayern Munich, PSG, Juventus) — all 4 PostType variants per team**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-17T21:35:00Z
- **Completed:** 2026-03-17T21:50:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `backend/prisma/seed.ts` — 520-line TypeScript seed script
- 5 seed users upserted with @seed.footballfinder.com emails (passwordHash null — email-only accounts)
- 28 posts created across 7 teams: 4 per team covering SEAT_TIP, PUB_RECOMMENDATION, GENERAL_TIP, IM_GOING
- Idempotency verified: re-running logs "Seed posts already exist (28 found). Skipping."
- All 56 existing tests remain green after seeding

## Task Commits

1. **Task 1: Write and run the FanBase seed script** - `3375c59` (feat)

## Files Created/Modified

- `backend/prisma/seed.ts` - TypeScript seed script; creates 5 users + 28 posts across 7 teams; idempotent via @seed.footballfinder.com email check

## Decisions Made

- PSG team is stored as "Paris Saint Germain" (no hyphen) in the database — the plan's search term `Saint-Germain` (with hyphen) didn't match. Updated seed to search `Saint Germain`.
- Idempotency implemented as a count-before-insert pattern rather than per-post upsert — simpler and avoids needing unique composite keys on seed posts.
- `ts-node/register` used directly (not `ts-node-dev`) since seed.ts is outside the project's `rootDir: ./src` tsconfig boundary.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed PSG team name search term**
- **Found during:** Task 1 execution — seed ran but PSG returned 0 results
- **Issue:** Plan specified `contains: 'Saint-Germain'` (with hyphen) but the database stores the team as "Paris Saint Germain" (no hyphen)
- **Fix:** Updated search term to `Saint Germain` in seed.ts. Added PSG posts directly via a one-off Node script since the main seed had already run (idempotency check would have skipped re-run). Final seed.ts is correct for any fresh run.
- **Files modified:** backend/prisma/seed.ts
- **Verification:** PSG team found (id: 6344), 4 posts created, total confirmed at 28
- **Committed in:** 3375c59 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - team name mismatch)
**Impact on plan:** Essential fix — PSG would have been silently skipped otherwise. No scope creep.

## Issues Encountered

- TypeScript compile error: `Parameters<typeof prisma.post.createMany>[0]['data']` resolved to an ambiguous union type. Fixed by importing `Prisma` namespace and using `Prisma.PostCreateManyInput[]` directly.

## User Setup Required

None - seed runs against the existing connected Azure database. No new environment variables needed.

## Next Phase Readiness

- All 7 major team FanBase pages now have realistic seed content visible immediately on launch
- Seed script is safe to re-run at any time (idempotent)
- Phase 5 is now complete — all 6 plans executed

---
*Phase: 05-polish-and-launch*
*Completed: 2026-03-17*
