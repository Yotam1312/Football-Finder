# Roadmap: Football Finder

## Milestones

- [x] **v1.0** — Foundation → Match Discovery → FanBase Browse → Auth & Posting → Polish & Launch (8 phases, 24 plans, 32/32 requirements) — *Completed 2026-03-19* — [Archive](.planning/milestones/v1.0-ROADMAP.md)
- [ ] **v2.0 — Global & Real-Time** — OAuth → Photo Upload → Date Filters → UI Improvements → Mobile Feel (5 phases)

---

<details>
<summary>v1.0 — Foundation & Launch (Phases 1-8) — COMPLETED 2026-03-19</summary>

Phases 1-8 delivered the full v1.0 product: match discovery across 10 European leagues, FanBase browsing and posting, three-level auth, match detail pages, static pages, mobile responsiveness, and post-launch tech debt cleanup. 32/32 requirements shipped.

See: [.planning/milestones/v1.0-ROADMAP.md](.planning/milestones/v1.0-ROADMAP.md)

</details>

---

## v2.0 — Global & Real-Time (Phases 9-13)

**Milestone Goal:** Expand Football Finder from a European discovery tool into a global platform — replacing email+password with Google OAuth, adding photo uploads for Seat Tip posts, adding date filters and mobile-app-like experience, and extending match coverage to South America, MLS, and Asia.

### Phases

- [x] **Phase 9: OAuth Foundation** — Replace email+password with Google OAuth; user table reset (completed 2026-03-20)
- [x] **Phase 10: Photo Upload** — Seat Tip posts accept one photo attachment via Azure Blob (completed 2026-03-21)
- [x] **Phase 11: Date Filters** — Quick-select buttons and time-of-day filtering on match search (completed 2026-03-22)
- [x] **Phase 12: UI Improvements** — Sticky navbar, new logo, flag images, rotating testimonials, updated hero text (completed 2026-03-22)
- [x] **Phase 13: Mobile Feel** — Bottom nav bar and smooth page transitions for app-like experience (completed 2026-03-22)

---

## Phase Details

### Phase 9: OAuth Foundation
**Goal**: Users can sign in to Football Finder using their Google account or email+password, with all existing Level 3 features working through both session types and the user table reset to a clean slate
**Depends on**: Nothing (first v2.0 phase)
**Requirements**: OAUTH-01, OAUTH-02, OAUTH-03, OAUTH-04
**Success Criteria** (what must be TRUE):
  1. A user clicks "Continue with Google" and is redirected to Google, then returned to the site as a logged-in user — no registration form appears
  2. A first-time Google sign-in creates an account automatically using the user's Google name and email, visible in their profile
  3. The user's Google profile picture appears as their avatar on their posts and profile page
  4. A signed-in user can create posts, upvote, edit and delete their own posts, and save favorite teams — all features that required Level 3 in v1 work identically
  5. A user who was registered under the old email+password system can sign in with Google and access the site (clean slate after user table reset)
**Plans**: 5 plans

Plans:
- [ ] 09-01-PLAN.md — Schema migration + user table reset (add googleId/avatarUrl/country, fix cascades, drop VerificationToken, truncate users)
- [ ] 09-02-PLAN.md — Google OAuth backend (google-auth-library, /google redirect, /google/callback, updated getMe)
- [ ] 09-03-PLAN.md — Profile management API (PATCH /api/users/me, PATCH /api/users/me/password, DELETE /api/users/me)
- [ ] 09-04-PLAN.md — Frontend auth pages (LoginPage + RegisterPage Google buttons, WelcomePage, delete SetPasswordPage, update AuthUser type)
- [ ] 09-05-PLAN.md — Navbar dropdown + ProfilePage (Hi name dropdown, /profile full edit page with avatar/password/delete)

