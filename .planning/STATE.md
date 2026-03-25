---
gsd_state_version: 1.0
milestone: v2.2
milestone_name: Stadium Guide
status: defining_requirements
stopped_at: Requirements defined — ready to roadmap
last_updated: "2026-03-25T00:00:00.000Z"
last_activity: 2026-03-25 — Milestone v2.2 started, requirements gathered
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-25)

**Core value:** A traveler or local types a city and date range and instantly sees every football match happening there — no Googling, no scattered sites.
**Current focus:** v2.2 — Stadium Guide

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-25 — Milestone v2.2 started

## Accumulated Context

### Pending Todos

- Add transport data to stadium records (CSV/SQL ready per user) — out of code scope, user-managed
- Add lat/lng coordinates to stadium records (new in v2.2) — user-managed via SQL/CSV after migration
- `transportType` backend validation — enforce Metro/Bus/Train/Taxi/Walking/Other at API layer
- Pre-flight for global league expansion (v3.0): upgrade API-Football plan, verify league IDs, MLS timezone table

### Blockers/Concerns

- API-Football free plan capped at seasons 2022-2024 — need paid plan before v3.0 league work (v2.2 unaffected)
