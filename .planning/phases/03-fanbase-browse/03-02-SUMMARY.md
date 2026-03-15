---
phase: 03-fanbase-browse
plan: 02
subsystem: ui
tags: [react, typescript, tanstack-query, hooks, types]

# Dependency graph
requires:
  - phase: 03-fanbase-browse-01
    provides: 6 FanBase API endpoints that these hooks call

provides:
  - TeamWithPostCount, TeamSearchResult, PostType, Post interfaces in types/index.ts
  - toSlug() utility for URL slug generation
  - formatRelativeTime() utility for human-readable post ages
  - useFanbaseCountries hook — GET /api/fanbase/countries
  - useFanbaseLeagues hook — GET /api/fanbase/countries/:country/leagues
  - useFanbaseTeams hook — GET /api/fanbase/leagues/:leagueId/teams
  - useFanbaseTeamSearch hook — debounced GET /api/fanbase/teams/search
  - useFanbaseTeam hook — GET /api/fanbase/team/:teamId
  - useFanbasePosts hook — GET /api/fanbase/team/:teamId/posts
affects: [03-fanbase-browse-03, 03-fanbase-browse-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TanStack Query v5 hook pattern — queryKey namespaced under 'fanbase', no onSuccess/onError callbacks
    - Debounce via useEffect + setTimeout + clearTimeout cleanup (no external library)
    - enabled: Boolean(param) guard on all hooks with optional params

key-files:
  created:
    - frontend/src/utils/toSlug.ts
    - frontend/src/hooks/useFanbaseCountries.ts
    - frontend/src/hooks/useFanbaseLeagues.ts
    - frontend/src/hooks/useFanbaseTeams.ts
    - frontend/src/hooks/useFanbaseTeamSearch.ts
    - frontend/src/hooks/useFanbaseTeam.ts
    - frontend/src/hooks/useFanbasePosts.ts
  modified:
    - frontend/src/types/index.ts
    - frontend/src/utils/formatDate.ts

key-decisions:
  - "Debounce implemented with useEffect + setTimeout/clearTimeout — no external library needed for this simple 300ms delay"
  - "useFanbaseTeamSearch fires only when debouncedQuery.length >= 2 — matches backend validation rule"
  - "useFanbaseTeam throws distinct 'Team not found' error on 404 for page-level error handling"
  - "useFanbasePosts includes postType and page in queryKey so TanStack Query auto-refetches on tab/page change"

patterns-established:
  - "All FanBase hooks namespaced under ['fanbase', ...] queryKey prefix for cache isolation"
  - "Optional param hooks always guard with enabled: Boolean(param) to prevent undefined in fetch URL"

requirements-completed: [FAN-01, FAN-02, FAN-03, FAN-04, FAN-05]

# Metrics
duration: 10min
completed: 2026-03-15
---

# Phase 3 Plan 02: FanBase Types and Data-Fetching Hooks Summary

**6 TanStack Query hooks plus FanBase types (Post, PostType, TeamWithPostCount, TeamSearchResult) and two utility functions wiring the frontend fetch layer to Phase 3's API endpoints**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-15T15:48:00Z
- **Completed:** 2026-03-15T15:58:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Added 4 FanBase-specific TypeScript interfaces/types to types/index.ts without modifying existing types
- Created toSlug.ts for URL slug generation and added formatRelativeTime to formatDate.ts
- Created all 6 TanStack Query v5 hooks with proper enabled guards and no deprecated v4 callbacks
- useFanbaseTeamSearch implements debounce with useEffect + clearTimeout cleanup — no external dependency

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend types, add toSlug utility, add formatRelativeTime** - `74e8ebf` (feat)
2. **Task 2: Create all 6 TanStack Query hooks for FanBase data fetching** - `922d502` (feat)

## Files Created/Modified
- `frontend/src/types/index.ts` — Added TeamWithPostCount, TeamSearchResult, PostType, Post
- `frontend/src/utils/toSlug.ts` — New file: converts display strings to URL-safe slugs
- `frontend/src/utils/formatDate.ts` — Added formatRelativeTime for post age display
- `frontend/src/hooks/useFanbaseCountries.ts` — Fetches country list with 10min staleTime
- `frontend/src/hooks/useFanbaseLeagues.ts` — Fetches leagues by country, enabled guard
- `frontend/src/hooks/useFanbaseTeams.ts` — Fetches teams by leagueId with post counts
- `frontend/src/hooks/useFanbaseTeamSearch.ts` — Debounced search, fires at 2+ chars
- `frontend/src/hooks/useFanbaseTeam.ts` — Fetches single team, handles 404 distinctly
- `frontend/src/hooks/useFanbasePosts.ts` — Fetches posts with type filter and pagination

## Decisions Made
- Debounce implemented with native useEffect + setTimeout/clearTimeout — no external library needed for this simple 300ms delay
- useFanbaseTeamSearch fires only when debouncedQuery.length >= 2, matching the backend 400 validation rule
- useFanbaseTeam throws distinct 'Team not found' error on 404 so the page can render a specific error message
- useFanbasePosts includes postType and page in queryKey so TanStack Query automatically re-fetches when user switches tabs or pages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 6 hooks are importable by FanBasePage (03-03) and TeamFanBasePage (03-04)
- Types in types/index.ts match the API response shapes from 03-01 exactly
- TypeScript compiles with zero errors (`npx tsc --noEmit` exits 0)
- Plans 03-03 and 03-04 can now import hooks directly without implementing them

---
*Phase: 03-fanbase-browse*
*Completed: 2026-03-15*
