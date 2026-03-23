---
phase: 13-mobile-feel
plan: "01"
subsystem: frontend/navigation
tags: [mobile, navigation, ux, tailwind]
dependency_graph:
  requires: []
  provides: [mobile-bottom-nav]
  affects: [frontend/src/App.tsx, frontend/src/components/BottomNav.tsx, frontend/src/pages/*]
tech_stack:
  added: []
  patterns: [fixed-bottom-nav, safe-area-inset, responsive-padding]
key_files:
  created:
    - frontend/src/components/BottomNav.tsx
  modified:
    - frontend/src/App.tsx
    - frontend/src/pages/HomePage.tsx
    - frontend/src/pages/ResultsPage.tsx
    - frontend/src/pages/FanBasePage.tsx
    - frontend/src/pages/MatchDetailPage.tsx
    - frontend/src/pages/ProfilePage.tsx
    - frontend/src/pages/ContactPage.tsx
    - frontend/src/pages/TransportPage.tsx
    - frontend/src/pages/TeamFanBasePage.tsx
    - frontend/src/pages/NotFoundPage.tsx
decisions:
  - "Profile tab sends guests to /login — avoids a dead end on the profile page"
  - "BottomNav rendered outside AnimatePresence — bar is stable during page transitions"
  - "pb-20 md:pb-0 on page wrappers — clears 56px nav bar on mobile, no wasted space on desktop"
metrics:
  duration: 8min
  completed: 2026-03-22
  tasks_completed: 2
  files_changed: 11
---

# Phase 13 Plan 01: Mobile Bottom Navigation Summary

**One-liner:** Fixed 3-tab bottom nav (Search/FanBase/Profile) for mobile with green-600 active state, safe-area iPhone support, and pb-20 padding on all content pages.

## What Was Built

A new `BottomNav` component provides app-like thumb-friendly navigation on mobile viewports. The bar is fixed to the bottom of the screen, hidden on desktop via `md:hidden`, and excluded from Framer Motion's AnimatePresence so it does not animate on route changes.

### BottomNav component (`frontend/src/components/BottomNav.tsx`)

- 3 tabs: Search (maps to `/`), FanBase (`/fanbase`), Profile (`/profile`)
- Active tab detection is prefix-based; the Search tab matches `/`, `/results`, and `/match/:id`
- Profile tab redirects unauthenticated users to `/login` instead of `/profile`
- Hidden on `/login`, `/register`, `/welcome` via `HIDDEN_ROUTES` array
- `md:hidden` makes it invisible on desktop — the top Navbar remains the primary nav there
- `pb-[env(safe-area-inset-bottom)]` respects iPhone home indicator safe area
- `min-h-[48px]` touch targets per accessibility guidelines
- Active color: `text-green-600 font-medium`; inactive: `text-gray-500`

### App.tsx integration

`BottomNav` is imported and rendered after `</AnimatePresence>` so it stays stable across page transitions.

### Page padding

`pb-20 md:pb-0` added to the outermost wrapper of all 9 non-auth pages. This adds 80px bottom padding on mobile (clears the 56px nav bar with headroom) and removes it on desktop. `MatchDetailPage` has three return paths (loading, error, success) — all three updated.

## Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Create BottomNav component | b9ac4f6 |
| 2 | Integrate in App.tsx + page padding | 50c1bf6 |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `frontend/src/components/BottomNav.tsx` — FOUND
- Commit b9ac4f6 (Task 1) — FOUND
- Commit 50c1bf6 (Task 2) — FOUND
