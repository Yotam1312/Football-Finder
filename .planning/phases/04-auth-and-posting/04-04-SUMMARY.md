---
phase: "04-auth-and-posting"
plan: "04-04"
subsystem: "fanbase-posting"
tags: [modal, post-creation, fanbase, upcoming-matches, email-verification]
dependency_graph:
  requires: [04-01, 04-03]
  provides: [CreatePostModal, upcoming-matches-endpoint]
  affects: [TeamFanBasePage, fanbase.controller, fanbase.routes]
tech_stack:
  added: []
  patterns:
    - multi-step modal with conditional step rendering
    - useEffect fetch for one-off data load (no TanStack Query)
    - client-side form validation before API call
    - route ordering to prevent Express param collision
key_files:
  created:
    - frontend/src/components/fanbase/CreatePostModal.tsx
    - backend/src/__tests__/fanbase.upcomingmatches.test.ts
  modified:
    - backend/src/controllers/fanbase.controller.ts
    - backend/src/routes/fanbase.routes.ts
    - frontend/src/pages/TeamFanBasePage.tsx
decisions:
  - "upcoming-matches route registered before /team/:teamId to prevent Express treating the path segment as a teamId param"
  - "match picker uses plain fetch + useEffect not TanStack Query — one-off load on form step render, no caching benefit"
  - "client-side validation returns early with submitError state instead of browser native validation"
  - "optional post fields spread conditionally into payload to avoid sending undefined values to the API"
metrics:
  duration: "~4 minutes"
  completed_date: "2026-03-16"
  tasks_completed: 2
  files_changed: 5
---

# Phase 04 Plan 04: Post Creation Modal — Type Picker, Forms, and Email Submission Summary

Multi-step CreatePostModal with type picker, type-specific forms, and email verification step — wired to the "+ Add Your Tip" button on the team FanBase page.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Add upcoming matches endpoint to fanbase API | 532a9d3 | fanbase.controller.ts, fanbase.routes.ts, fanbase.upcomingmatches.test.ts |
| 2 | Build CreatePostModal and wire it to TeamFanBasePage | e7df444 | CreatePostModal.tsx, TeamFanBasePage.tsx |

## What Was Built

**Task 1 — Upcoming Matches API endpoint:**
- Added `getUpcomingMatches` controller function: queries matches for a team (home and away) within the next 3 months, status 'NS' only, capped at 20 results ordered by date ascending
- Registered `GET /api/fanbase/team/:teamId/upcoming-matches` route before `/team/:teamId` to avoid Express routing conflict
- Created 3 integration tests: non-existent team returns empty array (not 404), invalid teamId returns 400, no auth required

**Task 2 — CreatePostModal component:**
- Step 1 (type picker): 2×2 grid of 4 post type buttons with labels and descriptions
- Step 2 (form): common fields (title, body, name, email) plus type-specific fields:
  - SEAT_TIP: section, row, seat number, 1–5 star rating (clickable ★/☆ buttons, amber when selected)
  - PUB_RECOMMENDATION: pub name (required), address, distance from stadium
  - IM_GOING: match dropdown populated via `useEffect` fetch; soft "no matches" message if empty
- Step 3 (check-email): mail emoji, confirmation heading, submitted email address displayed, Close button
- Client-side validation with `submitError` state (inline error above submit button, no browser native validation)
- `isSubmitting` state disables submit button and shows "Sending..." text
- Backdrop click closes modal; inner card uses `stopPropagation`
- Full-screen on mobile with `h-full sm:h-auto` classes
- "+ Add Your Tip" button enabled and wired to modal open state

## Success Criteria Verification

- [x] POST-01: General Tip post — form accepts and submits name, email, title, body
- [x] POST-02: Seat Tip post — section, row, seat number, star rating fields present
- [x] POST-03: Pub Recommendation post — pub name (required), address, distance fields present
- [x] POST-04: "I'm Going" post — match dropdown (or soft message if none)
- [x] POST-05: After submission, modal shows "Check your inbox!" without navigating away
- [x] POST-06: All form data sent to `request-post` in `pendingPostData` — user does not re-enter after clicking link
- [x] Modal is full-screen on mobile
- [x] GET upcoming-matches returns next 3 months, sorted by date
- [x] `npm run build` passes with no TypeScript errors (both frontend and backend)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `frontend/src/components/fanbase/CreatePostModal.tsx` — created
- [x] `backend/src/__tests__/fanbase.upcomingmatches.test.ts` — created
- [x] `backend/src/controllers/fanbase.controller.ts` — modified (getUpcomingMatches added)
- [x] `backend/src/routes/fanbase.routes.ts` — modified (route registered)
- [x] `frontend/src/pages/TeamFanBasePage.tsx` — modified (button enabled, modal wired)
- [x] Commit 532a9d3 exists
- [x] Commit e7df444 exists
- [x] 3/3 tests passing
- [x] Frontend build: clean
- [x] Backend build: clean

## Self-Check: PASSED
