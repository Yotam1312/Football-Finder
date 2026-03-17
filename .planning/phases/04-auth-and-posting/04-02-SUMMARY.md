---
phase: "04-auth-and-posting"
plan: "04-02"
subsystem: "backend-api"
tags: ["posts", "upvote", "favorites", "auth", "mutations"]
dependency_graph:
  requires: ["04-01"]
  provides: ["upvote-toggle", "post-edit", "post-delete", "favorites-toggle", "favorites-list"]
  affects: ["frontend-fanbase"]
tech_stack:
  added: []
  patterns: ["prisma-transaction", "ownership-check", "sparse-update", "compound-unique-key"]
key_files:
  created:
    - backend/src/routes/posts.routes.ts
    - backend/src/controllers/posts.controller.ts
    - backend/src/__tests__/posts.test.ts
    - backend/src/routes/users.routes.ts
    - backend/src/controllers/users.controller.ts
    - backend/src/__tests__/users.test.ts
  modified:
    - backend/src/app.ts
decisions:
  - "Upvote toggle uses $transaction array form to keep Upvote row and upvoteCount counter atomically in sync"
  - "editPost uses conditional spread for each optional field — avoids overwriting existing data with undefined"
  - "deletePost deletes upvotes with deleteMany before deleting the post to avoid foreign key constraint error"
  - "getFavorites added alongside toggleFavorite — frontend needs it to initialize heart icon state on load"
metrics:
  duration: "4 minutes"
  completed_date: "2026-03-16"
  tasks_completed: 2
  files_changed: 7
---

# Phase 04 Plan 02: Post Mutation Endpoints — Upvote, Edit, Delete, Favorites Summary

Four post-mutation endpoints added with ownership/level enforcement: atomic upvote toggle via Prisma transaction, edit/delete with authorship check, and favorites toggle + list for Level 3 users.

## What Was Built

**Task 1: Posts mutation endpoints (upvote, edit, delete)**

- `POST /api/posts/:postId/upvote` — requireLevel3. Checks for existing Upvote row, toggles on/off using `$transaction([upvote.create/delete, post.update({upvoteCount: increment/decrement})])`. Fetches updated post after transaction to return real count.
- `PUT /api/posts/:postId` — requireAuth. Fetches post, checks `post.userId === req.auth.userId` (403 if mismatch), updates only the fields present in request body using conditional spread.
- `DELETE /api/posts/:postId` — requireAuth. Same ownership check, then `upvote.deleteMany` before `post.delete` to satisfy foreign key constraint.
- `app.ts` registered both `/api/posts` and `/api/users` routes.

**Task 2: User favorites endpoints**

- `POST /api/users/favorites/:teamId` — requireLevel3. Checks for existing UserFavorite row, toggles with create/delete. Returns `{ favorited: boolean }`.
- `GET /api/users/favorites` — requireLevel3. Returns `{ favoriteTeamIds: number[] }` — full list for page-load initialization.

**Tests: 14 new tests, all 50 tests passing**

- `posts.test.ts`: 401 without cookie, 403 for Level 2 on upvote, upvote toggle returns `{upvoted: true}`, edit with correct owner returns updated post, 403 for wrong owner, 404 for missing post, delete wrong owner returns 403, delete correct owner returns `{message: 'Post deleted'}`
- `users.test.ts`: 401 without cookie, 403 for Level 2, toggle adds (favorited: true), toggle removes (favorited: false), 401 on GET without cookie, GET returns favoriteTeamIds array

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `backend/src/routes/posts.routes.ts` — created
- [x] `backend/src/controllers/posts.controller.ts` — created
- [x] `backend/src/__tests__/posts.test.ts` — created
- [x] `backend/src/routes/users.routes.ts` — created
- [x] `backend/src/controllers/users.controller.ts` — created
- [x] `backend/src/__tests__/users.test.ts` — created
- [x] `backend/src/app.ts` — modified
- [x] Commit a7d998d: feat(04-02): add post mutation endpoints
- [x] Commit 8003a46: feat(04-02): add user favorites endpoints
- [x] 50/50 tests passing, 0 TypeScript errors

## Self-Check: PASSED
