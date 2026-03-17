# Roadmap: Football Finder

## Overview

Football Finder is built in five phases that follow a hard dependency chain. Phase 1 establishes the data pipeline that every other feature depends on. Phase 2 delivers the core search experience — the entire value proposition. Phase 3 adds the FanBase read layer on top of the same database. Phase 4 introduces the email verification and full account system that lets users post and interact. Phase 5 completes the product with static pages, mobile polish, and FanBase seeding before public launch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Scaffold the backend, define the database schema, and get European match fixtures syncing from API-Football into PostgreSQL nightly — *Completed 2026-03-15*
- [x] **Phase 2: Match Discovery** - Build the city + date search, match results list, and full match detail page with tickets and stadium navigation — *Completed 2026-03-15*
- [x] **Phase 3: FanBase Browse** - Build the Country → League → Team navigation and team FanBase pages with tabbed post feeds (read-only, no account needed) (completed 2026-03-15)
- [x] **Phase 4: Auth and Posting** - Add email-verified post creation for all post types, photo uploads, and full account features (upvote, edit/delete, favorite teams) (completed 2026-03-16)
- [ ] **Phase 5: Polish and Launch** - Transportation guide, contact page, 404 page, mobile responsiveness audit, and FanBase seeding before going live

## Phase Details

### Phase 1: Foundation
**Goal**: The backend is running, the database schema is correct, and European match fixtures are flowing from API-Football into PostgreSQL on a nightly schedule
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. The Express server starts and responds to a health check endpoint with no errors
  2. Running the sync job populates the database with real upcoming fixtures for all 10 tracked European leagues (top 2 per country in England, Spain, Germany, Italy, France)
  3. Match times stored in the database are in UTC, and a test query confirms the correct venue local time is derivable from the stored IANA timezone string
  4. A direct database query on a large fixture set returns results in under 200ms, confirming indexes on city, match_date, team_id, post_type, and token are active
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: Match Discovery
**Goal**: A user can type a city and date range on the homepage and see every match happening there, then drill into any match for full details, ticket links, and stadium navigation
**Depends on**: Phase 1
**Requirements**: MATCH-01, MATCH-02, MATCH-03, MATCH-04, MATCH-05, MATCH-06
**Success Criteria** (what must be TRUE):
  1. User types "London" and a date range on the homepage and sees a list of match cards showing team logos, league badge, date/time in the venue's local timezone, and stadium name
  2. User can click any match card and reach a detail page showing team crests, league badge, full date/time, venue name, and team stats
  3. User can click "Buy Tickets" on a match detail page and be redirected to an external ticket seller in a new tab
  4. User can click "Navigate to Stadium" and be taken directly to Google Maps directions for that venue
  5. User can click either team name on a match detail page and be taken to that team's FanBase page
**Plans**: 6 plans

Plans:
- [x] 02-01-PLAN.md — Backend test scaffold (jest + ts-jest + test stubs)
- [x] 02-02-PLAN.md — Schema migration (TeamStanding + ticketUrl) and standings sync
- [x] 02-03-PLAN.md — Frontend scaffold (Vite + React + Tailwind + routing skeleton)
- [x] 02-04-PLAN.md — Backend search and detail API endpoints
- [x] 02-05-PLAN.md — Homepage and Results page with match cards
- [x] 02-06-PLAN.md — Match detail page (stats, tickets, maps, FanBase links)

### Phase 3: FanBase Browse
**Goal**: A user can navigate to any European team's FanBase page without an account and read all community posts organized by type
**Depends on**: Phase 2
**Requirements**: FAN-01, FAN-02, FAN-03, FAN-04, FAN-05
**Success Criteria** (what must be TRUE):
  1. User can navigate to any team's FanBase page by selecting Country → League → Team in a 3-step flow with no dead ends
  2. User can search for a team by name directly from the FanBase hub and reach that team's page without going through the 3-step flow
  3. User can see all posts on a team's FanBase page organized in tabs: All / Seat Tips / Pubs and Food / Local Crowd / I'm Going
  4. User can read every post on a team's FanBase page without being asked to log in or verify an email
  5. Team cards in the team selection step display a post count badge so users can see which teams have the most community activity
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — Backend FanBase API (6 endpoints + 5 integration test files)
- [ ] 03-02-PLAN.md — Frontend types, hooks, and utility functions (6 hooks + types + toSlug)
- [ ] 03-03-PLAN.md — FanBase Hub page (3-step navigation + live search + Navbar + App routes)
- [ ] 03-04-PLAN.md — Team FanBase page (tabs + post cards + pagination + disabled Add button)

