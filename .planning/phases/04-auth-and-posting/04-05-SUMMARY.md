---
phase: 04-auth-and-posting
plan: "04-05"
subsystem: frontend
tags: [verify-page, upvote, edit-delete, favorites, post-cards]
dependency_graph:
  requires: [04-01, 04-02, 04-03, 04-04]
  provides: [verify-page, post-ownership-ui, upvote-button, heart-icon]
  affects: [TeamFanBasePage, PostFeed, PostCard, CreatePostModal]
tech_stack:
  added: []
  patterns: [TanStack Query optimistic updates, shared footer component pattern]
key_files:
  created:
    - frontend/src/pages/VerifyPage.tsx
    - frontend/src/hooks/useUpvote.ts
    - frontend/src/components/fanbase/PostCardActions.tsx
  modified:
    - frontend/src/App.tsx
    - frontend/src/components/fanbase/PostCard.tsx
    - frontend/src/components/fanbase/PostFeed.tsx
    - frontend/src/components/fanbase/GeneralTipCard.tsx
    - frontend/src/components/fanbase/SeatTipCard.tsx
    - frontend/src/components/fanbase/PubRecCard.tsx
    - frontend/src/components/fanbase/ImGoingCard.tsx
    - frontend/src/components/fanbase/CreatePostModal.tsx
    - frontend/src/pages/TeamFanBasePage.tsx
decisions:
  - "PostCardActions created as a shared component to avoid duplicating upvote/edit/delete logic across all 4 post card types"
  - "useUpvote cache key must exactly match useFanbasePosts key: ['fanbase', 'posts', teamId, postType ?? 'all', page]"
  - "Edit modal reuses CreatePostModal with editPost prop; email field hidden and PUT used instead of POST for edits"
  - "Heart icon fetched via GET /api/users/favorites on mount, only for level === 3 users"
  - "Delete uses window.confirm per plan spec — no custom modal needed for student project"
metrics:
  duration: "6 minutes"
  completed_date: "2026-03-16"
  tasks_completed: 2
  files_changed: 13
---

# Phase 04 Plan 05: Post Ownership UI, Upvote Button, Heart Icon, and Verify Page Summary

JWT-verified email link creates posts via VerifyPage; post cards get interactive upvote/edit/delete buttons with ownership checks; Level 3 users get a heart-icon favorite toggle on team pages.

## Tasks Completed

### Task 1: Create VerifyPage and add /verify/:token route

Created `frontend/src/pages/VerifyPage.tsx` with 5 status states:
- `loading` — spinner while `POST /api/auth/verify/:token` is in flight
- `success` — shows "Your post is live!" with team name, upgrade prompt for Level 2 users, and "Back to {TeamName} FanBase" link
- `expired` — shows "This link has expired" with a resend button calling `POST /api/auth/resend`
- `already-used` — shows "This link has already been used"
- `error` — shows "This link is invalid or has expired" with a link back to `/fanbase`

On success, `refreshAuth()` is called to update the auth context to Level 2. Team name is fetched from `GET /api/fanbase/team/:teamId` for the confirmation message.

Added `<Route path="/verify/:token" element={<VerifyPage />} />` to `App.tsx`.

**Commit:** `4f54649`

### Task 2: Upvote, edit/delete, heart icon, and edit modal

Created `useUpvote.ts` hook with:
- `useMutation` from TanStack Query
- Optimistic update: increments `upvoteCount` by 1 immediately, rolls back on error
- `onSettled` invalidates the posts query to sync with server (handles toggle direction)
- Cache key exactly matches `useFanbasePosts`: `['fanbase', 'posts', teamId, postType ?? 'all', page]`

Created `PostCardActions.tsx` — shared footer component rendered by all 4 card types:
- Shows author name + relative timestamp
- Upvote button visible to all; guests/Level 2 see a tooltip "Log in to upvote" on click
- Edit + Delete buttons only visible when `user.id === post.userId` (numeric ID, not email)
- Delete calls `DELETE /api/posts/:id` then invalidates the posts query
- Edit calls the `onEdit` callback which opens `CreatePostModal` in edit mode

Updated all 4 post card components (`GeneralTipCard`, `SeatTipCard`, `PubRecCard`, `ImGoingCard`) to replace their static footer div with `<PostCardActions>`, accepting the new `teamId/postType/page/onEdit` props.

Updated `PostCard`, `PostFeed`, and `TeamFanBasePage` to thread the new props through.

Updated `CreatePostModal` to support an optional `editPost?: Post` prop:
- When provided: starts on `'form'` step, pre-fills all fields, hides email field, uses `PUT /api/posts/:id`, shows "Save Changes" button
- On successful edit: invalidates `['fanbase', 'posts']` queries and closes modal

Added heart icon to `TeamFanBasePage`:
- Only shown when `user?.level === 3`
- `isFavorited` state fetched on mount from `GET /api/users/favorites`
- Toggle via `POST /api/users/favorites/:teamId`, state flips optimistically

**Commit:** `47ecb0f`

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Check

- [x] POST-05 + POST-06: `/verify/:token` page calls `POST /api/auth/verify/:token`, shows "Your post is live!" confirmation
- [x] POST-07: Expired token shows "This link has expired" with working resend button
- [x] AUTH-03: Level 3 users can upvote posts with optimistic updates
- [x] AUTH-04: Post authors see Edit button opening pre-filled modal
- [x] AUTH-05: Post authors see Delete button with confirm dialog
- [x] AUTH-06: Level 3 users see heart icon, state persists via GET /api/users/favorites on reload
- [x] POST-08: Photo upload not implemented — photoUrl stays null
- [x] `npm run build` passes with no TypeScript errors

## Self-Check: PASSED
