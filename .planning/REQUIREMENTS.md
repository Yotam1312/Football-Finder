# v1 Requirements — Football Finder

## v1 Requirements

### Foundation & Infrastructure

- [x] **FOUND-01**: System stores European match fixtures in PostgreSQL (England, Spain, Germany, Italy, France — top 2 leagues each)
- [x] **FOUND-02**: Nightly sync job fetches upcoming fixtures from API-Football and upserts into DB (never on user request)
- [x] **FOUND-03**: Express backend is scaffolded with security middleware (helmet, cors, rate limiting, morgan)
- [x] **FOUND-04**: Prisma schema defines all tables with correct indexes (city, match_date, team_id, post_type, token)
- [x] **FOUND-05**: Match times are stored as UTC in DB and displayed in venue local timezone on frontend

### Match Search & Discovery

- [x] **MATCH-01**: User can search for matches by entering a city and a date range on the homepage
- [x] **MATCH-02**: User can see all matches in the searched city and date range as a list of match cards (team logos, league, date/time, venue)
- [x] **MATCH-03**: User can view full match details (team crests, league badge, date/time, venue, team stats)
- [x] **MATCH-04**: User can click a "Buy Tickets" link on a match detail page (redirects to external seller)
- [x] **MATCH-05**: User can click "Navigate to Stadium" and be taken to Google Maps directions for that venue
- [x] **MATCH-06**: User can navigate from a match detail page to either team's FanBase page

### FanBase — Navigation & Browse

- [x] **FAN-01**: User can browse FanBase by selecting Country → League → Team in a 3-step flow
- [x] **FAN-02**: User can search for a team directly from the FanBase Hub (bypasses 3-step flow)
- [x] **FAN-03**: User can see a team's FanBase page with posts organized in tabs: All / Seat Tips / Pubs & Food / Local Crowd / I'm Going
- [x] **FAN-04**: User can read all FanBase posts without creating an account
- [x] **FAN-05**: User can see post counts on team cards in the team selection step

### FanBase — Posting (Email-Verified)

- [x] **POST-01**: User can create a General Tip post by providing name, email, title, and body *(gap: Phase 6)*
- [x] **POST-02**: User can create a Seat Tip post with section, row, seat number, star rating, and optional photo *(gap: Phase 6)*
- [x] **POST-03**: User can create a Pub Recommendation post with pub name, address, distance from stadium, and description *(gap: Phase 6)*
- [x] **POST-04**: User can create an "I'm Going" post announcing they're attending an upcoming match *(gap: Phase 6)*
- [~] **POST-05**: ~~Post creation requires email verification~~ — *Superseded by Phase 5: hybrid email-verification flow replaced with direct register+login. Post creation now requires a password account.*
- [~] **POST-06**: ~~Post data preserved through email verification flow~~ — *Superseded by Phase 5: pendingPostData mechanism removed alongside hybrid flow.*
- [~] **POST-07**: ~~User can request a new verification email~~ — *Superseded by Phase 5: resend endpoint removed. Standard password reset applies.*
- [ ] **POST-08**: User can upload a photo from their seat when creating a Seat Tip post (max 5MB, jpg/png/webp)

### Authentication — Full Account (Level 3)

- [x] **AUTH-01**: Email-verified user can upgrade to a full account by setting a password
- [x] **AUTH-02**: Full account user can log in with email + password and stay logged in across sessions
- [x] **AUTH-03**: Full account user can upvote posts
- [x] **AUTH-04**: Full account user can edit their own posts
- [x] **AUTH-05**: Full account user can delete their own posts
- [x] **AUTH-06**: Full account user can track favorite teams
- [x] **AUTH-07**: User can log out from any page

### Static Pages & Polish

- [x] **PAGE-01**: Transportation guide page is accessible showing transit options, ride services, long-distance travel, and app links
- [x] **PAGE-02**: Contact page has a working contact form (sends email to site owner) and displays social media links
- [x] **PAGE-03**: Site has a 404 page for unknown routes
- [x] **PAGE-04**: All pages are mobile-responsive with touch-friendly targets (48px minimum)
- [x] **PAGE-05**: FanBase is seeded with at least 3 genuine posts per major team (Chelsea, Arsenal, Barcelona, Real Madrid, Bayern, PSG, Juventus) covering all post types before public launch

---

## v2 Requirements (Deferred)

- Google/Facebook OAuth login
- Push notifications and email match reminders
- Advanced search filters (league, price range, capacity)
- Social graph (follow users, direct messages)
- AI chatbot ("Which match should I attend in London?")
- PWA / installable mobile app
- Non-European coverage (South America, MLS, Asia)
- Live scores and match tracking
- Dark mode

---

## Out of Scope

- **In-app ticket purchasing** — requires commercial deals and payment processing; linking out to official sellers is sufficient
- **Nested comments / threads** — flat posts are simpler and more readable for v1
- **User profiles / portfolio pages** — full account is sufficient for v1 use cases
- **Advanced match stats (xG, heat maps)** — different product category (analytics vs discovery)
- **Custom CSS** — Tailwind CSS covers all design needs; no custom stylesheets
- **Redux / Zustand / Jotai** — no complex client state that justifies a state manager

---

## Traceability

| Phase | Requirements | Count |
|-------|-------------|-------|
| Phase 1 — Foundation | FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05 | 5 |
| Phase 2 — Match Discovery | MATCH-01, MATCH-02, MATCH-03, MATCH-04, MATCH-05, MATCH-06 | 6 |
| Phase 3 — FanBase Browse | FAN-01, FAN-02, FAN-03, FAN-04, FAN-05 | 5 |
| Phase 4 — Auth and Posting | POST-05~(superseded)~, POST-06~(superseded)~, POST-07~(superseded)~, POST-08~(deferred)~, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07 | 7 active |
| Phase 6 — Post Creation Backend (gap closure) | POST-01, POST-02, POST-03, POST-04 | 4 |
| Phase 5 — Polish and Launch | PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05 | 5 |
| Phase 7 — Tech Debt Cleanup (gap closure) | FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05 | 5 (tracking update) |
| Phase 8 — Nyquist Compliance (gap closure) | (documentation only) | 0 new |

**Total: 36/36 requirements mapped. No orphans.**
**Post v1.1 audit: All requirements satisfied or superseded/deferred. Phases 7–8 close tracking gaps.**
