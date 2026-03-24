---
phase: 18-getting-there-fanbase-tab
plan: "01"
subsystem: fanbase
tags: [post-types, frontend, backend, transport]
dependency_graph:
  requires: []
  provides: [GETTING_THERE-post-type, GettingThereCard]
  affects: [fanbase-post-feed, post-creation-modal]
tech_stack:
  added: []
  patterns: [conditional-spread, card-component-pattern]
key_files:
  created:
    - frontend/src/components/fanbase/GettingThereCard.tsx
  modified:
    - frontend/src/types/index.ts
    - backend/src/controllers/posts.controller.ts
    - backend/src/controllers/fanbase.controller.ts
decisions:
  - "GETTING_THERE stored as PostType string (not enum) at application layer — aligns with Phase 15 decision"
  - "transport fields use conditional spread in createPost/editPost — consistent with existing pub/seat field pattern"
metrics:
  duration: "2 min"
  completed: "2026-03-24"
  tasks_completed: 2
  files_changed: 4
requirements: [TRANS-06, TRANS-07]
---

# Phase 18 Plan 01: GETTING_THERE Post Type and Card Summary

**One-liner:** GETTING_THERE added to PostType union, backend VALID_POST_TYPES arrays, Post interface transport fields, and a GettingThereCard display component — ready for Plan 02 wiring.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update types and backend to support GETTING_THERE posts | fd66946 | frontend/src/types/index.ts, backend/src/controllers/posts.controller.ts, backend/src/controllers/fanbase.controller.ts |
| 2 | Create GettingThereCard component | e5dfec3 | frontend/src/components/fanbase/GettingThereCard.tsx |

## What Was Built

### Task 1 — Types and backend
- `PostType` union in `frontend/src/types/index.ts` extended with `'GETTING_THERE'`
- Three new fields added to the `Post` interface: `transportType: string | null`, `travelCost: string | null`, `travelTime: string | null`
- `VALID_POST_TYPES` in `posts.controller.ts` updated to include `'GETTING_THERE'`; transport fields destructured from `req.body` and conditionally spread into both `prisma.post.create` and `prisma.post.update`
- `VALID_POST_TYPES` in `fanbase.controller.ts` updated to include `'GETTING_THERE'`

### Task 2 — GettingThereCard component
- Created `frontend/src/components/fanbase/GettingThereCard.tsx` following the SeatTipCard pattern
- Green badge (`bg-green-100 text-green-700`) for `post.transportType`
- Inline cost and time pills rendered when `post.travelCost` or `post.travelTime` is present
- Post body text rendered as standard gray paragraph
- `PostCardActions` reused for author info, upvote, and edit/delete footer

## Decisions Made

- Transport fields use the same conditional spread pattern as seat/pub fields — no change to established data-persistence conventions
- GettingThereCard does not render `post.title` explicitly (same pattern as SeatTipCard and PubRecCard — title appears at feed list level)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `frontend/src/types/index.ts` contains `| 'GETTING_THERE'` and all three transport fields
- `backend/src/controllers/posts.controller.ts` contains GETTING_THERE in VALID_POST_TYPES and transport field spreads in createPost and editPost
- `backend/src/controllers/fanbase.controller.ts` contains GETTING_THERE in VALID_POST_TYPES
- `frontend/src/components/fanbase/GettingThereCard.tsx` exists with PostCardActions, transport badge, and pills
- Commits fd66946 and e5dfec3 verified in git log
