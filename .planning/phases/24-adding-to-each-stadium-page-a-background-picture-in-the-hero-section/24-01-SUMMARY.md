---
phase: 24-code-cleanup
plan: 01
subsystem: backend + frontend
tags: [cleanup, dead-code, types, controller, test]
dependency_graph:
  requires: []
  provides: [clean-stadium-controller, clean-frontend-types]
  affects: [backend/src/controllers/stadium.controller.ts, frontend/src/types/index.ts]
tech_stack:
  added: []
  patterns: [deletion-only refactor]
key_files:
  deleted:
    - frontend/src/components/stadiums/NearbyStadiumsSection.tsx
    - backend/src/lib/token.helpers.ts
  modified:
    - backend/src/controllers/stadium.controller.ts
    - frontend/src/types/index.ts
    - backend/src/__tests__/stadium.detail.test.ts
decisions:
  - Removed haversineKm, nearbyStadiums, and pubRecPosts as pure dead code with no active consumers
  - Kept gettingTherePosts and primaryTeam as active fields in use by the stadium detail page
metrics:
  duration: ~3 minutes
  completed: 2026-03-29
  tasks_completed: 3
  files_modified: 3
  files_deleted: 2
---

# Phase 24 Plan 01: Code Cleanup Summary

**One-liner:** Deleted two orphaned files and stripped Haversine nearby-stadiums + pubRecPosts dead code from the stadium controller, types, and tests — TypeScript builds clean in both workspaces.

## What Was Done

Pure deletion pass removing all v2.2 prototyping dead code before Phase 26 (Stadium Detail Redesign).

### Task 1: Delete orphaned files (commit: 50a9e9a)

- `frontend/src/components/stadiums/NearbyStadiumsSection.tsx` — UI component for nearby stadiums that was never wired into any page (zero imports outside itself)
- `backend/src/lib/token.helpers.ts` — JWT helper from Phase 9 OAuth migration; kept as a placeholder comment but never imported anywhere

Both removed with `git rm`.

### Task 2: Remove Haversine + pubRecPosts from stadium controller (commit: a061486)

Edited `backend/src/controllers/stadium.controller.ts`:

- Deleted the `haversineKm` helper function (14 lines)
- Removed the `pubRecPosts` Prisma query and `Promise.all` parallel fetch pattern
- Removed the `nearbyStadiums` block including the fetch-all-stadiums query and Haversine map/filter/sort chain (40 lines)
- Simplified `res.json` compose step to only include `stadium`, `primaryTeam`, and `gettingTherePosts`
- Updated JSDoc comment to accurately describe what the endpoint now returns
- Backend TypeScript compiles clean: `npx tsc --noEmit` passes

### Task 3: Remove dead types + fix stale comment + update test (commit: fc19f1b)

Edited `frontend/src/types/index.ts`:

- Deleted the `NearbyStadium` interface (7 lines)
- Removed `nearbyStadiums: NearbyStadium[]` and `pubRecPosts: Post[]` fields from `StadiumDetail`
- Removed stale "Phase 4 feature" suffix from `Post.photoUrl` comment
- Frontend TypeScript compiles clean: `npx tsc --noEmit` passes

Edited `backend/src/__tests__/stadium.detail.test.ts`:

- Removed `expect(res.body.stadium).toHaveProperty('pubRecPosts')` assertion
- Removed `expect(Array.isArray(res.body.stadium.pubRecPosts)).toBe(true)` assertion
- All 5 backend tests pass: `npx jest stadium.detail` → 5 passed

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Verification

- CLEAN-01: `NearbyStadiumsSection.tsx` deleted. ✓
- CLEAN-02: `haversineKm` removed; `nearbyStadiums` gone from controller + `StadiumDetail`; `NearbyStadium` interface deleted. ✓
- CLEAN-03: `pubRecPosts` query removed; `pubRecPosts` gone from controller + `StadiumDetail`. ✓
- CLEAN-04: `token.helpers.ts` deleted. ✓
- CLEAN-05: "Phase 4 feature" comment removed from `Post.photoUrl`. ✓
- TypeScript builds clean in both frontend and backend. ✓
- Backend test suite passes (5/5). ✓

## Self-Check: PASSED

All commits verified:
- 50a9e9a — chore(24-01): delete orphaned NearbyStadiumsSection and token.helpers files
- a061486 — refactor(24-01): remove haversineKm, nearbyStadiums, and pubRecPosts from stadium controller
- fc19f1b — refactor(24-01): remove dead types from index.ts and fix stale comment

All deleted files confirmed absent. Zero grep hits for any removed symbol across frontend/src/ and backend/src/.
