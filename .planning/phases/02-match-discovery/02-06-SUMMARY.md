---
phase: 02-match-discovery
plan: "06"
subsystem: ui
tags: [react, tanstack-query, framer-motion, tailwind, typescript]

# Dependency graph
requires:
  - phase: 02-match-discovery
    provides: match detail API endpoint (GET /api/matches/:id with homeTeamStanding + awayTeamStanding)
  - phase: 02-match-discovery
    provides: shared utilities (buildMapsUrl, formatMatchDate, formatMatchTime, TeamLogo)
provides:
  - useMatchDetail TanStack Query hook fetching GET /api/matches/:id
  - StatBar component for side-by-side team league stats comparison
  - MatchDetailPage with hero, info tiles, conditional Buy Tickets, Navigate to Stadium, FanBase links, and StatBar
  - Phase 2 fully complete — all 6 MATCH requirements delivered
affects: [03-fanbase, 04-media, 05-launch]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TanStack Query useQuery hook with enabled guard (enabled: Boolean(id)) prevents query on undefined id
    - Conditional rendering via ticketUrl && ... — Buy Tickets hidden when ticketUrl is null
    - Framer Motion fade+slide animation on hero section
    - StatBar renders null when both standings are null (no empty card shown)
    - Loading skeleton with animate-pulse for perceived performance

key-files:
  created:
    - frontend/src/hooks/useMatchDetail.ts
    - frontend/src/components/StatBar.tsx
    - frontend/src/pages/MatchDetailPage.tsx
  modified: []

key-decisions:
  - "StatBar returns null early when both homeStanding and awayStanding are null — avoids showing an empty stats card for untracked teams"
  - "season capped at Math.min(currentYear - 1, 2024) client-side to match backend cap — consistent display across free API plan"
  - "Navigate to Stadium falls back to buildMapsUrl when googleMapsUrl is null — graceful degradation for all venues"

patterns-established:
  - "Match detail page pattern: useParams id -> useMatchDetail hook -> render hero + tiles + actions + stats"
  - "Conditional action buttons: render only when supporting data (ticketUrl, mapsUrl) is non-null"
  - "FanBase links pattern: /fanbase/team/:teamId via React Router Link — used for both home and away teams"

requirements-completed: [MATCH-03, MATCH-04, MATCH-05, MATCH-06]

# Metrics
duration: 15min
completed: 2026-03-15
---

# Phase 2 Plan 06: Match Detail Page Summary

**Match detail page delivering MATCH-03 through MATCH-06: hero with team crests, local-timezone info tiles, conditional Buy Tickets, Google Maps stadium navigation, FanBase team links, and a side-by-side StatBar — completing Phase 2**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-15
- **Completed:** 2026-03-15
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 3 created

## Accomplishments

- Built `useMatchDetail` TanStack Query hook with `enabled: Boolean(id)` guard to prevent unnecessary fetches on undefined id
- Built `StatBar` component comparing wins, draws, losses, points, position, and goal difference side by side; returns null when both standings are null
- Built `MatchDetailPage` with animated hero (green background, large TeamLogo crests, VS badge, league name), three info tiles (date, time, venue in local timezone), conditional Buy Tickets button (hidden when ticketUrl is null), Navigate to Stadium button (Google Maps), FanBase links for both teams, and StatBar
- User visually verified the page looks and works correctly (checkpoint approved)
- Phase 2 complete — all 6 MATCH requirements (MATCH-01 through MATCH-06) satisfied

## Task Commits

Each task was committed atomically:

1. **Task 1: Build useMatchDetail hook, StatBar component, and MatchDetailPage** - `3976c5b` (feat)
2. **Task 2: Verify match detail page visually and functionally** - checkpoint approved (no code changes)

**Plan metadata:** (committed below as docs commit)

## Files Created/Modified

- `frontend/src/hooks/useMatchDetail.ts` - TanStack Query hook fetching GET /api/matches/:id, returns MatchDetail with team standings
- `frontend/src/components/StatBar.tsx` - Side-by-side league stats comparison; StatRow sub-component; null-safe with winRate/goalDiff helpers
- `frontend/src/pages/MatchDetailPage.tsx` - Full match detail page with loading skeleton, error state, hero, info tiles, Buy Tickets, Navigate to Stadium, FanBase links, and StatBar

## Decisions Made

- `StatBar` returns null early when both standings are null — avoids rendering an empty card for newly promoted or untracked teams
- `season` computed client-side as `Math.min(currentYear - 1, 2024)` to stay consistent with the backend API-Football free-plan cap
- `Navigate to Stadium` uses `match.stadium.googleMapsUrl` when set, falls back to `buildMapsUrl(name, city)` — graceful degradation ensures the button always works

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 complete. All six MATCH requirements satisfied.
- Phase 3 (FanBase) can begin — `/fanbase/team/:teamId` stub pages are already in place from Plan 02-03, ready to be filled in.
- No blockers for Phase 3.

---
*Phase: 02-match-discovery*
*Completed: 2026-03-15*
