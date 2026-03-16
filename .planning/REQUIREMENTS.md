# v1 Requirements — Football Finder

## v1 Requirements

### Foundation & Infrastructure

- [ ] **FOUND-01**: System stores European match fixtures in PostgreSQL (England, Spain, Germany, Italy, France — top 2 leagues each)
- [ ] **FOUND-02**: Nightly sync job fetches upcoming fixtures from API-Football and upserts into DB (never on user request)
- [ ] **FOUND-03**: Express backend is scaffolded with security middleware (helmet, cors, rate limiting, morgan)
- [ ] **FOUND-04**: Prisma schema defines all tables with correct indexes (city, match_date, team_id, post_type, token)
- [ ] **FOUND-05**: Match times are stored as UTC in DB and displayed in venue local timezone on frontend

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

- [ ] **POST-01**: User can create a General Tip post by providing name, email, title, and body
- [ ] **POST-02**: User can create a Seat Tip post with section, row, seat number, star rating, and optional photo
- [ ] **POST-03**: User can create a Pub Recommendation post with pub name, address, distance from stadium, and description
- [ ] **POST-04**: User can create an "I'm Going" post announcing they're attending an upcoming match
- [x] **POST-05**: Post creation requires email verification: user receives a link, clicks it, and post goes live (no password)
- [x] **POST-06**: Post data (form content) is preserved through the email verification flow — user does not need to re-fill the form after clicking the link
- [x] **POST-07**: User can request a new verification email if the original link expired (resend option)
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

- [ ] **PAGE-01**: Transportation guide page is accessible showing transit options, ride services, long-distance travel, and app links
- [ ] **PAGE-02**: Contact page has a working contact form (sends email to site owner) and displays social media links
- [ ] **PAGE-03**: Site has a 404 page for unknown routes
- [ ] **PAGE-04**: All pages are mobile-responsive with touch-friendly targets (48px minimum)
- [ ] **PAGE-05**: FanBase is seeded with at least 3 genuine posts per major team (Chelsea, Arsenal, Barcelona, Real Madrid, Bayern, PSG, Juventus) covering all post types before public launch

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
| Phase 4 — Auth and Posting | POST-01, POST-02, POST-03, POST-04, POST-05, POST-06, POST-07, POST-08, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07 | 15 |
| Phase 5 — Polish and Launch | PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05 | 5 |

**Total: 36/36 requirements mapped. No orphans.**
