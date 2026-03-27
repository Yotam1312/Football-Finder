---
phase: 22-stadium-transport-detail
plan: "02"
subsystem: frontend
tags: [leaflet, maps, stadium-detail, transport, structured-data]
dependency_graph:
  requires: [22-01]
  provides: [interactive-map, structured-transport-sections, nearby-stadiums-ui]
  affects: [StadiumDetailPage, StadiumLeafletMap, NearbyStadiumsSection]
tech_stack:
  added: [react-leaflet@4.x, leaflet@1.x, @types/leaflet]
  patterns: [structured-json-with-string-fallback, leaflet-vite-marker-fix]
key_files:
  created:
    - frontend/src/components/stadiums/StadiumLeafletMap.tsx
    - frontend/src/components/stadiums/NearbyStadiumsSection.tsx
  modified:
    - frontend/src/pages/StadiumDetailPage.tsx
    - frontend/package.json
    - frontend/package-lock.json
decisions:
  - Used --legacy-peer-deps to install leaflet due to @tailwindcss/vite peer dep conflict with vite@8
  - Replaced static OSM iframe entirely with react-leaflet MapContainer
  - All 4 structured sections (airport/travel/budget/payment) prefer JSON but fall back to strings for backwards compatibility
metrics:
  duration_minutes: 10
  completed_date: "2026-03-27T08:32:17Z"
  tasks_completed: 2
  files_changed: 5
---

# Phase 22 Plan 02: Stadium Detail Frontend (Leaflet Map + Structured Sections) Summary

Interactive Leaflet map, structured JSON transport sections with string fallback, Community Tips link fix, and Nearby Stadiums discovery added to StadiumDetailPage.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install Leaflet packages + create StadiumLeafletMap and NearbyStadiumsSection | `3ed9ac3` | StadiumLeafletMap.tsx, NearbyStadiumsSection.tsx, package.json |
| 2 | Update StadiumDetailPage with all new sections | `d94fba6` | StadiumDetailPage.tsx |

## What Was Built

### StadiumLeafletMap component
- Interactive OpenStreetMap powered by react-leaflet (no API key required)
- OSM tile layer with standard attribution
- Stadium marker with popup showing stadium name
- `scrollWheelZoom={false}` to avoid accidental map zooming while page scrolling
- Vite marker icon fix: imports PNGs explicitly and overrides `L.Icon.Default` — without this, Leaflet's default icons break in Vite builds

### NearbyStadiumsSection component
- Renders up to 3 nearby stadium cards in a responsive grid
- Each card links to `/stadiums/:id`, shows team logo (if available), team name, stadium name, and distance in km
- Hover state: green border + subtle shadow

### StadiumDetailPage upgrades
- **Interactive Map**: Static OSM iframe fully replaced by `<StadiumLeafletMap>` with 360px height and pan/zoom capability
- **From Airport section**: Shows structured metro steps (ordered list), taxi row, rideshare row with surge warning when `airportTransport` JSON is present; falls back to `fromAirportInfo` string
- **Travel Times section**: 4-column colored grid (metro=green, bus=amber, taxi=blue, walking=purple) when `travelTimes` JSON present; falls back to `travelTimesInfo` string
- **Budget Breakdown section**: 3-tier structured cards with cost + how text when `budgetBreakdown` JSON present; falls back to legacy `budgetCheap/Standard/Comfort` strings
- **Payment & Tickets section**: Accepted card pills + recommended card block + tips text when `paymentDetails` JSON present; falls back to `paymentInfo` string
- **Community Tips**: Renamed from "Fan Tips", limited to top 3 posts via `.slice(0, 3)`, both FanBase links now include `?tab=getting-there`
- **Nearby Stadiums**: New section at bottom using `NearbyStadiumsSection`, hidden when `nearbyStadiums` is empty

## Decisions Made

1. **--legacy-peer-deps for installation**: @tailwindcss/vite@4.2.1 has a peer dep requiring vite@"^5 || ^6 || ^7" but project uses vite@8. Using `--legacy-peer-deps` avoids the conflict — the actual build still works fine since @tailwindcss/vite compatibility with vite@8 is functional.

2. **Static iframe fully replaced**: Rather than having both iframe and Leaflet side by side, the plan called for a full replacement. The Leaflet map is strictly better (interactive, pan/zoom, proper marker).

3. **Structured sections always fall back to strings**: The upgrade pattern is `(structuredJSON || legacyString) &&` at the section gate, then a ternary inside the card. This means stadiums with old string data continue to render gracefully even without the new JSON fields.

## Deviations from Plan

None — plan executed exactly as written. The only minor deviation was using `--legacy-peer-deps` for the npm install, which is a standard resolution for peer dep conflicts in this project setup and does not affect functionality.

## Self-Check

Files exist:
- `frontend/src/components/stadiums/StadiumLeafletMap.tsx` — FOUND
- `frontend/src/components/stadiums/NearbyStadiumsSection.tsx` — FOUND

Commits exist:
- `3ed9ac3` — feat(22-02): add StadiumLeafletMap and NearbyStadiumsSection components
- `d94fba6` — feat(22-02): upgrade StadiumDetailPage with Leaflet map, structured JSON sections, and nearby stadiums

TypeScript: PASS (npx tsc --noEmit exits 0)
No iframe in StadiumDetailPage: PASS
FanBase links include ?tab=getting-there: PASS (2 occurrences)

## Self-Check: PASSED
