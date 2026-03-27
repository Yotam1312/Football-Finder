# Roadmap: Football Finder

## Milestones

- [x] **v1.0** — Foundation & Launch (8 phases, 24 plans, 32/32 requirements) — *Shipped 2026-03-19* — [Archive](.planning/milestones/v1.0-ROADMAP.md)
- [x] **v2.0 — Global & Real-Time** — OAuth, Photo Upload, Date Filters, UI Polish, Mobile Feel (5 phases, 12 plans) — *Shipped 2026-03-24* — [Archive](.planning/milestones/v2.0-ROADMAP.md)
- [x] **v2.1 — Transport & Polish** — Admin auth, match detail polish, transport guide redesign, stadium transport component, community transport tips (5 phases, 7 plans, 10/10 requirements) — *Shipped 2026-03-24* — [Archive](.planning/milestones/v2.1-ROADMAP.md)
- [x] **v2.2 — Stadium Guide** — Stadium directory hub, individual stadium pages with Leaflet map + full transport guide, canonical page structure (5 phases, 9 plans, 21/21 requirements) — *Shipped 2026-03-27* — [Archive](.planning/milestones/v2.2-ROADMAP.md)

---

<details>
<summary>v1.0 — Foundation & Launch (Phases 1-8) — SHIPPED 2026-03-19</summary>

Phases 1-8 delivered the full v1.0 product: match discovery across 10 European leagues, FanBase browsing and posting, three-level auth, match detail pages, static pages, mobile responsiveness, and post-launch tech debt cleanup. 32/32 requirements shipped.

See: [.planning/milestones/v1.0-ROADMAP.md](.planning/milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>v2.0 — Global & Real-Time (Phases 9-13) — SHIPPED 2026-03-24</summary>

Phases 9-13 replaced email+password with Google OAuth, added Azure Blob photo uploads for Seat Tip posts, introduced date quick-select and time-of-day filter chips, polished the UI (sticky navbar, new logo, real flags, rotating testimonials), and added a mobile-app-like feel with a bottom nav bar and page fade transitions.

See: [.planning/milestones/v2.0-ROADMAP.md](.planning/milestones/v2.0-ROADMAP.md)

</details>

<details>
<summary>v2.1 — Transport & Polish (Phases 14-18) — SHIPPED 2026-03-24</summary>

Phases 14-18 locked down the admin sync endpoint with API key auth, polished the match detail page (hero pill, CTA card), fully redesigned the transportation guide, added a "Getting to [Stadium]" component on match detail backed by DB data, and introduced a "Getting There" FanBase tab with community transport tips. 10/10 requirements shipped.

See: [.planning/milestones/v2.1-ROADMAP.md](.planning/milestones/v2.1-ROADMAP.md)

</details>

<details>
<summary>v2.2 — Stadium Guide (Phases 19-23) — SHIPPED 2026-03-27</summary>

Phases 19-23 transformed the Transportation Guide into a full stadium directory: DB coordinates + search/detail API, hub page with debounced search and Country→League→Team browse, individual stadium pages with an interactive Leaflet map, rich JSON transport sections (airport routes, travel times, budget, payment), community tips linked to FanBase, and a canonical section order. 21/21 requirements shipped.

See: [.planning/milestones/v2.2-ROADMAP.md](.planning/milestones/v2.2-ROADMAP.md)

</details>

---

## Next Milestone

*(Run `/gsd:new-milestone` to start the next milestone)*

## Progress

| Phase | Milestone | Status | Completed |
|-------|-----------|--------|-----------|
| 1–8. Foundation → Tech Debt | v1.0 | Complete | 2026-03-19 |
| 9–13. OAuth → Mobile Feel | v2.0 | Complete | 2026-03-24 |
| 14–18. Admin Auth → Getting There FanBase | v2.1 | Complete | 2026-03-24 |
| 19–23. Stadium Guide | v2.2 | Complete | 2026-03-27 |
