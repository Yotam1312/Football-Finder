---
phase: 24-code-cleanup
plan: "02"
subsystem: backend-validation, fanbase-frontend
tags: [validation, fanbase, stadium-guide, dead-code-review]
one_liner: "transportType validation on post endpoints + stadiumId in getTeamById + Stadium Guide link on FanBase team page"
dependency_graph:
  requires: [24-01]
  provides: [CLEAN-06, CLEAN-07, CLEAN-08]
  affects: [backend/src/controllers/posts.controller.ts, backend/src/controllers/fanbase.controller.ts, frontend/src/pages/TeamFanBasePage.tsx]
tech_stack:
  added: []
  patterns: [input-validation, derived-field, conditional-link]
key_files:
  created: []
  modified:
    - backend/src/controllers/posts.controller.ts
    - backend/src/controllers/fanbase.controller.ts
    - frontend/src/pages/TeamFanBasePage.tsx
decisions:
  - "transportType validation uses a local VALID_TRANSPORT_TYPES constant (not Prisma enum import) — matches the existing postType validation pattern in the same file"
  - "getTeamById derives stadiumId with a separate findFirst query (same pattern already used in getTeamsByLeague) — kept consistent across both fanbase endpoints"
  - "Stadium Guide link placed after post count paragraph inside the team header card — minimal UI addition, conditionally rendered only when stadiumId is non-null"
  - "Codebase review: phase-number comments are documentation-only (informational context) — not removed since they explain implementation history, not future work"
metrics:
  duration: "~3 minutes"
  completed: "2026-03-29"
  tasks_completed: 3
  files_modified: 3
  commits: 3
---

# Phase 24 Plan 02: Code Cleanup (transportType validation + Stadium Guide link) Summary

transportType validation on post create/edit endpoints, stadiumId derivation in getTeamById, Stadium Guide link on FanBase team page, and a full codebase dead-code review.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add transportType validation to createPost and editPost | e06d330 | backend/src/controllers/posts.controller.ts |
| 2 | Add stadiumId to getTeamById + Stadium Guide link on FanBase page | 3dfe0c7 | backend/src/controllers/fanbase.controller.ts, frontend/src/pages/TeamFanBasePage.tsx |
| 3 | Full codebase review — find and fix remaining dead code | 1707b59 | (no file changes — clean review) |

## What Was Built

### Task 1 — transportType validation (CLEAN-06)
Added a `VALID_TRANSPORT_TYPES = ['Metro', 'Bus', 'Train', 'Taxi', 'Walking', 'Other']` check to both `createPost` and `editPost` in `posts.controller.ts`. Any `transportType` value outside this list now returns HTTP 400 `{ error: 'Invalid transport type' }`. Values are case-sensitive. The validation is placed after the `postType` check (in createPost) and after the ownership check (in editPost), immediately before data hits the database.

### Task 2 — stadiumId in getTeamById + Stadium Guide link (CLEAN-07)
`getTeamById` previously returned only `{ id, name, logoUrl, _count }` with no `stadiumId`. It now performs a second query to find the first home match with a non-null `stadiumId`, matching the existing pattern in `getTeamsByLeague`. The response is now `{ team: { ...team, stadiumId } }`.

On the frontend, `TeamFanBasePage.tsx` now renders a `<Link to={/stadiums/${team.stadiumId}}>Stadium Guide →</Link>` below the post count paragraph. It is conditionally rendered with `{team.stadiumId != null && ...}` — absent for teams with no known stadium.

### Task 3 — Codebase review (CLEAN-08)
Full systematic scan run across `frontend/src/` and `backend/src/`:
- `tsc --noEmit` on both workspaces: no TS6133/TS6196 (unused import/variable) errors
- No orphaned component files (all `.tsx` files in `frontend/src/components/` are imported somewhere)
- No dead exports in either workspace (all exports have at least one consumer outside their own file)
- All Prisma schema fields are actively queried or written by application code
- No TODO / FIXME / HACK comments anywhere in either codebase
- Phase-number references in comments are documentation-only and left as-is (they explain implementation history, not pending work)
- Backend test suite: **100 tests passing, 17 suites** — no regressions

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Check

- [x] CLEAN-06: `POST /api/posts` and `PUT /api/posts/:id` with `transportType: "Helicopter"` returns 400 `{ error: 'Invalid transport type' }`. Valid values (Metro, Bus, Train, Taxi, Walking, Other) pass through.
- [x] CLEAN-07: FanBase team page shows "Stadium Guide →" link to `/stadiums/:stadiumId` when `team.stadiumId` is non-null. Link is absent when null.
- [x] CLEAN-08: Full scan run — no dead code found. Results documented above.
- [x] TypeScript builds clean in both backend and frontend workspaces.
- [x] Backend test suite: 100 tests passing.

## Self-Check: PASSED

Files verified:
- `backend/src/controllers/posts.controller.ts` — FOUND
- `backend/src/controllers/fanbase.controller.ts` — FOUND
- `frontend/src/pages/TeamFanBasePage.tsx` — FOUND

Commits verified:
- e06d330 — FOUND (transportType validation)
- 3dfe0c7 — FOUND (stadiumId + Stadium Guide link)
- 1707b59 — FOUND (codebase review)
