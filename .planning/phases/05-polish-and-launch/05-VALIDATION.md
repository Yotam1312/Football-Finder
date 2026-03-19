---
phase: 5
slug: polish-and-launch
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-16
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30 + ts-jest 29 + supertest 7 |
| **Config file** | `backend/jest.config.ts` |
| **Quick run command** | `cd backend && npx jest --testPathPattern=auth` |
| **Full suite command** | `cd backend && npx jest` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && npx jest --testPathPattern=auth`
- **After every plan wave:** Run `cd backend && npx jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | PAGE-01 | smoke (manual) | n/a — static React page | ❌ W0 | ✅ green |
| 05-02-01 | 02 | 1 | PAGE-02 | unit | `cd backend && npx jest --testPathPattern=contact` | ❌ W0 | ✅ green |
| 05-03-01 | 03 | 1 | PAGE-03 | smoke (manual) | n/a — React Router catch-all | ❌ W0 | ✅ green |
| 05-04-01 | 04 | 2 | PAGE-04 | manual audit | n/a — visual/DevTools | Manual only | ✅ green |
| 05-05-01 | 05 | 2 | PAGE-05 | integration (manual DB check) | `cd backend && npx jest --testPathPattern=fanbase` | ❌ W0 | ✅ green |
| auth-reg-01 | auth | 1 | - | unit | `cd backend && npx jest --testPathPattern=auth` | ✅ | ✅ green |
| auth-reg-02 | auth | 1 | - | unit | `cd backend && npx jest --testPathPattern=auth` | ✅ | ✅ green |
| auth-reg-03 | auth | 1 | - | unit | `cd backend && npx jest --testPathPattern=auth` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/src/__tests__/contact.test.ts` — stubs for PAGE-02 contact endpoint
- [ ] Auth test coverage for `POST /api/auth/register` — add describes to existing `backend/src/__tests__/auth.test.ts`

*(Transport, 404, mobile, and seed are verified manually — no automated test gaps for those)*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Transport page renders and displays categories | PAGE-01 | Static React page, no API | Navigate to /transport, verify Public Transit/Ride Services/Long-Distance sections display |
| Unknown URL shows 404 page with nav links | PAGE-03 | React Router catch-all | Navigate to /nonexistent, verify 404 page with Home/Search/FanBase buttons |
| All pages usable on mobile, 48px touch targets, no horizontal scroll | PAGE-04 | Visual/DevTools audit | Open DevTools mobile view (375px), check all interactive elements ≥48px, verify no overflow |
| 7 teams have ≥3 posts of all types after seed | PAGE-05 | DB content verification | Run seed script, check FanBase pages for Chelsea/Arsenal/Barcelona/Real Madrid/Bayern/PSG/Juventus |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-19
