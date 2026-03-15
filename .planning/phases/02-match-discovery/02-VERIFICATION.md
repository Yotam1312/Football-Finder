---
phase: 02-match-discovery
verified: 2026-03-15T00:00:00Z
status: human_needed
score: 5/5 must-haves verified (all automated checks pass)
human_verification:
  - test: "Search for a city with fixtures (e.g. 'London') and verify the results page shows real match cards"
    expected: "Match cards appear with team logos or 3-letter initials, league name, date/time in venue local timezone, and stadium name"
    why_human: "Requires a live database with synced fixture data — cannot verify card rendering with real data programmatically"
  - test: "Click 'Navigate to Stadium' on a match card on the results page"
    expected: "A new browser tab opens at Google Maps with a query like 'Stamford Bridge, London'"
    why_human: "Requires browser interaction and live data to confirm the correct stadium query is built"
  - test: "Click 'View Details' on a match card then verify the detail page"
    expected: "Detail page shows large team crests (or initials), league name on green hero, three info tiles (date, time, venue in local timezone), and Navigate to Stadium button"
    why_human: "Requires live DB data and visual inspection — local timezone display cannot be confirmed programmatically"
  - test: "Verify 'Buy Tickets' button is hidden on the detail page for current fixtures"
    expected: "No 'Buy Tickets' button is visible (all current DB rows have ticketUrl=null)"
    why_human: "Requires the running app with real DB data to confirm conditional render behavior"
  - test: "Click a FanBase link (e.g. 'Chelsea FanBase') on a match detail page"
    expected: "Navigates to /fanbase/team/:teamId and shows the 'FanBase Coming Soon' stub page"
    why_human: "Requires browser interaction and live match data to confirm the team id is wired correctly"
  - test: "Verify team stats section on the detail page"
    expected: "StatBar renders with wins/draws/losses/points/goal difference for both teams when standings are populated; hidden when both are null"
    why_human: "Requires standings data in DB (populated by sync job) and visual inspection"
---

# Phase 2: Match Discovery Verification Report

**Phase Goal:** A user can type a city and date range on the homepage and see every match happening there, then drill into any match for full details, ticket links, and stadium navigation
**Verified:** 2026-03-15
**Status:** human_needed — all automated checks pass; 6 items require human verification with live dev servers
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | User types "London" and a date range on the homepage and sees match cards with logos, league badge, date/time in venue local timezone, and stadium name | ? HUMAN NEEDED | HomePage.tsx has fully implemented search form with city/from/to inputs and navigate-to-/results wiring. MatchCard.tsx renders all required fields using formatMatchDate/formatMatchTime with stadium.timezone. Requires live data to confirm. |
| 2 | User can click any match card and reach a detail page showing team crests, league badge, full date/time, venue name, and team stats | ? HUMAN NEEDED | MatchDetailPage.tsx is fully implemented. useMatchDetail hook fetches from /api/matches/:id. StatBar component renders side-by-side stats. All wiring verified. Requires live data to confirm rendering. |
| 3 | User can click "Buy Tickets" on a match detail page and be redirected to an external ticket seller in a new tab | ? HUMAN NEEDED | `{match.ticketUrl && <a href={match.ticketUrl} target="_blank">Buy Tickets</a>}` is present in MatchDetailPage.tsx (line 125). Schema has ticketUrl String? on Match. Conditional logic is correct. Requires browser to confirm. |
| 4 | User can click "Navigate to Stadium" and be taken directly to Google Maps directions for that venue | ? HUMAN NEEDED | buildMapsUrl.ts generates `https://www.google.com/maps/search/?api=1&query=...`. MatchCard.tsx and MatchDetailPage.tsx both open it in target="_blank". Requires browser to confirm correct URL. |
| 5 | User can click either team name on a match detail page and be taken to that team's FanBase page | ? HUMAN NEEDED | `<Link to={/fanbase/team/${match.homeTeam.id}>` and `<Link to={/fanbase/team/${match.awayTeam.id}>` present in MatchDetailPage.tsx (lines 157, 162). App.tsx has the /fanbase/team/:teamId stub route. Requires browser to confirm navigation. |

