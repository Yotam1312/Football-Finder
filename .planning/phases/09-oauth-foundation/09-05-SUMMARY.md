---
phase: 09-oauth-foundation
plan: 05
subsystem: ui
tags: [react, typescript, auth, navbar, profile, dropdown]

# Dependency graph
requires:
  - phase: 09-03
    provides: PATCH /api/users/me, PATCH /api/users/me/password, DELETE /api/users/me endpoints
  - phase: 09-04
    provides: AuthUser type with avatarUrl/country/accountType, WelcomePage and /welcome route in App.tsx
provides:
  - Navbar with Hi, {name} dropdown replacing Level 2/3 separate auth branches
  - ProfilePage with avatar display, account type badge, profile edit form, password change, delete account
  - /profile route in App.tsx
affects: [phase-10-photo-upload, phase-11-league-expansion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useRef + useEffect for dropdown outside-click close
    - Conditional section rendering based on accountType (email vs google)
    - Confirmation modal pattern for destructive actions (delete account)

key-files:
  created:
    - frontend/src/pages/ProfilePage.tsx
  modified:
    - frontend/src/components/Navbar.tsx
    - frontend/src/App.tsx

key-decisions:
  - "Navbar Level 2 branch fully removed — all authenticated users are now Level 3 (Google or email+password)"
  - "Upload photo button disabled with title tooltip — Azure Blob deferred to Phase 10"
  - "Password change section conditionally rendered only for accountType === email users"
  - "Delete account uses two-step confirmation (show confirm UI, then call API) rather than browser confirm() dialog for better UX"

patterns-established:
  - "Dropdown close on outside click: useRef<HTMLDivElement> + useEffect with mousedown listener"
  - "Account-type conditional sections: user.accountType === 'email' guard for email-only features"

requirements-completed: [OAUTH-03, OAUTH-04]

# Metrics
duration: 2min
completed: 2026-03-20
---

# Phase 9 Plan 05: Navbar Dropdown and Profile Page Summary

**Navbar Hi, {name} dropdown with outside-click close, and full ProfilePage with avatar, account type badge, editable personal details, email-only password change section, and two-step delete account confirmation**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-20T10:15:30Z
- **Completed:** 2026-03-20T10:17:16Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Replaced Navbar's separate Level 2/Level 3 auth branches with a single "Hi, {name}" dropdown for all authenticated users
- Implemented dropdown close on outside click using useRef + useEffect mousedown listener
- Created ProfilePage with six sections: avatar display, account type badge, personal details form, password change (email users only), and danger zone with delete confirmation
- Wired /profile route into App.tsx alongside the existing /welcome route from Plan 04

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Navbar — replace auth section with Hi, {name} dropdown** - `cdd2b8d` (feat)
2. **Task 2: Create ProfilePage and wire up to App.tsx** - `8652186` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `frontend/src/components/Navbar.tsx` - Replaced Level 2/3 branches with single dropdown; added useState, useRef, useEffect imports
- `frontend/src/pages/ProfilePage.tsx` - New page: avatar section, account type badge, profile edit form (PATCH /api/users/me), password change (PATCH /api/users/me/password, email users only), delete account with confirmation (DELETE /api/users/me)
- `frontend/src/App.tsx` - Added ProfilePage import and /profile route

## Decisions Made
- Level 2 branch removed from Navbar — the old /set-password flow is gone; all authenticated users are Level 3. The dropdown is the single logged-in UI regardless of account type.
- Upload photo button is disabled with a tooltip. Azure Blob setup is required before any upload code is written (Phase 10).
- Password change section guarded by `user.accountType === 'email'` — Google users cannot change password (they authenticate via Google).
- Delete confirmation uses inline JSX state (showDeleteConfirm) rather than browser's `window.confirm()` for consistent cross-browser UX.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — TypeScript compilation passed clean on first attempt for both tasks.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 9 frontend is complete: Google sign-in buttons (Plan 04), navbar dropdown, and profile page are all in place
- The full OAuth flow (Google consent → /welcome or / redirect → Hi, {name} navbar) is ready for end-to-end browser testing
- Phase 10 (photo upload) requires Azure Blob CORS pre-flight before any multer/upload code is written

---
*Phase: 09-oauth-foundation*
*Completed: 2026-03-20*
