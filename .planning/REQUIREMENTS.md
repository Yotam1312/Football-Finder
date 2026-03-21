# v2.0 Requirements — Football Finder

## v2.0 Requirements

### OAuth & Authentication

- [x] **OAUTH-01**: User can sign in to Football Finder with their Google account
- [x] **OAUTH-02**: First-time Google sign-in automatically creates an account using the user's Google name and email
- [x] **OAUTH-03**: User's Google profile picture appears as their avatar across the site
- [x] **OAUTH-04**: All v1 Level 3 features (create posts, upvote, edit/delete posts, favorite teams) work with a Google OAuth session

### Photo Upload

- [x] **PHOTO-01**: User can upload a photo when creating a Seat Tip post (max 5MB, jpg/png/webp)
- [x] **PHOTO-02**: Photo preview is shown in the creation form before submission
- [x] **PHOTO-03**: Uploaded photo appears on the published Seat Tip post card and detail view

### Date Filters

- [ ] **SEARCH-01**: User can use quick-select buttons (Today, Tomorrow, This Weekend) on the homepage instead of typing dates manually
- [ ] **SEARCH-02**: User can filter match results by time of day (Morning / Afternoon / Evening / Night)

### Global League Coverage

- [ ] **LEAGUE-01**: User can discover South American matches (Brazilian Série A, Argentine Primera División) by searching a South American city
- [ ] **LEAGUE-02**: User can discover MLS matches by searching a US or Canadian city
- [ ] **LEAGUE-03**: User can discover Asian matches (J-League minimum) by searching an Asian city
- [ ] **LEAGUE-04**: FanBase navigation includes teams from all newly added leagues

### Mobile Feel

- [ ] **MOBILE-01**: Mobile users see a fixed bottom navigation bar for main sections (Search, FanBase, Profile)
- [ ] **MOBILE-02**: Navigating between pages shows smooth animated transitions

---

## Deferred to Future Milestone

- **Live scores** — real-time match score polling. Requires paid API-Football plan ($10/mo minimum); free plan is 100 req/day which a single 90-min match exhausts at 60s polling. Deferred until API plan upgrade.
- **Facebook OAuth** — `passport-facebook` library is unmaintained (last published 7 years ago). Deferred until a maintained alternative is available.
- **Google One Tap** — meaningful UX differentiator for returning users. Can be added on top of standard Google OAuth in v2.1.
- **Push notifications / email match reminders** — deferred from v1
- **Advanced league/team filters** — user selected date filters only for v2; league and team filters deferred
- **AI chatbot** — deferred indefinitely per v1 scope decision
- **Social graph (follow users, DMs)** — deferred indefinitely per v1 scope decision

## Out of Scope

- **In-app ticket purchasing** — commercial deals and payment processing required
- **PWA (service workers + offline)** — v2 targets mobile feel only; full PWA adds complexity not justified for v2
- **Facebook OAuth** — library risk; Google-only for v2
- **Chinese Super League / Saudi Pro League at launch** — data quality uncertain; add after verifying with API key
- **Redux / Zustand / Jotai** — no complex client state justifies a state manager
- **Custom CSS** — Tailwind covers all design needs

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OAUTH-01 | Phase 9 — OAuth Foundation | Complete |
| OAUTH-02 | Phase 9 — OAuth Foundation | Complete |
| OAUTH-03 | Phase 9 — OAuth Foundation | Complete |
| OAUTH-04 | Phase 9 — OAuth Foundation | Complete |
| PHOTO-01 | Phase 10 — Photo Upload | Complete |
| PHOTO-02 | Phase 10 — Photo Upload | Complete |
| PHOTO-03 | Phase 10 — Photo Upload | Complete |
| LEAGUE-01 | Phase 11 — Global League Expansion | Pending |
| LEAGUE-02 | Phase 11 — Global League Expansion | Pending |
| LEAGUE-03 | Phase 11 — Global League Expansion | Pending |
| LEAGUE-04 | Phase 11 — Global League Expansion | Pending |
| SEARCH-01 | Phase 12 — Date Filters | Pending |
| SEARCH-02 | Phase 12 — Date Filters | Pending |
| MOBILE-01 | Phase 13 — Mobile Feel | Pending |
| MOBILE-02 | Phase 13 — Mobile Feel | Pending |

**Total: 14/14 requirements mapped. Coverage: 100%.**

---

## Notes from Research

- **OAuth must be Phase 9** — all auth-gated features depend on it; user table reset (with cascade deletes) happens here
- **Azure Blob CORS** must be configured as a prerequisite for photo upload phase
- **MLS timezone edge case** — MLS spans multiple timezones; city-to-timezone lookup table needed in sync.service.ts
- **API-Football league IDs** for non-European leagues need verification against the live API before sync config is updated
- **`POST /api/admin/sync` must be locked down** before global league sync ships (rate budget increases with more leagues)