**Score:** 5/5 truths have complete implementation — all require human verification with live servers

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|---------|--------|---------|
| `backend/jest.config.ts` | ts-jest preset config | VERIFIED | testMatch glob `**/__tests__/**/*.test.ts` present, ts-jest transform configured |
| `backend/src/__tests__/utils.normalizeCity.test.ts` | normalizeCity unit tests | VERIFIED | 4 tests — all pass (10/10 total suite) |
| `backend/src/__tests__/match.search.test.ts` | Search endpoint integration tests | VERIFIED | 4 tests pass including 200 shape test against live DB |
| `backend/src/__tests__/match.detail.test.ts` | Detail endpoint integration tests | VERIFIED | 2 tests pass — 404 and 400 cases both green |
| `backend/prisma/schema.prisma` | TeamStanding model + ticketUrl on Match | VERIFIED | TeamStanding model present (lines 74-94), ticketUrl String? on Match (line 63) |
| `backend/src/jobs/sync.service.ts` | syncStandings() called in runFixtureSync() | VERIFIED | syncStandings() defined (line 179), called in runFixtureSync() (line 297) |
| `backend/src/utils/normalizeCity.ts` | normalizeCity() export | VERIFIED | Exports normalizeCity function, diacritics + lowercase + trim logic confirmed |
| `backend/src/controllers/match.controller.ts` | searchMatches + getMatchById handlers | VERIFIED | Both handlers export, Prisma queries complete, homeTeamStanding/awayTeamStanding returned |
| `backend/src/routes/match.routes.ts` | GET /search + GET /:id routes | VERIFIED | router.get('/search', ...) and router.get('/:id', ...) both present |
| `backend/src/app.ts` | match routes registered at /api/matches | VERIFIED | `app.use('/api/matches', matchRoutes)` on line 41 |
| `frontend/vite.config.ts` | Tailwind v4 plugin + /api proxy | VERIFIED | tailwindcss() plugin and proxy to port 3000 both present |
| `frontend/src/main.tsx` | QueryClientProvider + BrowserRouter entry | VERIFIED | QueryClientProvider wraps BrowserRouter wraps App — all correct |
| `frontend/src/App.tsx` | 4 routes including /fanbase/team/:teamId stub | VERIFIED | All 4 routes defined: /, /results, /match/:id, /fanbase/team/:teamId |
| `frontend/src/types/index.ts` | League, Team, Stadium, TeamStanding, Match, MatchDetail types | VERIFIED | All 6 interfaces exported |
| `frontend/src/components/Navbar.tsx` | Top nav with Football Finder branding | VERIFIED | Football/Finder text logo, Home link present |
| `frontend/src/utils/buildMapsUrl.ts` | buildMapsUrl() export | VERIFIED | Generates Google Maps search URL with encoded query |
| `frontend/src/utils/formatDate.ts` | formatMatchDate + formatMatchTime exports | VERIFIED | Uses Intl.DateTimeFormat with timeZone parameter |
| `frontend/src/components/TeamLogo.tsx` | Logo with 3-letter initials fallback | VERIFIED | onError state + initials fallback implemented |
| `frontend/src/components/MatchCard.tsx` | Match card with both action buttons | VERIFIED | View Details link + Navigate to Stadium anchor both present |
| `frontend/src/hooks/useMatchSearch.ts` | TanStack Query hook for search | VERIFIED | Fetches /api/matches/search, enabled guard on all 3 params |
| `frontend/src/pages/HomePage.tsx` | Full homepage with search form + testimonials | VERIFIED | Hero, city/from/to inputs, 2 buttons, 3 TESTIMONIALS rendered |
| `frontend/src/pages/ResultsPage.tsx` | Results page with skeleton, cards, empty state | VERIFIED | Skeleton, match cards, error state, empty state, pagination all implemented |
| `frontend/src/hooks/useMatchDetail.ts` | TanStack Query hook for detail | VERIFIED | Fetches /api/matches/:id, handles 404 specifically |
| `frontend/src/components/StatBar.tsx` | Side-by-side stats comparison | VERIFIED | StatRow grid, null guard, win rate and goal diff computed |
| `frontend/src/pages/MatchDetailPage.tsx` | Full detail page | VERIFIED | Hero, tiles, conditional ticketUrl, mapsUrl, FanBase Links, StatBar all wired |
| `backend/prisma/migrations/20260315_add_team_standing_and_ticket_url/` | Migration file | VERIFIED | migration.sql creates TeamStanding table and adds ticketUrl column |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `backend/src/app.ts` | `backend/src/routes/match.routes.ts` | `app.use('/api/matches', matchRoutes)` | WIRED | Line 41 confirmed |
| `backend/src/controllers/match.controller.ts` | `backend/src/config/database.ts` | `import prisma from '../config/database'` | WIRED | Line 2 of controller |
| `backend/src/controllers/match.controller.ts` | `backend/src/utils/normalizeCity.ts` | `import { normalizeCity } from '../utils/normalizeCity'` | WIRED | Line 3 of controller |
| `backend/src/jobs/sync.service.ts` | `prisma.teamStanding.upsert` | `syncStandings()` called in `runFixtureSync()` | WIRED | syncStandings at line 179, called at line 297 |
| `frontend/src/main.tsx` | `frontend/src/App.tsx` | QueryClientProvider > BrowserRouter > App | WIRED | Confirmed in main.tsx lines 18-26 |
| `frontend/src/App.tsx` | `frontend/src/pages/*.tsx` | `<Route path=... element={<Page />}>` | WIRED | All 3 real pages + fanbase stub wired |
| `frontend/src/pages/HomePage.tsx` | `frontend/src/pages/ResultsPage.tsx` | `useNavigate('/results?city=...&from=...&to=...')` | WIRED | handleSubmit calls `navigate('/results?${params}')` |
| `frontend/src/pages/ResultsPage.tsx` | `frontend/src/hooks/useMatchSearch.ts` | `useMatchSearch(city, from, to)` | WIRED | useMatchSearch imported and called with URL params |
| `frontend/src/components/MatchCard.tsx` | `frontend/src/utils/buildMapsUrl.ts` | `buildMapsUrl(match.stadium.name, match.stadium.city)` | WIRED | Lines 27-29 of MatchCard.tsx |
| `frontend/src/pages/MatchDetailPage.tsx` | `frontend/src/hooks/useMatchDetail.ts` | `useMatchDetail(id)` | WIRED | Line 12 of MatchDetailPage.tsx |
| `frontend/src/pages/MatchDetailPage.tsx` | `/fanbase/team/:teamId` | `<Link to={/fanbase/team/${match.homeTeam.id}>` | WIRED | Lines 157 and 162 of MatchDetailPage.tsx |
| `frontend/src/pages/MatchDetailPage.tsx` | `match.ticketUrl` | `{match.ticketUrl && <a href={match.ticketUrl}>}` | WIRED | Line 125 — correct conditional render |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| MATCH-01 | 02-03, 02-05 | User can search by city and date range on the homepage | SATISFIED | HomePage.tsx has city/from/to form; handleSubmit navigates to /results with URL params |
| MATCH-02 | 02-01, 02-04, 02-05 | User can see match cards (logos, league, date/time, venue) | SATISFIED | ResultsPage fetches via useMatchSearch, renders MatchCard with all required fields; 10/10 tests pass |
| MATCH-03 | 02-01, 02-02, 02-04, 02-06 | User can view full match details (crests, league, date/time, venue, team stats) | SATISFIED | MatchDetailPage renders hero, info tiles, StatBar; getMatchById returns homeTeamStanding + awayTeamStanding |
| MATCH-04 | 02-02, 02-06 | User can click "Buy Tickets" link (redirects to external seller) | SATISFIED | ticketUrl String? on Match schema; conditional render `{match.ticketUrl && <a target="_blank">}` in MatchDetailPage |
| MATCH-05 | 02-05, 02-06 | User can click "Navigate to Stadium" and go to Google Maps | SATISFIED | buildMapsUrl generates correct URL; MatchCard and MatchDetailPage both render anchor with target="_blank" |
| MATCH-06 | 02-03, 02-06 | User can navigate from detail page to either team's FanBase page | SATISFIED | /fanbase/team/:teamId route exists in App.tsx; both team Links in MatchDetailPage.tsx with correct teamId |

