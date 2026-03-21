---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: — Global & Real-Time
status: planning
stopped_at: Completed 10-02-PLAN.md (all tasks complete, human verification approved)
last_updated: "2026-03-21T09:07:36.466Z"
last_activity: 2026-03-19 — v2.0 roadmap defined; 5 phases, 14 requirements mapped
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 7
  completed_plans: 7
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** A traveler or local types a city and date range and instantly sees every football match happening there — no Googling, no scattered sites.
**Current focus:** Phase 9 — OAuth Foundation (ready to plan)

## Current Position

Phase: 9 of 13 (OAuth Foundation)
Plan: —
Status: Ready to plan Phase 9
Last activity: 2026-03-19 — v2.0 roadmap defined; 5 phases, 14 requirements mapped

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed (v2.0): 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

*Updated after each plan completion*
| Phase 09-oauth-foundation P01 | 51min | 2 tasks | 4 files |
| Phase 09-oauth-foundation P02 | 45min | 3 tasks | 4 files |
| Phase 09-oauth-foundation P03 | 33min | 2 tasks | 3 files |
| Phase 09-oauth-foundation P04 | 4min | 3 tasks | 5 files |
| Phase 09-oauth-foundation P05 | 2min | 2 tasks | 3 files |
| Phase 10-photo-upload P01 | 4min | 3 tasks | 8 files |
| Phase 10-photo-upload P02 | 2min | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.0 Roadmap]: OAuth must be Phase 9 — all auth-gated features depend on stable user identity; user table reset (with cascade deletes on Post, Upvote, UserFavorite, VerificationToken) happens here
- [v2.0 Roadmap]: Facebook OAuth deferred — passport-facebook unmaintained (7 years); Google-only for v2.0
- [v2.0 Roadmap]: Live scores deferred from v2.0 scope — free API plan (100 req/day) cannot sustain 60s polling; build behind feature flag only after paid plan confirmed
- [v2.0 Roadmap]: Photo upload (Phase 10) requires Azure Blob CORS pre-flight before any multer code; multer v2.1.1 required (patches CVE-2025-47935, CVE-2025-47944)
- [v2.0 Roadmap]: POST /api/admin/sync must be locked with API key header before Phase 11 league expansion (sync cost increases from ~18 to ~36+ req/day)
- [Phase 09-oauth-foundation]: Used prisma migrate deploy (non-interactive) instead of migrate dev — Claude Code shell lacks TTY; authored migration SQL manually
- [Phase 09-oauth-foundation]: VerificationToken table dropped — email-based Level 2 auth flow replaced by Google OAuth in Phase 9; token.helpers.ts replaced with comment stub
- [Phase 09-oauth-foundation]: Use returnTo cookie (not OAuth state param) for post-login redirect — state param appears in browser history; cookie is private
- [Phase 09-oauth-foundation]: getMe level derivation: (passwordHash || googleId) ? 3 : 2 — fixes incorrect level 2 for Google-only users
- [Phase 09-oauth-foundation]: updateProfile uses typed partial updateData object to handle optional fields — prevents accidentally nulling fields not in request body
- [Phase 09-oauth-foundation]: changePassword checks passwordHash null before bcrypt to detect Google-only accounts; deleteAccount clears cookie immediately after user deletion
- [Phase 09-oauth-foundation]: Google OAuth button uses window.location.href (not fetch) — OAuth requires real browser navigation
- [Phase 09-oauth-foundation]: WelcomePage has no route guard — backend controls who is redirected there via isNewUser flag
- [Phase 09-oauth-foundation]: Navbar Level 2 branch removed — all authenticated users are Level 3 (Google or email+password)
- [Phase 09-oauth-foundation]: Upload photo button disabled with tooltip — Azure Blob deferred to Phase 10
- [Phase 09-oauth-foundation]: Delete account uses two-step inline confirmation UI rather than window.confirm() for consistent UX
- [Phase 10-photo-upload]: @types/multer installed as devDependency — multer v2.1.1 does not ship its own TypeScript types; @types/multer resolves req.file type errors

### Pending Todos

- Plan and execute Phase 9 (OAuth Foundation)
- Pre-flight for Phase 9: register Google OAuth callback URLs in Google Console before writing code
- Pre-flight for Phase 10: configure Azure Blob CORS + container access before multer code
- Pre-flight for Phase 11: verify API-Football league IDs via live API tester; confirm 2024/2025 season access for non-European leagues

### Blockers/Concerns

- [Phase 9 - PRE-FLIGHT]: Add onDelete: Cascade to Post, Upvote, UserFavorite, VerificationToken relations BEFORE user table reset — missing cascade causes FK constraint errors
- [Phase 9 - PRE-FLIGHT]: Register Google OAuth callback URLs in Google Console (localhost:3001 and production Azure URL) before implementation begins
- [Phase 9 - KNOWN]: Cross-domain cookie (Azure backend → Vercel frontend) must be tested against production Vercel URL during Phase 9, not deferred to end
- [Phase 10 - PRE-FLIGHT]: Azure Blob container must be set to "Blob (anonymous read)" before upload code is written
- [Phase 11 - KNOWN]: API-Football free plan capped at seasons 2022-2024; non-European league data may require paid plan upgrade for current season
- [Phase 11 - KNOWN]: MLS stadium city-to-timezone lookup must cover all current MLS teams including 2023-2024 expansion teams

## Session Continuity

Last session: 2026-03-21T19:24:49Z
Stopped at: Completed 10-02-PLAN.md (all tasks complete, human verification approved)
Resume file: None
