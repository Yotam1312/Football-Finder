# Requirements: Football Finder — v2.1

**Defined:** 2026-03-24
**Core Value:** A traveler or local types a city and date range and instantly sees every football match happening there — no Googling, no scattered sites.

## v2.1 Requirements

### Security

- [x] **SEC-01**: `POST /api/admin/sync` returns 401 unless the request includes a valid API key header — prevents unauthorized data sync triggers

### Match Detail UI

- [x] **MATCH-01**: Match detail page has polished visual layout — team crests prominent, score/date area clearly structured, improved spacing and visual hierarchy throughout
- [x] **MATCH-02**: Ticket links and Navigate to Stadium section has clean visual treatment with clear call-to-action hierarchy

### Transportation — Generic Guide

- [ ] **TRANS-01**: `/transportation-guide` page is redesigned with rich content sections: hero, quick tips (4 cards: Plan Ahead / Arrive Early / Payment Ready / Download Apps), public transport types (metro/bus/tram/shuttles), ride services (taxi/Uber/car rental), walking & cycling, long-distance travel (train/bus/flights), payment methods, helpful apps with links, safety tips, budget tiers (3), and FAQs

### Transportation — Stadium Component

- [x] **TRANS-02**: Stadium table gains transport fields: `nearbyMetros` (array), `nearbyTrains` (array), `nearbyBuses` (array), `walkingTimeFromCenter` (text), `publicTransportInfo` (text), `parkingInfo` (text)
- [ ] **TRANS-03**: Match detail page shows "Getting to [Stadium Name]" section — displays nearby metro/train/bus lines, travel tip, walking time from center, parking info, and Navigate button that opens Google Maps
- [ ] **TRANS-04**: Stadium transport section shows graceful empty state (Navigate button + "Check local transport apps" message) when no transport data exists for that stadium

### Transportation — Community Tips

- [x] **TRANS-05**: `FanbasePost` table gains `GETTING_THERE` post type with optional fields: `transportType` (enum), `travelCost` (text), `travelTime` (text)
- [ ] **TRANS-06**: FanBase team page has a "Getting There" tab listing community transport tip posts for that team's stadium, ordered by upvotes
- [ ] **TRANS-07**: Authenticated user can create a "Getting There" post with title, transport type (dropdown: Metro / Bus / Train / Taxi / Walking / Other), optional cost, optional travel time, and description

## Future Requirements

### Global Expansion (v3.0)

- **LEAGUE-01**: South American league matches are discoverable by city search
- **LEAGUE-02**: MLS matches are discoverable by city search (multi-timezone handling)
- **LEAGUE-03**: Asian league matches are discoverable by city search
- **LEAGUE-04**: FanBase navigation includes teams from newly added leagues

### Live Data (v3.0)

- **LIVE-01**: Live scores polled during active matches on search result cards
- **LIVE-02**: Live scores displayed on match detail page during active match

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dynamic transport data per user's searched city | Too complex for v2.1 — stadium-level data from DB covers the core need |
| Per-stadium transport data pre-populated | User will add via CSV/SQL separately — out of code scope |
| Push notifications for match reminders | Not yet prioritized |
| In-app ticket purchasing | Requires commercial deals and payment processing |
| PWA / offline mode | v2.0 mobile feel achieved without PWA complexity |
| Facebook OAuth | `passport-facebook` library unmaintained |
| Social graph (follow users, DMs) | Deferred indefinitely |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 14 | Complete |
| MATCH-01 | Phase 14 | Complete |
| MATCH-02 | Phase 14 | Complete |
| TRANS-01 | Phase 16 | Pending |
| TRANS-02 | Phase 15 | Complete |
| TRANS-03 | Phase 17 | Pending |
| TRANS-04 | Phase 17 | Pending |
| TRANS-05 | Phase 15 | Complete |
| TRANS-06 | Phase 18 | Pending |
| TRANS-07 | Phase 18 | Pending |

**Coverage:**
- v2.1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 — traceability mapped after roadmap creation*