All 6 requirements claimed by Phase 2 plans are satisfied. No orphaned requirements detected.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `frontend/src/pages/HomePage.tsx` | 5-25 | Hardcoded TESTIMONIALS array | Info | Expected — plan documented "swap for real ones before public launch (Phase 5)" |
| `frontend/src/App.tsx` | 23-31 | `/fanbase/team/:teamId` renders stub "FanBase Coming Soon" div | Info | Expected — this is an intentional Phase 3 stub, not a blocker for Phase 2 goal |

No blocker anti-patterns found. The stub FanBase page is by design — MATCH-06 only requires navigation to work (linking to /fanbase/team/:teamId), not the FanBase page to be implemented.

### Test Suite Results

All 10 backend tests pass:
- `utils.normalizeCity.test.ts` — 4/4 green (London, München, Madrid, São Paulo)
- `match.search.test.ts` — 4/4 green (3x 400 validation + 1x 200 shape)
- `match.detail.test.ts` — 2/2 green (404 for unknown id, 400 for non-numeric id)

Frontend build: `npm run build` exits 0 — TypeScript compiles cleanly, 481 modules transformed.

### Human Verification Required

All automated checks pass. The following items require running dev servers
(`cd backend && npm run dev` on port 3000, `cd frontend && npm run dev` on port 5173):

