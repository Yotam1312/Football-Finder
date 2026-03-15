---
phase: 02-match-discovery
plan: "01"
subsystem: testing
tags: [jest, ts-jest, supertest, typescript, tdd]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Express app (app.ts), backend TypeScript config, Prisma schema

provides:
  - jest + ts-jest + supertest installed in backend devDependencies
  - jest.config.ts with ts-jest preset and node test environment
  - Failing test scaffold for normalizeCity utility (goes green in Plan 02)
  - Failing test scaffold for GET /api/matches/search (goes green in Plan 03)
  - Failing test scaffold for GET /api/matches/:id (goes green in Plan 03)

affects:
  - 02-match-discovery (Plans 02 and 03 must turn these red tests green)

# Tech tracking
tech-stack:
  added: [jest@30, ts-jest@29, @types/jest, supertest@7, @types/supertest]
  patterns: [TDD red-phase scaffolding, ts-jest modern transform config]

key-files:
  created:
    - backend/jest.config.ts
    - backend/src/__tests__/utils.normalizeCity.test.ts
    - backend/src/__tests__/match.search.test.ts
    - backend/src/__tests__/match.detail.test.ts
  modified:
    - backend/package.json

key-decisions:
  - "Used modern ts-jest transform syntax instead of deprecated globals config to eliminate deprecation warnings at test runtime"
  - "Wave 0 pattern: test scaffolds written before implementation so Plans 02/03 have a clear green target"

patterns-established:
  - "Test files live in backend/src/__tests__/ and match pattern **/__tests__/**/*.test.ts"
  - "Integration tests import from ../app — supertest wraps the express instance directly, no server.listen needed"

requirements-completed: [MATCH-02, MATCH-03]

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 2 Plan 01: Test Infrastructure Summary

**jest 30 + ts-jest + supertest installed with three failing test scaffolds covering city normalization, match search, and match detail endpoints**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-15T13:44:35Z
- **Completed:** 2026-03-15T13:47:59Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Installed jest 30, ts-jest 29, supertest 7 and their TypeScript types as devDependencies
- Created `jest.config.ts` with ts-jest preset, node test environment, and modern transform syntax
- Added `"test": "jest"` script to `backend/package.json`
- Created three red-phase test files that describe the exact contracts Plans 02 and 03 must satisfy

## Task Commits

Each task was committed atomically:

1. **Task 1: Install jest + ts-jest and create jest.config.ts** - `733eed4` (chore)
2. **Task 2: Write test scaffolds for normalizeCity, search endpoint, and detail endpoint** - `6489842` (test)

## Files Created/Modified

- `backend/jest.config.ts` - Jest configuration with ts-jest preset and node environment
- `backend/src/__tests__/utils.normalizeCity.test.ts` - Unit tests for city normalization (4 cases: lowercase, diacritics, trim, multiple diacritics)
- `backend/src/__tests__/match.search.test.ts` - Integration tests for GET /api/matches/search (400 on missing params, 200 shape check)
- `backend/src/__tests__/match.detail.test.ts` - Integration tests for GET /api/matches/:id (404 for non-existent, 400 for non-numeric)
- `backend/package.json` - Added jest/supertest devDependencies and test script

## Decisions Made

- Used modern ts-jest `transform` syntax instead of deprecated `globals['ts-jest']` to keep test output clean
- Wave 0 pattern: all tests intentionally fail until Plans 02/03 ship the implementation

## Deviations from Plan

**1. [Rule 1 - Bug] Updated jest.config.ts to use non-deprecated ts-jest transform syntax**
- **Found during:** Task 2 verification
- **Issue:** Original config used `globals: { 'ts-jest': ... }` which generates deprecation warnings on every test run in ts-jest 29+
- **Fix:** Replaced `globals` block with `transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig }] }` per ts-jest docs
- **Files modified:** backend/jest.config.ts
- **Verification:** `npx jest` output shows no deprecation warnings
- **Committed in:** 6489842 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug/warning)
**Impact on plan:** Minor config improvement, no scope change. Tests produce same results.

## Issues Encountered

- `--passWithNoTests` exits 1 once test files exist (as expected for red-phase TDD). The plan's must_haves truth applies to Task 1 state (before test files). This is correct behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Test infrastructure ready; Plans 02 and 03 have clear green targets
- `normalizeCity` tests go green when `backend/src/utils/normalizeCity.ts` is created (Plan 02)
- `match.search` and `match.detail` tests go green when routes are wired (Plan 03)

---
*Phase: 02-match-discovery*
*Completed: 2026-03-15*
