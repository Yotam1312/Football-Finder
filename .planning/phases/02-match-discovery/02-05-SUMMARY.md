---
phase: 02-match-discovery
plan: "05"
subsystem: ui
tags: [react, framer-motion, tanstack-query, react-router, tailwind, typescript]

# Dependency graph
requires:
  - phase: 02-match-discovery-03
    provides: Match/Team/Stadium/League TypeScript types in frontend/src/types/index.ts
  - phase: 02-match-discovery-04
    provides: GET /api/matches/search endpoint returning {matches, total}

provides:
  - HomePage with green hero, city+date search form, Nominatim geolocation, 3 testimonials
  - ResultsPage reading URL params and rendering stagger-animated MatchCard list
  - MatchCard component with team logos, VS badge, league, local time, stadium, action buttons
  - TeamLogo with 3-letter initials fallback for missing/broken logos
  - SkeletonMatchCard animate-pulse loading placeholder
  - buildMapsUrl(stadiumName, city) Google Maps search URL helper
  - formatMatchDate/formatMatchTime using Intl.DateTimeFormat with venue IANA timezone
  - useMatchSearch TanStack Query v5 hook for /api/matches/search

affects:
  - 02-match-discovery-06 (MatchDetailPage will reuse TeamLogo and formatDate utilities)
  - 03-fanbase (can reuse MatchCard pattern for match references in posts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "URL-driven search: HomePage navigates to /results?city=...&from=...&to=...; ResultsPage reads searchParams — no shared state"
    - "Stagger animation: motion.div with containerVariants (staggerChildren) wrapping MatchCard list"
    - "TanStack Query v5 single-object API: useQuery({ queryKey, queryFn, enabled })"
    - "import type for type-only imports (verbatimModuleSyntax TS requirement)"
    - "Nominatim reverse geocode for geolocation city lookup (no API key needed)"

key-files:
  created:
    - frontend/src/utils/buildMapsUrl.ts
    - frontend/src/utils/formatDate.ts
    - frontend/src/components/TeamLogo.tsx
    - frontend/src/components/SkeletonMatchCard.tsx
    - frontend/src/components/MatchCard.tsx
    - frontend/src/hooks/useMatchSearch.ts
  modified:
    - frontend/src/pages/HomePage.tsx
    - frontend/src/pages/ResultsPage.tsx

key-decisions:
  - "URL params drive results page state — city/from/to in URL allows browser back/forward and direct link sharing"
  - "Client-side pagination (PAGE_SIZE=10) — avoids extra API calls for the typical result set size"
  - "Nominatim pre-fills city only — user reviews and submits manually to avoid incorrect auto-submit"
  - "cardVariants exported from MatchCard but used via variants prop on motion.div inside MatchCard — ResultsPage does not need to import it"

patterns-established:
  - "import type for all type-only imports from ../types (verbatimModuleSyntax)"
  - "Prefer stadium.googleMapsUrl, fall back to buildMapsUrl() dynamically"
  - "Stadium timezone ?? UTC fallback for formatMatchDate/formatMatchTime"

requirements-completed: [MATCH-01, MATCH-02, MATCH-05]

# Metrics
duration: 15min
completed: 2026-03-15
---

# Phase 2 Plan 05: Homepage and Results Page Summary

**Search form on green hero navigates to URL-driven results page that renders stagger-animated MatchCards fetched from /api/matches/search via TanStack Query**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-15T14:40:00Z
- **Completed:** 2026-03-15T14:55:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Full homepage: green hero, 3-field search form, Nominatim geolocation, Find Matches navigation, 3 testimonials with whileInView animations
- Results page: reads URL params, shows 3 skeleton cards while loading, stagger-animated MatchCard list, empty state, error state, client-side pagination
- MatchCard: team logos (initials fallback), green VS badge, league, local date/time via IANA timezone, stadium name, View Details link, Navigate to Stadium Google Maps link
- Shared utilities: buildMapsUrl, formatMatchDate, formatMatchTime, useMatchSearch hook

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared utilities and reusable components** - `331d25f` (feat)
2. **Task 2: Build HomePage and ResultsPage** - `42cf31b` (feat)

## Files Created/Modified
- `frontend/src/utils/buildMapsUrl.ts` - Google Maps search URL generator
- `frontend/src/utils/formatDate.ts` - Intl.DateTimeFormat wrappers for venue-local date and time
- `frontend/src/components/TeamLogo.tsx` - Team logo img with 3-letter initials fallback
- `frontend/src/components/SkeletonMatchCard.tsx` - animate-pulse loading placeholder
- `frontend/src/components/MatchCard.tsx` - Full match card with Framer Motion, logos, info, action buttons
- `frontend/src/hooks/useMatchSearch.ts` - TanStack Query v5 hook wrapping GET /api/matches/search
- `frontend/src/pages/HomePage.tsx` - Green hero, search form, geolocation, testimonials
- `frontend/src/pages/ResultsPage.tsx` - URL-param search, skeleton, card list, pagination

## Decisions Made
- URL params drive results page state — city/from/to in URL allows browser back/forward and direct link sharing without React context or Redux
- Client-side pagination (PAGE_SIZE=10) — avoids extra API calls; backend returns all matches for the city/date range window
- Nominatim pre-fills city only — user reviews before submitting to prevent accidental search on wrong city
- cardVariants exported from MatchCard for future reuse (MatchDetailPage may reuse it) but ResultsPage doesn't import it directly

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed type-only imports violating verbatimModuleSyntax**
- **Found during:** Task 1 (build verification)
- **Issue:** `import { Match } from '../types'` and `import { Team } from '../types'` caused TS error 1484 — verbatimModuleSyntax requires `import type` for type-only imports
- **Fix:** Changed to `import type { Match }` in MatchCard.tsx and useMatchSearch.ts, `import type { Team }` in TeamLogo.tsx
- **Files modified:** frontend/src/components/MatchCard.tsx, frontend/src/components/TeamLogo.tsx, frontend/src/hooks/useMatchSearch.ts
- **Verification:** `npm run build` exits 0
- **Committed in:** 331d25f (Task 1 commit)

**2. [Rule 1 - Bug] Removed unused cardVariants import from ResultsPage**
- **Found during:** Task 2 (build verification)
- **Issue:** TS6133 — cardVariants imported but not used in ResultsPage (it's consumed inside MatchCard via variants prop)
- **Fix:** Removed cardVariants from the import, kept MatchCard
- **Files modified:** frontend/src/pages/ResultsPage.tsx
- **Verification:** `npm run build` exits 0
- **Committed in:** 42cf31b (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — TypeScript strictness bugs)
**Impact on plan:** Both auto-fixes necessary for build to pass. No scope creep.

## Issues Encountered
None — all deviations were caught and fixed during build verification.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Homepage and Results page fully functional — MATCH-01, MATCH-02, MATCH-05 satisfied
- MatchDetailPage (Plan 06) can reuse TeamLogo, formatMatchDate, formatMatchTime directly
- Navigate to Stadium opens correct Google Maps URL in new tab
- Build passes at 0 TypeScript errors

---
*Phase: 02-match-discovery*
*Completed: 2026-03-15*