#### 1. Homepage Search Flow (MATCH-01 + MATCH-02)

**Test:** Type "London" (or a city with fixture data), enter a date range, click "Find Matches"
**Expected:** URL changes to /results?city=london&from=...&to=..., skeleton cards appear briefly, then real match cards show team logos or 3-letter initials, league name, date/time in venue's local timezone, and stadium name
**Why human:** Requires live DB with synced fixture data

#### 2. Navigate to Stadium from Match Card (MATCH-05)

**Test:** On the results page, click "Navigate to Stadium" on any match card
**Expected:** New browser tab opens at Google Maps with the correct stadium and city in the query string
**Why human:** Requires browser interaction and real stadium data to confirm URL correctness

#### 3. Match Detail Page (MATCH-03)

**Test:** Click "View Details" on any match card
**Expected:** Detail page loads with green hero (large team crests or initials, league name, VS badge), three info tiles (date, time in local timezone, venue name), Navigate to Stadium button, and FanBase links for both teams
**Why human:** Requires live data and visual inspection — local timezone rendering cannot be verified programmatically

#### 4. Buy Tickets Button Conditional Render (MATCH-04)

**Test:** On any match detail page, check for "Buy Tickets" button
**Expected:** Button is NOT visible (all current DB fixtures have ticketUrl=null)
**Why human:** Requires running app to confirm conditional render with real data

#### 5. FanBase Links (MATCH-06)

**Test:** Click "[Team Name] FanBase" on a match detail page
**Expected:** Navigates to /fanbase/team/:teamId and shows "FanBase Coming Soon" stub page
**Why human:** Requires browser navigation with a real match to confirm the teamId is populated correctly

#### 6. Team Stats Section (MATCH-03 stats)

**Test:** On a match detail page, check for the stats comparison section
**Expected:** If standings are populated (after running a sync), StatBar shows position, points, played, wins, draws, losses, win rate, goal difference side by side; hidden if both standings are null
**Why human:** Requires standings data in DB (populated by sync job) and visual inspection

### Gaps Summary

No gaps found. All artifacts exist, are substantive (not stubs), and are wired. The phase goal is fully implemented in code. Verification status is `human_needed` because 5 of 5 success criteria have visual/interactive components that require running dev servers with live database data to confirm.

---

_Verified: 2026-03-15_
_Verifier: Claude (gsd-verifier)_
