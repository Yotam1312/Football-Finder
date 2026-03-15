---
phase: 03-fanbase-browse
plan: "04"
subsystem: frontend
tags: [react, fanbase, post-cards, framer-motion, pagination]
dependency_graph:
  requires: [03-02, 03-03]
  provides: [team-fanbase-page, post-card-components]
  affects: [frontend/src/pages, frontend/src/components/fanbase]
tech_stack:
  added: []
  patterns:
    - PostCard dispatcher pattern (switch on postType, renders correct card variant)
    - AnimatePresence mode="wait" for tab content fade transitions
    - URL-driven tab state via useSearchParams for shareable links
key_files:
  created:
    - frontend/src/components/fanbase/SeatTipCard.tsx
    - frontend/src/components/fanbase/PubRecCard.tsx
    - frontend/src/components/fanbase/GeneralTipCard.tsx
    - frontend/src/components/fanbase/ImGoingCard.tsx
    - frontend/src/components/fanbase/PostCard.tsx
    - frontend/src/components/fanbase/PostFeed.tsx
  modified:
    - frontend/src/pages/TeamFanBasePage.tsx
decisions:
  - PostCard uses a switch on post.postType so the feed component stays clean — no type-checking logic in PostFeed
  - Tab state lives in ?tab= URL param — allows shareable links and browser back/forward to work naturally
  - Page state resets to 1 on every tab change to avoid showing page 3 of an empty tab
  - Photos skipped entirely in Phase 3 (SeatTipCard does not render photoUrl) — Azure Blob Storage deferred to Phase 4
metrics:
  duration: "~2 minutes"
  completed: "2026-03-15"
  tasks: 2
  files_created: 6
  files_modified: 1
---

# Phase 3 Plan 04: Team FanBase Page Summary

**One-liner:** Team FanBase page with 5-tab post feed, per-type card components, AnimatePresence fade transitions, URL-driven tab state, and disabled "Add Your Tip" button satisfying FAN-03 and FAN-04.

## What Was Built

The Team FanBase page (`/fanbase/team/:teamId`) and its complete set of sub-components were built. This replaces the stub from plan 03-03 and delivers the actual destination users reach after navigating the hub or searching for a team.

### Components Created

**4 post card type components:**
- `SeatTipCard` — section/row/seat number, inline StarRating (filled/empty ★ characters), body text, common footer
- `PubRecCard` — pub name as card title, address and distance from stadium, description
- `GeneralTipCard` — title heading and body text for GENERAL_TIP and Local Crowd posts
- `ImGoingCard` — green "I'm Going! ⚽" badge, optional message, optional Match #N reference

**PostCard dispatcher** (`PostCard.tsx`) — routes to the correct card variant via a switch on `post.postType`. Keeps all type-checking logic in one place.

**PostFeed** (`PostFeed.tsx`) — owns the tab bar (5 tabs with green underline on active), AnimatePresence-wrapped content area (fade in/out on tab switch), per-tab encouraging empty state messages, skeleton loading (3 SkeletonCards), and Prev/Next pagination (only shown when total > 10).

**TeamFanBasePage** (`TeamFanBasePage.tsx`) — reads `teamId` from `useParams`, reads `?tab=` from `useSearchParams` (default: `all`), maintains `page` in local state, resets page to 1 on tab change, calls `useFanbaseTeam` and `useFanbasePosts`, renders team header with `TeamLogo (size="lg")`, name, post count, and the disabled "+ Add Your Tip" button.

## Requirements Delivered

- **FAN-03**: Tabbed post feed (All / Seat Tips / Pubs & Food / Local Crowd / I'm Going) with per-tab content and empty states
- **FAN-04**: Page is fully public — no login prompt, no auth headers sent

## Key Decisions

1. **PostCard dispatcher pattern** — switch statement in PostCard.tsx keeps PostFeed free of type-checking logic
2. **URL tab state** — `?tab=` query param makes team page tabs shareable and respects browser back/forward
3. **Page reset on tab change** — prevents stale pagination state when switching tabs
4. **Photos deferred** — SeatTipCard intentionally ignores `photoUrl`; Azure Blob Storage is a Phase 4 concern

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| 2dedc7a | feat(03-04): add post card type components and PostCard dispatcher |
| 487f95b | feat(03-04): build PostFeed and TeamFanBasePage replacing the stub |

## Self-Check: PASSED

All 7 files verified to exist. Both commits (2dedc7a, 487f95b) verified in git log.
