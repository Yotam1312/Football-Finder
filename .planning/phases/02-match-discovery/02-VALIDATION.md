---
phase: 2
slug: match-discovery
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-15
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + ts-jest (Wave 0 installs) |
| **Config file** | `backend/jest.config.ts` — Wave 0 creates |
| **Quick run command** | `cd backend && npx jest --passWithNoTests` |
| **Full suite command** | `cd backend && npx jest` |
| **Estimated runtime** | ~10 seconds |

> **Note:** This is a student project with no existing test infrastructure. Phase 2 is frontend-heavy (visual scaffold). Validation focuses on backend API contract tests only. Frontend component testing is deferred to Phase 5 polish.

---

## Sampling Rate

- **After every task commit:** Run `cd backend && npx jest --passWithNoTests`
- **After every plan wave:** Run `cd backend && npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | MATCH-02 | unit | `cd backend && npx jest utils.normalizeCity` | ❌ W0 | ✅ green |
| 2-01-02 | 01 | 0 | MATCH-02 | integration | `cd backend && npx jest match.search` | ❌ W0 | ✅ green |
| 2-01-03 | 01 | 0 | MATCH-03 | integration | `cd backend && npx jest match.detail` | ❌ W0 | ✅ green |
| 2-02-xx | 02 | 1 | MATCH-01 | manual | Browser: homepage form submits correct URL | N/A | ✅ green |
| 2-03-xx | 03 | 2 | MATCH-02 | manual | Browser: results page shows match cards | N/A | ✅ green |
| 2-04-xx | 04 | 3 | MATCH-03,04,05,06 | manual | Browser: detail page shows stats, tickets, maps | N/A | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/package.json` — add `jest`, `ts-jest`, `@types/jest` to devDependencies
- [ ] `backend/jest.config.ts` — configure ts-jest preset
- [ ] `backend/src/__tests__/utils.normalizeCity.test.ts` — unit tests for city normalization (covers MATCH-02)
- [ ] `backend/src/__tests__/match.search.test.ts` — integration test for `GET /api/matches/search` (covers MATCH-02 city search + date range edge case)
- [ ] `backend/src/__tests__/match.detail.test.ts` — integration test for `GET /api/matches/:id` (covers MATCH-03, MATCH-04, MATCH-05, MATCH-06)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Homepage search form submits correct URL params (`/results?city=London&from=...&to=...`) | MATCH-01 | Visual/browser — form submit + navigation | Open browser, fill city + dates, click Find Matches, verify URL in address bar |
| "Use Current Location" pre-fills city input from geolocation | MATCH-01 | Browser API — requires physical location or DevTools override | Use Chrome DevTools > Sensors to set location, click button, verify city input is filled |
| Match cards show team logos (or initials fallback), league badge, local time, stadium name | MATCH-02 | Visual rendering — requires live data in DB | Search for a city with known fixtures (e.g. "London"), verify card layout |
| Match detail page shows team crests, league badge, full date/time in local timezone, stats | MATCH-03 | Visual rendering + timezone correctness | Open a match detail page, verify time matches expected local timezone for that city |
| "Buy Tickets" button hidden when ticketUrl is null | MATCH-04 | Requires DB row without ticketUrl | Verify on any match detail page (all current fixtures have no ticketUrl) |
| "Navigate to Stadium" opens correct Google Maps URL | MATCH-05 | Browser navigation + URL correctness | Click button, verify new tab opens to correct Google Maps search |
| Team name links navigate to `/fanbase/team/:teamId` stub | MATCH-06 | React Router link + stub page | Click team name on detail page, verify stub "FanBase coming soon" page appears |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-19
