---
phase: 05-polish-and-launch
plan: "04"
subsystem: frontend-auth
tags: [auth, registration, contact, frontend, modal]
dependency_graph:
  requires: [05-01]
  provides: [RegisterPage, ContactPage, AuthGateModal, updated-CreatePostModal]
  affects: [TeamFanBasePage, Navbar, App.tsx]
tech_stack:
  added: []
  patterns: [plain-useState-forms, framer-motion-page-transitions, auth-gate-pattern]
key_files:
  created:
    - frontend/src/pages/RegisterPage.tsx
    - frontend/src/pages/ContactPage.tsx
    - frontend/src/components/fanbase/AuthGateModal.tsx
  modified:
    - frontend/src/components/fanbase/CreatePostModal.tsx
    - frontend/src/pages/TeamFanBasePage.tsx
    - frontend/src/components/Navbar.tsx
    - frontend/src/App.tsx
    - frontend/src/types/index.ts
  deleted:
    - frontend/src/pages/VerifyPage.tsx
decisions:
  - "AuthGateModal intercepts guest clicks on Add Your Tip — modal is simpler than redirect and keeps the user on the same page"
  - "CreatePostModal author name shown as read-only when user is logged in — prevents name mismatch between account and post"
  - "VerifyPage.tsx deleted entirely since /verify/:token route is removed — keeping it would cause dead code and confusion"
  - "POST /api/posts used directly for new posts (no more /api/auth/request-post) — matches the backend retirement of hybrid flow in Plan 01"
metrics:
  duration: "4 minutes"
  completed_date: "2026-03-17"
  tasks_completed: 2
  files_changed: 8
---

# Phase 5 Plan 04: Frontend Auth Overhaul Summary

Frontend auth overhaul: RegisterPage with full account fields, ContactPage with two-column layout, AuthGateModal intercepting guests on FanBase, and CreatePostModal simplified to direct POST with cookie auth (no email verification step).

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | RegisterPage + ContactPage + AuthGateModal | 182c501 | RegisterPage.tsx, ContactPage.tsx, AuthGateModal.tsx, types/index.ts |
| 2 | Update CreatePostModal, TeamFanBasePage, Navbar, App.tsx | aa7cf8e | CreatePostModal.tsx, TeamFanBasePage.tsx, Navbar.tsx, App.tsx, VerifyPage.tsx (deleted) |

## What Was Built

### RegisterPage (`/register`)
Full account registration form following the same plain-useState pattern as LoginPage. Collects email, password (required), name (required), age (optional), and favoriteClubId (optional). On success, calls `refreshAuth()` so the Navbar picks up the new user immediately, then redirects to home. Includes link to `/login` for existing users.

### ContactPage (`/contact`)
Two-column layout (stacks on mobile): left column has a "Contact Information" card (email, Instagram, TikTok) and a "Quick Help" card with two FAQ items. Right column has a "Send us a Message" form with name + email side-by-side, subject, and message textarea. On success, replaces the form with an inline success message. Uses Framer Motion page entry animation.

### AuthGateModal
Modal shown when a guest clicks "+ Add Your Tip" on the team FanBase page. Contains "Create Account" and "Log In" buttons that link to `/register` and `/login` respectively. Clicking either button or the backdrop closes the modal.

### CreatePostModal (updated)
Removed the three-step hybrid flow (type-picker → form → check-email) in favour of a two-step flow (type-picker → form). Key changes:
- Removed the email input field entirely
- Removed the "check-email" confirmation step and all its state
- Author name is now read-only when the user is logged in (pre-filled from `user.name`)
- Create mode now calls `POST /api/posts` directly with cookie auth instead of `POST /api/auth/request-post`
- On 401: shows an error message (safeguard; shouldn't happen since AuthGateModal blocks guests)

### TeamFanBasePage (updated)
Added `isAuthGateOpen` state. The "+ Add Your Tip" button now calls `handleAddTipClick()` which checks `user`: guests get `setIsAuthGateOpen(true)`, logged-in users get `setIsModalOpen(true)`. `AuthGateModal` rendered alongside `CreatePostModal`.

### Navbar (updated)
Guest branch (previously `null`) now renders "Log in" and "Register" links with accessible min-height and green styling for the Register button.

### App.tsx (updated)
- Added `/register` → `RegisterPage`
- Added `/contact` → `ContactPage`
- Removed `/verify/:token` route
- Removed `VerifyPage` import
- Deleted `VerifyPage.tsx`

### types/index.ts (updated)
Added `age?: number | null` and `favoriteClubId?: number | null` to the `AuthUser` interface to match the fields returned by the updated `/api/auth/me` endpoint.

## Verification

- `npx tsc --noEmit`: clean (no errors)
- `npm run build`: production build succeeded (464 kB JS bundle, 26 kB CSS)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files created:
- frontend/src/pages/RegisterPage.tsx — FOUND
- frontend/src/pages/ContactPage.tsx — FOUND
- frontend/src/components/fanbase/AuthGateModal.tsx — FOUND

Files deleted:
- frontend/src/pages/VerifyPage.tsx — DELETED (confirmed via git rm)

Commits:
- 182c501 — FOUND
- aa7cf8e — FOUND
