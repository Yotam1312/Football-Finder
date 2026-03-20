---
phase: 09-oauth-foundation
plan: "04"
subsystem: frontend-auth
tags: [oauth, google, frontend, react, routing, auth-types]
dependency_graph:
  requires: [09-02, 09-03]
  provides: [frontend-google-oauth-ui]
  affects: [frontend-auth-pages, frontend-routing, frontend-types]
tech_stack:
  added: []
  patterns: [window-location-href-redirect, useSearchParams-error-handling]
key_files:
  created:
    - frontend/src/pages/WelcomePage.tsx
  modified:
    - frontend/src/types/index.ts
    - frontend/src/pages/LoginPage.tsx
    - frontend/src/pages/RegisterPage.tsx
    - frontend/src/App.tsx
  deleted:
    - frontend/src/pages/SetPasswordPage.tsx
decisions:
  - "Google OAuth button uses window.location.href (not fetch) — OAuth requires real browser navigation"
  - "oauthError (cancelled) is kept separate from form error state — different triggers and UX"
  - "WelcomePage has no route guard — only new Google users are redirected here by the backend"
metrics:
  duration: "4 minutes"
  completed_date: "2026-03-20"
  tasks_completed: 3
  files_changed: 5
---

# Phase 9 Plan 04: Frontend OAuth UI Summary

**One-liner:** Wired Google OAuth into login/register pages via window.location.href redirect, added WelcomePage for new users, removed Level 2 SetPasswordPage flow.

## What Was Built

All three frontend auth pages now support Google OAuth sign-in alongside the existing email+password forms. The AuthUser type was updated to reflect the new backend shape (avatarUrl, country, accountType). The Level 2 SetPasswordPage flow was fully removed.

## Changes by File

### frontend/src/types/index.ts
Updated the `AuthUser` interface for Phase 9:
- `level` changed from `2 | 3` to always `3` (Level 2 removed)
- Added `avatarUrl: string | null` — Google photo URL or custom upload (Phase 10)
- Added `country: string | null` — editable on profile page
- Added `accountType: 'google' | 'email'` — controls password section visibility in profile
- `age` and `favoriteClubId` changed from optional (`?`) to explicitly nullable (matching the backend response)

### frontend/src/pages/LoginPage.tsx
- Added `useSearchParams` to detect `?error=cancelled` from failed Google OAuth
- `oauthError` shown below the form (above the Google button) as inline red text
- Added `handleGoogleSignIn` that sets `window.location.href = /api/auth/google?returnTo=...`
- Added "Continue with Google" button with SVG Google logo below the email form
- Added "or" divider between email form and Google button
- Added "Don't have an account? Register" link

### frontend/src/pages/RegisterPage.tsx
- Added `useSearchParams` and `handleGoogleSignIn` (same pattern as LoginPage)
- Added "Continue with Google" button ABOVE the email registration form
- Added "or register with email" divider between Google button and form

### frontend/src/pages/WelcomePage.tsx (new)
- One-time welcome screen shown to new Google users after first sign-in
- Shows user's name from auth context if available
- "Start exploring" link navigates to `/`
- No route guard — backend controls who lands here

### frontend/src/App.tsx
- Replaced `SetPasswordPage` import with `WelcomePage`
- Replaced `/set-password` route with `/welcome`
- Updated comment from "Phase 4 & 5" to "Phase 9"

### frontend/src/pages/SetPasswordPage.tsx (deleted)
- Level 2 (email-only) auth flow is removed in Phase 9
- File deleted; route removed from App.tsx

## Verification

- `cd frontend && npx tsc --noEmit` — exit code 0, zero errors
- Vite dev server starts cleanly
- `/login` shows email+password form and Google button
- `/login?error=cancelled` shows "Sign-in was cancelled. Please try again."
- `/register` shows Google button above email form
- `/welcome` renders WelcomePage
- `/set-password` now returns the NotFoundPage (404)

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 30d032b | Update AuthUser type and delete SetPasswordPage |
| 2 | da1f9a4 | Add Google sign-in buttons and create WelcomePage |
| 3 | 02984dd | Update App.tsx routes — add /welcome, remove /set-password |

## Self-Check: PASSED