### Phase 10: Photo Upload
**Goal**: Users creating a Seat Tip post can attach one photo, which is stored in Azure Blob and shown on the published post
**Depends on**: Phase 9
**Requirements**: PHOTO-01, PHOTO-02, PHOTO-03
**Success Criteria** (what must be TRUE):
  1. A user creating a Seat Tip post can select a photo (jpg, png, or webp, max 5MB) and the form accepts it
  2. Before submitting, the user sees a thumbnail preview of the selected photo inside the creation form
  3. After the post is published, the photo appears on the Seat Tip post card in the FanBase feed
  4. Tapping or clicking the photo on a published post shows the full-size image
**Plans**: 2 plans

Plans:
- [ ] 10-01-PLAN.md — Backend upload endpoint (multer + Azure Blob SDK, POST /api/upload, unit tests)
- [ ] 10-02-PLAN.md — Frontend photo UX (CreatePostModal photo input + preview, SeatTipCard photo display + lightbox, ProfilePage avatar upload)

### Phase 11: Date Filters
**Goal**: Users can narrow match search results by specific day or time of day without typing dates manually
**Depends on**: Phase 9
**Requirements**: SEARCH-01, SEARCH-02
**Success Criteria** (what must be TRUE):
  1. A user on the homepage can click "Today", "Tomorrow", or "This Weekend" to populate the date fields instantly without typing
  2. On the results page, a user can select one or more time-of-day chips (Morning / Afternoon / Evening / Night) to filter the visible match list — only matches in the selected time windows appear
  3. Removing all time-of-day chip selections restores the full result list for the chosen date range
**Plans**: 2 plans

Plans:
- [ ] 11-01-PLAN.md — Quick-select date chips on HomePage (Today / Tomorrow / This Weekend above date inputs)
- [ ] 11-02-PLAN.md — Time-of-day filter chips on ResultsPage (Morning / Afternoon / Evening / Night, client-side filtering)

### Phase 12: UI Improvements
**Goal**: Polish the visual identity and UX — sticky navbar, new logo, real flag images in FanBase, rotating testimonials on the homepage, and updated hero subtitle
**Depends on**: Phase 11
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. The navbar stays visible at the top of the screen even as the user scrolls down any page
  2. The navbar shows the new Football Finder logo image instead of the MapPin icon
  3. The FanBase country grid shows real flag images (not emoji) for all countries
  4. The homepage testimonials cycle through automatically every 3 seconds
  5. The homepage hero subtitle reads "Discover upcoming football matches in any city. Perfect for travelers and locals who love the beautiful game."
**Plans**: 1 plan

Plans:
- [x] 12-01-PLAN.md — UI improvements (sticky navbar, logo, flags, rotating testimonials, hero text)

### Phase 13: Mobile Feel
**Goal**: Mobile users experience Football Finder as an app-like product with thumb-friendly navigation and smooth transitions between pages
**Depends on**: Phase 12
**Requirements**: MOBILE-01, MOBILE-02
**Success Criteria** (what must be TRUE):
  1. On a mobile device (phone-sized viewport), a fixed navigation bar appears at the bottom of the screen with tabs for the main sections (Search, FanBase, Profile) — the bar is absent on desktop
  2. The bottom bar respects the iPhone safe area (no content obscured by the home indicator)
  3. Navigating between any two pages shows a smooth animated transition — pages slide or fade rather than cutting instantly
**Plans**: 2 plans

Plans:
- [ ] 13-01-PLAN.md — Bottom navigation bar (BottomNav component, App.tsx integration, page bottom padding)
- [ ] 13-02-PLAN.md — Fade page transitions (motion.div wrappers with exit variants on all 12 pages)


---

## Progress

**Execution Order:** 9 → 10 → 11 → 12 → 13

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 9. OAuth Foundation | v2.0 | 5/5 | Complete | 2026-03-20 |
| 10. Photo Upload | v2.0 | 2/2 | Complete | 2026-03-21 |
| 11. Date Filters | v2.0 | 2/2 | Complete | 2026-03-22 |
| 12. UI Improvements | v2.0 | 1/1 | Complete | 2026-03-22 |
| 13. Mobile Feel | 2/2 | Complete    | 2026-03-22 | - |
