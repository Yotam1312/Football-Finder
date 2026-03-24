---
phase: 17-stadium-transport-component
plan: "01"
subsystem: frontend
tags: [transport, stadium, match-detail, ui-component]
requirements: [TRANS-03, TRANS-04]
dependency_graph:
  requires: [Phase 15 transport DB schema — nearbyMetros/nearbyTrains/nearbyBuses columns on Stadium]
  provides: [Transport section in MatchDetailPage, Stadium interface with all six transport fields]
  affects: [frontend/src/pages/MatchDetailPage.tsx, frontend/src/types/index.ts]
tech_stack:
  added: []
  patterns:
    - IIFE in JSX for inline destructuring without hoisting extra variables
    - Filled vs empty state logic driven by line array lengths only (not supplementary fields)
    - Non-null assertion inside guarded JSX block (match.stadium!)
key_files:
  created: []
  modified:
    - frontend/src/types/index.ts
    - frontend/src/pages/MatchDetailPage.tsx
decisions:
  - IIFE pattern used for destructuring stadium fields inline in JSX without adding a pre-return variable
  - mapsUrl variable reused from existing line 68-70 scope — not recomputed inside transport block
  - CircleParking used for parking icon (not ParkingCircle — that name does not exist in lucide-react@0.577.0)
  - hasTransportLines based solely on nearbyMetros/nearbyTrains/nearbyBuses array lengths — walkingTime or parkingInfo alone does not count as a "filled" state
  - Design improved post-checkpoint: pills per transport mode, info tiles for walking/parking, icons removed from the list rows
metrics:
  duration: ~15 min
  completed: 2026-03-24
  tasks_completed: 3
  files_modified: 2
---

# Phase 17 Plan 01: Stadium Transport Component Summary

**One-liner:** Inline "Getting to [Stadium]" transport section in MatchDetailPage showing metro/train/bus pills, walking/parking info tiles, and a Get Directions button, with graceful empty state for stadiums without transport data.

## What Was Built

A self-contained transport information card was inserted into `MatchDetailPage.tsx` between the Match Day Actions card and the FanBase card. The section reads six transport fields from the stadium record:

- `nearbyMetros`, `nearbyTrains`, `nearbyBuses` — string arrays rendered as labelled pills per mode group
- `walkingTimeFromCenter`, `parkingInfo` — optional strings rendered as side-by-side info tiles
- `publicTransportInfo` — optional travel tip rendered as italic prose

**Filled state (TRANS-03):** When any line array is non-empty, transport lines are grouped under Metro / Train / Bus sub-headings. Supplementary tiles (walking time, parking) and a travel tip row appear only when their fields are set. A "Get Directions" button opens Google Maps in a new tab using the existing `mapsUrl` variable.

**Empty state (TRANS-04):** When all three line arrays are empty, a short message ("No transport details on file. Check local transport apps for routes.") is shown alongside the Get Directions button.

**TBC venues:** When `match.stadium` is null, the entire section is omitted — no error, no empty card.

The Stadium TypeScript interface in `types/index.ts` was extended with all six transport fields. Arrays are non-optional (`string[]`) because Prisma returns empty arrays for unset `String[]` columns; the three string fields are `string | null` because they are optional columns.

## Files Modified

| File | Change |
|------|--------|
| `frontend/src/types/index.ts` | Added six transport fields to Stadium interface |
| `frontend/src/pages/MatchDetailPage.tsx` | Added Lucide imports (Train, Bus, Navigation, Footprints, CircleParking), inserted transport section block |

## Decisions Made

1. **IIFE pattern in JSX** — `{match.stadium && (() => { const { ... } = match.stadium!; return (...); })()}` used to destructure stadium fields inline without hoisting a variable above the component return. Self-contained and readable at student level.

2. **Reuse mapsUrl** — The `mapsUrl` variable is already computed at lines 68-70 for the existing Navigate to Stadium button. The transport block reuses it directly rather than recomputing `googleMapsUrl ?? buildMapsUrl(...)` a second time.

3. **CircleParking, not ParkingCircle** — lucide-react@0.577.0 exports `CircleParking`. The name `ParkingCircle` does not exist in this version.

4. **Filled state gated on line arrays only** — A stadium with only `walkingTimeFromCenter` set (no metro/train/bus lines) renders the empty state, not the filled state. Walking time and parking alone are supplementary — they do not constitute "transport lines."

5. **Post-checkpoint design improvement** — After human verification confirmed the section rendered correctly, the design was refined: transport lines displayed as pills (inline `flex-wrap gap-2` tags) per mode group, walking/parking shown as side-by-side info tiles, and row icons removed for cleaner visual hierarchy. Committed separately as `improve transport section design: pills per mode, info tiles, no icons` (49f94a0).

## Requirements Satisfied

- **TRANS-03** — Match detail page shows transport options (metro/train/bus lines) for the specific stadium.
- **TRANS-04** — Graceful empty state renders with a message and Get Directions button when no transport lines exist.

## Deviations from Plan

### Design Improvement (Post-Checkpoint)

**Found during:** Task 3 post-approval
**Change:** Replaced icon+text rows with pill tags per mode group; walking/parking displayed as adjacent info tiles rather than rows; row-level icons removed for cleaner layout.
**Files modified:** `frontend/src/pages/MatchDetailPage.tsx`
**Commit:** 49f94a0

This was an improvement made after the checkpoint was approved, not a correction of a bug. Plan executed as written; design was then enhanced.

## Self-Check: PASSED

- `frontend/src/types/index.ts` — modified (Stadium interface extended)
- `frontend/src/pages/MatchDetailPage.tsx` — modified (transport section inserted)
- Commits verified:
  - 911ba37 — extend Stadium interface with six transport fields
  - 2def0f5 — add Getting to Stadium transport section in MatchDetailPage
  - 49f94a0 — improve transport section design: pills per mode, info tiles, no icons
