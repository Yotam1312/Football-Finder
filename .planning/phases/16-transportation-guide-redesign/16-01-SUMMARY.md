---
phase: 16-transportation-guide-redesign
plan: 01
subsystem: ui
tags: [react, typescript, tailwind, framer-motion, lucide-react]

# Dependency graph
requires:
  - phase: 15-transport-db-schema
    provides: Transport DB schema — this plan is frontend-only (static content, no API calls)
provides:
  - Redesigned /transportation-guide page with hero, all new content sections, FAQ accordion
affects:
  - phase-17 (stadium-specific transport — builds on this guide page layout patterns)
  - phase-18 (community getting-there tab — uses same page context)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - FAQ accordion with single-open state using useState<number | null>(null)
    - Green gradient hero section (bg-gradient-to-br from-green-800 to-green-600) used on guide pages
    - Data-driven section rendering — all content in top-level const arrays, mapped in JSX

key-files:
  created: []
  modified:
    - frontend/src/pages/TransportPage.tsx

key-decisions:
  - "Lyft replaced with Bolt in both RESOURCE_COLUMNS and Ride Services transport option — more relevant for European football audience"
  - "Bus icon replaced with Train for Long Distance section — reduces icon ambiguity (Bus already used for Public Transit)"
  - "Both tasks implemented in a single file write since they target the same file — one atomic commit"
  - "FAQ allows only one item open at a time — cleaner UX for mobile"

patterns-established:
  - "FAQ accordion pattern: FaqItem component receives isOpen/onToggle props, parent holds index state"
  - "Guide hero: gradient card with emoji + title + subtitle, no CTA button"
  - "Payment/safety tip cards: emoji or icon left, title + detail text right, gray-50 background tile"

requirements-completed:
  - TRANS-01

# Metrics
duration: 8min
completed: 2026-03-24
---

# Phase 16 Plan 01: Transportation Guide Redesign Summary

**Static transportation guide redesigned with gradient hero, 4 renamed quick-tip cards, Walking & Cycling section, Payment Methods, Safety Tips, Helpful Apps with real hrefs, and a 4-item FAQ accordion**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-24T17:20:40Z
- **Completed:** 2026-03-24T17:28:40Z
- **Tasks:** 2 (executed together — same file)
- **Files modified:** 1

## Accomplishments

- Replaced text-only header with green gradient hero section (`bg-gradient-to-br from-green-800 to-green-600`) with 🚦 emoji and white text
- Renamed 4 quick-tip cards from Stadium Locations / Arrival Timing / Payment Methods / Mobile Apps to Plan Ahead / Arrive Early / Payment Ready / Download Apps with updated descriptions
- Added Walking & Cycling transport section (Footprints icon, orange badge) between Ride Services and Long Distance using existing `TransportSectionPanel` pattern
- Changed Long Distance icon from Bus to Train (Bus already used for Public Transit — avoids duplication)
- Added Payment Methods section (2-column grid with 4 emoji-icon tip tiles)
- Added Safety Tips section (6 tips with Shield icon rows)
- Updated Helpful Resources to Helpful Apps with real `href` links on all resource rows (target _blank, rel noopener)
- Replaced Lyft with Bolt throughout (more relevant for European football fans)
- Added FAQ accordion (4 questions, one-open-at-a-time state, ChevronDown rotates on open)
- TypeScript compiles with zero errors

## Task Commits

1. **Tasks 1 & 2: Complete transportation guide redesign** - `8ecd406` (feat)

## Files Created/Modified

- `frontend/src/pages/TransportPage.tsx` - Full redesign: hero, renamed cards, 4 transport sections, Payment Methods, Safety Tips, Helpful Apps (with hrefs), FAQ accordion

## Decisions Made

- Lyft replaced with Bolt in both the RESOURCE_COLUMNS (Helpful Apps) and the Ride Services transport option title ("Uber/Bolt") — more relevant for the European football audience this app targets
- Bus icon replaced with Train for Long Distance section — prevents visual ambiguity since Bus is already the Public Transit section icon
- Both plan tasks target the same file, so implemented in one write and committed atomically — no value in splitting an incomplete intermediate state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed remaining "Lyft" reference in Ride Services transport option**

- **Found during:** Task 2 verification (acceptance criteria check)
- **Issue:** The plan said "change Lyft to Bolt" in the context of RESOURCE_COLUMNS, but the Ride Services transport option still had `title: 'Uber/Lyft'` from the original file. Acceptance criteria required no `Lyft` anywhere in the file.
- **Fix:** Updated `title: 'Uber/Lyft'` to `title: 'Uber/Bolt'` in the TRANSPORT_SECTIONS Ride Services entry
- **Files modified:** frontend/src/pages/TransportPage.tsx
- **Verification:** Node.js string check confirmed `Lyft` not present; TypeScript compiled cleanly
- **Committed in:** 8ecd406 (task commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug/omission)
**Impact on plan:** Minor — acceptance criteria explicitly required no Lyft. Fix was a one-line title change, no scope creep.

## Issues Encountered

None — plan executed cleanly. The existing `TransportSectionPanel`, `TransportOptionCol`, and `ResourceRow` component patterns worked perfectly for the new sections.

## User Setup Required

None - no external service configuration required. All content is static.

## Next Phase Readiness

- Phase 16 Plan 01 complete. `/transportation-guide` page is now a rich, structured guide with all TRANS-01 content sections.
- Phase 17 (stadium-specific transport on match detail page) can proceed — this guide provides the general context layer; Phase 17 adds the stadium-specific data layer.
- No blockers.

---
*Phase: 16-transportation-guide-redesign*
*Completed: 2026-03-24*
