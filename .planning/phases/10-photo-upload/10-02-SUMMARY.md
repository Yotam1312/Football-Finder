---
phase: 10-photo-upload
plan: 02
subsystem: frontend
tags: [photo-upload, lightbox, seat-tip, profile, azure-blob]
dependency_graph:
  requires: ["10-01"]
  provides: ["photo-upload-ux", "lightbox", "profile-avatar-upload"]
  affects: ["frontend/src/components/fanbase", "frontend/src/components/ui", "frontend/src/pages"]
tech_stack:
  added: []
  patterns:
    - "upload-on-select: preview from URL.createObjectURL before upload completes"
    - "label wrapping hidden input for accessible custom file upload"
    - "Escape key listener via useEffect cleanup pattern"
    - "URL.revokeObjectURL in cleanup to prevent memory leaks"
key_files:
  created:
    - frontend/src/components/ui/ImageLightbox.tsx
  modified:
    - frontend/src/components/fanbase/SeatTipCard.tsx
    - frontend/src/components/fanbase/CreatePostModal.tsx
    - frontend/src/pages/ProfilePage.tsx
decisions:
  - "photoFile state retained even though not read in JSX — used only in handler logic; tsc does not flag it as unused"
  - "SeatTipCard outer div loses p-5 so photo can be edge-to-edge; content wrapped in inner div with p-5"
  - "lightboxOpen state lives in SeatTipCard, not in a parent — avoids lifting state for a single-card concern"
  - "In edit mode photoPreviewUrl and photoUploadedUrl are pre-filled from editPost.photoUrl (both point to the existing Azure URL)"
metrics:
  duration: "2 min"
  completed_date: "2026-03-21"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 4
---

# Phase 10 Plan 02: Photo Upload Frontend UX Summary

Photo upload UX wired end-to-end: upload-on-select with local preview in CreatePostModal Seat Tip form, photo display + ImageLightbox on SeatTipCard, and functional avatar upload on ProfilePage.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Create ImageLightbox and add photo to SeatTipCard | 7545524 | done |
| 2 | Add photo upload to CreatePostModal and ProfilePage | 979650f | done |
| 3 | Verify photo upload flow end-to-end | — | approved (all 17 steps passed) |

## What Was Built

### ImageLightbox (`frontend/src/components/ui/ImageLightbox.tsx`)
Fullscreen overlay component with:
- `bg-black/80` backdrop that closes on click (`role="button"` + `aria-label="Close photo"`)
- `useEffect` Escape key listener with cleanup (removes listener on unmount)
- Image `onClick` uses `e.stopPropagation()` so clicking the image does not close the overlay
- No animation — instant show/hide consistent with existing modals

### SeatTipCard updates
- Restructured outer div: removed `p-5` from outer, wrapped content in inner `<div className="p-5">`
- Photo renders before the content div — `w-full max-h-64 object-cover rounded-t-lg cursor-pointer`
- `lightboxOpen` state controls the `ImageLightbox` conditional render at bottom of return
- Removed old "Photos are a Phase 4 feature" comment

### CreatePostModal photo upload
- 5 new state variables: `photoFile`, `photoPreviewUrl`, `photoUploadedUrl`, `photoUploading`, `photoError`
- Edit mode pre-fills both `photoPreviewUrl` and `photoUploadedUrl` from `editPost.photoUrl`
- `handlePhotoSelect`: validates type (jpeg/png/webp) and size (5MB), shows local preview immediately via `URL.createObjectURL`, uploads to `POST /api/upload` in background
- `handleRemovePhoto`: revokes object URL (memory leak prevention), clears all photo state
- Photo input UI in SEAT_TIP block: dashed border drop zone → preview thumbnail with spinner overlay → "Remove photo" button
- `photoUrl: photoUploadedUrl` included in both CREATE and EDIT payloads (null if no photo or upload failed)
- No `Content-Type` header set on upload fetch — browser sets multipart boundary automatically

### ProfilePage avatar upload
- `handleAvatarSelect`: validates file, uploads to `POST /api/upload`, PATCHes `/api/users/me` with `avatarUrl`, calls `refreshAuth()` for Navbar update
- Replaced disabled "Upload photo (coming soon)" button with `<label>` wrapping hidden `<input type="file">`
- Loading state: button text changes to "Uploading...", `cursor-not-allowed` applied
- Error message shown inline below the upload button

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx tsc --noEmit`: exits 0 (no errors)
- `npx jest --no-coverage`: 86/86 tests pass
- Human end-to-end verification: passed (all 17 steps approved 2026-03-21)

## Self-Check

- [x] `frontend/src/components/ui/ImageLightbox.tsx` — FOUND
- [x] `frontend/src/components/fanbase/SeatTipCard.tsx` — FOUND (modified)
- [x] `frontend/src/components/fanbase/CreatePostModal.tsx` — FOUND (modified)
- [x] `frontend/src/pages/ProfilePage.tsx` — FOUND (modified)
- [x] Commit 7545524 — FOUND
- [x] Commit 979650f — FOUND

## Self-Check: PASSED
