---
phase: 09-oauth-foundation
plan: 02
subsystem: auth
tags: [oauth, google, jwt, cookies, backend]
dependency_graph:
  requires: [09-01]
  provides: [google-oauth-flow, getMe-v2]
  affects: [frontend-auth-buttons, profile-page]
tech_stack:
  added: [google-auth-library@10.6.2]
  patterns: [oauth2-authorization-code-flow, cookie-based-return-to]
key_files:
  created:
    - backend/src/lib/google-oauth.ts
  modified:
    - backend/src/controllers/auth.controller.ts
    - backend/src/routes/auth.routes.ts
    - backend/src/__tests__/auth.test.ts
decisions:
  - "Use returnTo cookie (not OAuth state param) — state param appears in browser address bar history; cookie is more private"
  - "Google users always get level 3 JWT — they have a verified email via Google; no separate upgrade step needed"
  - "getMe level derivation: (passwordHash || googleId) ? 3 : 2 — fixes incorrect level 2 assignment for Google-only users"
  - "setPassword function removed from auth.controller.ts — route was removed in Plan 01; function is now dead code"
metrics:
  duration: ~45min
  completed: 2026-03-20
  tasks_completed: 3
  files_changed: 4
---

# Phase 9 Plan 02: Google OAuth Backend Flow Summary

Google OAuth authorization code flow implemented end-to-end on the backend, including redirect, callback with user create/link logic, and updated getMe response shape.

## What Was Built

### New File: backend/src/lib/google-oauth.ts

A singleton `OAuth2Client` instance created once and shared across controllers. Reads `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` from environment variables. Installed `google-auth-library` v10.6.2.

### New Controllers in auth.controller.ts

**googleRedirect**
- Reads optional `?returnTo=` query param (defaults to `/`)
- Stores `returnTo` in an httpOnly `oauth_return_to` cookie (10-minute TTL)
- Generates Google consent screen URL with `userinfo.email` and `userinfo.profile` scopes
- Redirects the browser to Google

**googleCallback**
- If no `code` param: redirects to `FRONTEND_URL/login?error=cancelled`
- Exchanges code for access token via `oauth2Client.getToken()`
- Fetches Google profile from `https://www.googleapis.com/oauth2/v2/userinfo`
- Finds existing user by `googleId` OR `email` (handles email+password accounts)
- Three branches:
  - No user found: creates new user with `googleId`, `avatarUrl`, `passwordHash: null`; redirects to `/welcome`
  - User found with `googleId`: existing Google user; redirects to `returnTo` (or `/`)
  - User found without `googleId`: links `googleId` to existing email+password account; redirects to `returnTo`
- Calls `setAuthCookie(res, user.id, 3)` for all success paths
- Clears `oauth_return_to` cookie after reading it

**Updated getMe**
- Level: `(passwordHash || googleId) ? 3 : 2` — fixes incorrect level 2 for Google users
- Response now includes: `avatarUrl`, `country`, `age`, `favoriteClubId`, `accountType` (`'google'` or `'email'`)
- `accountType` tells the frontend whether to show password change section

### Updated Routes: auth.routes.ts

- Removed `requireAuth` import (no longer needed after set-password route was removed in Plan 01)
- Added `GET /google` → `authController.googleRedirect`
- Added `GET /google/callback` → `authController.googleCallback`

### Removed: setPassword function

The `setPassword` function was present in auth.controller.ts but its route was already removed in Plan 01. The dead function was cleaned up in this plan.

## Test Coverage

17 tests total — all passing. New tests added in `backend/src/__tests__/auth.test.ts`:

- `GET /api/auth/google` — 302 redirect with `accounts.google.com` in Location
- `GET /api/auth/google/callback` with no code — 302 to `/login?error=cancelled`
- `GET /api/auth/google/callback?error=access_denied` — 302 to `/login?error=cancelled`
- New user callback — creates user, sets cookie, redirects to `/welcome`
- Returning Google user — finds user, sets cookie, redirects to `/`
- Email+password user linking — links googleId, does NOT call `user.create`, redirects to `/`
- `GET /api/auth/me` for Google user — level 3, `accountType: 'google'`, `avatarUrl` and `country` present
- `GET /api/auth/me` for email user — level 3, `accountType: 'email'`

Mock strategy: `jest.mock('../lib/google-oauth')` for OAuth2Client; `global.fetch = jest.fn()` for Google userinfo endpoint; `prisma.user.findFirst` added to mock (previously missing).

## Deviations from Plan

None — plan executed exactly as written. The Prisma mock in the test file was missing `findFirst`, which was added as part of the test setup (correcting the mock to match the actual implementation pattern described in the plan).

## Self-Check: PASSED

- backend/src/lib/google-oauth.ts: FOUND
- backend/src/controllers/auth.controller.ts: FOUND
- backend/src/routes/auth.routes.ts: FOUND
- Commit ee5d4e2 (google-auth-library + oauth2Client): FOUND
- Commit 5720c0c (failing tests): FOUND
- Commit 1e559d1 (controllers + routes): FOUND
- All 17 tests: PASS
