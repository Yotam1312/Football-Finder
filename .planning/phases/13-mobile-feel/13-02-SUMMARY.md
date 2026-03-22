---
phase: 13-mobile-feel
plan: 02
subsystem: frontend/pages
tags: [animation, framer-motion, page-transitions, mobile-feel]
dependency_graph:
  requires: [13-01]
  provides: [fade-page-transitions]
  affects: [frontend/src/pages/*, frontend/src/App.tsx]
tech_stack:
  added: []
  patterns: [AnimatePresence mode=wait, motion.div fade variants, exit animation]
key_files:
  created: []
  modified:
    - frontend/src/pages/HomePage.tsx
    - frontend/src/pages/ResultsPage.tsx
    - frontend/src/pages/FanBasePage.tsx
    - frontend/src/pages/MatchDetailPage.tsx
    - frontend/src/pages/ProfilePage.tsx
    - frontend/src/pages/ContactPage.tsx
    - frontend/src/pages/TransportPage.tsx
    - frontend/src/pages/TeamFanBasePage.tsx
    - frontend/src/pages/NotFoundPage.tsx
    - frontend/src/pages/LoginPage.tsx
    - frontend/src/pages/RegisterPage.tsx
    - frontend/src/pages/WelcomePage.tsx
decisions:
  - "Replace slide-in entrance animations (opacity+y) with pure opacity fade on ContactPage, TransportPage, TeamFanBasePage, NotFoundPage — page transitions should be clean fades, not slides"
  - "All 3 return statements in MatchDetailPage (loading, error, success) wrapped in motion.div — AnimatePresence requires consistent motion.div outermost element across all code paths"
metrics:
  duration: 3min
  completed: "2026-03-22"
  tasks_completed: 1
  files_modified: 12
---

# Phase 13 Plan 02: Page Fade Transitions Summary

**One-liner:** 200ms opacity fade transitions added to all 12 page components via motion.div with exit variant, wired to existing AnimatePresence mode=wait in App.tsx.

## What Was Built

All 12 page components now have outermost `motion.div` wrappers with:
- `initial={{ opacity: 0 }}`
- `animate={{ opacity: 1 }}`
- `exit={{ opacity: 0 }}`
- `transition={{ duration: 0.2, ease: 'easeInOut' }}`

These props connect to the `AnimatePresence mode="wait"` already in `App.tsx` (set up in Plan 13-01). When a user navigates, the outgoing page fades to opacity 0 first, then the incoming page fades in from opacity 0 — producing a clean, app-like 200ms crossfade.

### Changes by Category

**Category A — already motion.div, replaced entrance animation with fade:**
- `ContactPage.tsx` — replaced `initial={{ opacity: 0, y: 12 }}` with pure opacity fade
- `TransportPage.tsx` — same replacement
- `NotFoundPage.tsx` — same replacement
- `TeamFanBasePage.tsx` — same on main return; also converted error return `<div>` to `<motion.div>`

**Category B — plain `<div>` outermost, converted to motion.div:**
- `HomePage.tsx` — already had `motion` imported; changed outermost div to motion.div
- `ResultsPage.tsx` — already had `motion` imported; changed outermost div to motion.div
- `FanBasePage.tsx` — already had `motion` imported; changed outermost div to motion.div
- `MatchDetailPage.tsx` — already had `motion` imported; all 3 return statements (loading, error, success) converted
- `ProfilePage.tsx` — added `motion` import; converted outermost div
- `LoginPage.tsx` — added `motion` import; converted outermost div
- `RegisterPage.tsx` — added `motion` import; converted outermost div
- `WelcomePage.tsx` — added `motion` import; converted outermost div

## Verification

- TypeScript compilation: passed with no errors
- `grep -rl "exit.*opacity.*0" frontend/src/pages/` — all 12 page files
- `grep -rl "duration: 0.2" frontend/src/pages/` — all 12 page files
- `grep -c "exit" frontend/src/pages/MatchDetailPage.tsx` — 3 occurrences

## Deviations from Plan

None — plan executed exactly as written.

## Decisions Made

1. Replacing slide-in entrance animations (`y: 12`) with pure opacity fade on Category A pages: page transitions should be a clean fade, not a slide, for a consistent app-like feel. The y-animation was appropriate for page-load entrance; it's unsuitable when the "entrance" is triggered by navigating away from another page mid-session.

2. MatchDetailPage has 3 return statements — all three wrapped in `motion.div` to guarantee AnimatePresence always has a `motion.div` as the exit target regardless of which loading state triggered the unmount.

## Self-Check

All modified files verified:
- `frontend/src/pages/HomePage.tsx` — exists, contains `exit={{ opacity: 0 }}`
- `frontend/src/pages/LoginPage.tsx` — exists, contains `import { motion }` and `exit={{ opacity: 0 }}`
- `frontend/src/pages/ProfilePage.tsx` — exists, contains `import { motion }` and `exit={{ opacity: 0 }}`
- Commit 42059a1 — exists in git log

## Self-Check: PASSED
