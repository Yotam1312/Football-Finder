---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: — Global & Real-Time
status: planning
stopped_at: Completed 09-03-PLAN.md (profile management API)
last_updated: "2026-03-20T10:07:11.209Z"
last_activity: 2026-03-19 — v2.0 roadmap defined; 5 phases, 14 requirements mapped
progress:
  total_phases: 5
  completed_phases: 0
  total_plans: 5
  completed_plans: 3
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

Last session: 2026-03-20T10:07:11.205Z
Stopped at: Completed 09-03-PLAN.md (profile management API)
Resume file: None