### Phase 4: Auth and Posting
**Goal**: A user can create any type of FanBase post after email verification, and a full account holder can upvote posts, edit or delete their own posts, and track favorite teams
**Depends on**: Phase 3
**Requirements**: POST-01, POST-02, POST-03, POST-04, POST-05, POST-06, POST-07, POST-08, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07
**Success Criteria** (what must be TRUE):
  1. User fills in a post form (any type), submits their email, receives a verification link, clicks it, and the post appears live on the team's FanBase page without re-entering the form data
  2. User can upload a photo when creating a Seat Tip post (up to 5MB, jpg/png/webp) and the photo appears on the published post
  3. User can request a new verification email if the original link expired, and the new link works correctly
  4. Email-verified user can upgrade to a full account by setting a password, then log in with email + password and stay logged in across browser sessions
  5. Full account user can upvote posts, edit their own posts, delete their own posts, track favorite teams, and log out from any page
**Plans**: 5 plans

Plans:
- [ ] 04-01-PLAN.md — Auth backend: packages, middleware, email service, and all 7 auth endpoints
- [ ] 04-02-PLAN.md — Post mutation endpoints: upvote toggle, edit, delete, and favorite team toggle
- [ ] 04-03-PLAN.md — Frontend auth context, Navbar auth state, login page, and set-password page
- [ ] 04-04-PLAN.md — Post creation modal: type picker, all 4 post type forms, and email submission
- [ ] 04-05-PLAN.md — Post ownership UI, upvote button, heart icon, and verify page

### Phase 5: Polish and Launch
**Goal**: The product is complete, mobile-friendly, and not empty — ready for real users to visit on launch day
**Depends on**: Phase 4
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05
**Success Criteria** (what must be TRUE):
  1. The transportation guide page is accessible and displays transit options, ride services, long-distance travel options, and app links for each
  2. The contact page has a working form that sends an email to the site owner and displays social media links
  3. Any unknown URL on the site shows a helpful 404 page instead of a blank screen or server error
  4. Every page on the site is usable on a mobile device with all tap targets at least 48px and no horizontal scrolling
  5. At least 3 genuine posts per major team (Chelsea, Arsenal, Barcelona, Real Madrid, Bayern Munich, PSG, Juventus) covering all post types are visible on each team's FanBase page before public launch
**Plans**: 6 plans

Plans:
- [ ] 05-01-PLAN.md — Auth backend overhaul: schema migration (age + favoriteClubId), register endpoint, remove hybrid endpoints
- [ ] 05-02-PLAN.md — Contact backend + 404 page: sendContactEmail, POST /api/contact, NotFoundPage catch-all
- [ ] 05-03-PLAN.md — Transportation guide page: TransportPage component, Navbar Transport link, App.tsx /transport route
- [ ] 05-04-PLAN.md — Auth frontend: RegisterPage, ContactPage, AuthGateModal, CreatePostModal cleanup, Navbar guest buttons
- [ ] 05-05-PLAN.md — Mobile responsiveness audit: 48px touch targets, no horizontal scroll, checkpoint:human-verify
- [ ] 05-06-PLAN.md — FanBase seed script: 5 fictional users + 28 realistic posts across 7 major teams

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete | 2026-03-15 |
| 2. Match Discovery | 6/6 | Complete | 2026-03-15 |
| 3. FanBase Browse | 4/4 | Complete   | 2026-03-15 |
| 4. Auth and Posting | 5/5 | Complete   | 2026-03-16 |
| 5. Polish and Launch | 5/6 | In Progress|  |
