---
phase: 04-auth-and-posting
plan: "01"
subsystem: auth
tags: [jwt, bcrypt, nodemailer, cookie-parser, nanoid, express, prisma, supertest]

requires:
  - phase: 03-fanbase-browse
    provides: fanbase routes and controller pattern, Post model, VerificationToken model

provides:
  - requireAuth and requireLevel3 Express middleware (JWT httpOnly cookie-based)
  - sendVerificationEmail() using nodemailer (Ethereal for dev, real SMTP for prod)
  - createVerificationToken() helper using nanoid(64) storing pendingPostData
  - 7 auth endpoints: /request-post, /verify/:token, /resend, /set-password, /login, /logout, /me
  - cookie-parser middleware wired in app.ts
  - 9 integration tests for all auth endpoints using mocked Prisma + email service

affects:
  - 04-02-post-frontend
  - 04-03-user-profile
  - any future plan requiring authentication

tech-stack:
  added: [bcryptjs, jsonwebtoken, cookie-parser, nodemailer, nanoid@3.3.7, @types/bcryptjs, @types/jsonwebtoken, @types/cookie-parser, @types/nodemailer]
  patterns:
    - setAuthCookie() helper centralizes JWT signing and cookie settings
    - requireAuth middleware attaches req.auth for downstream controllers
    - createVerificationToken() separates token creation from controller logic
    - $transaction array form for atomic post creation + token mark-used

key-files:
  created:
    - backend/src/middleware/auth.middleware.ts
    - backend/src/services/email.service.ts
    - backend/src/lib/token.helpers.ts
    - backend/src/routes/auth.routes.ts
    - backend/src/controllers/auth.controller.ts
    - backend/src/__tests__/auth.test.ts
  modified:
    - backend/src/app.ts
    - backend/package.json

key-decisions:
  - "nanoid pinned to 3.3.7 (not v5) — v5 is ESM-only, breaks CommonJS tsconfig"
  - "bcryptjs not bcrypt — same API, no native compilation needed"
  - "setAuthCookie() helper: secure:true only in production so HTTP localhost dev works"
  - "getMe derives level dynamically (passwordHash null = 2, set = 3) instead of trusting JWT level alone"
  - "Jest mock for $transaction uses Promise.all(ops) to resolve PrismaPromises in test environment"
  - "Ethereal defaults when SMTP env vars absent — dev can preview emails without a real SMTP account"

requirements-completed: [POST-05, POST-06, POST-07, AUTH-01, AUTH-02, AUTH-07]

duration: 35min
completed: 2026-03-16
---

# Phase 4 Plan 01: Auth Backend Summary

**JWT httpOnly cookie auth with 7 auth endpoints, bcrypt password hashing, nodemailer verification emails, and nanoid token generation — all wired into the existing Express app**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-16T10:17:17Z
- **Completed:** 2026-03-16T10:52:00Z
- **Tasks:** 3 of 3
- **Files modified:** 8 (6 created, 2 modified)

## Accomplishments

- Installed and configured bcryptjs, jsonwebtoken, cookie-parser, nodemailer, and nanoid@3.3.7
- Built complete auth middleware (requireAuth + requireLevel3) and email service with Ethereal fallback
- Implemented all 7 auth endpoints covering the full 3-level auth flow (email verify → Level 2 → set password → Level 3)
- Wrote 9 passing integration tests with mocked Prisma and email service

## Task Commits

Each task was committed atomically:

1. **Task 1: Install packages and add cookie-parser to app.ts** - `5952770` (chore)
2. **Task 2: Create auth middleware, email service, and VerificationToken helpers** - `845c232` (feat)
3. **Task 3: Create auth routes and controller, register in app.ts, add integration tests** - `2ddd785` (feat)

## Files Created/Modified

- `backend/src/app.ts` - Added cookieParser() middleware and authRoutes registration
- `backend/src/middleware/auth.middleware.ts` - requireAuth and requireLevel3 middleware
- `backend/src/services/email.service.ts` - nodemailer transport, sendVerificationEmail()
- `backend/src/lib/token.helpers.ts` - createVerificationToken() using nanoid(64)
- `backend/src/routes/auth.routes.ts` - 7 auth route definitions
- `backend/src/controllers/auth.controller.ts` - all auth controller functions
- `backend/src/__tests__/auth.test.ts` - 9 integration tests (all passing)
- `backend/package.json` - new runtime + dev type packages added

## Decisions Made

- nanoid pinned to 3.3.7 (not v5) because v5 is ESM-only and breaks this project's CommonJS tsconfig
- bcryptjs chosen over bcrypt — identical API, no native compilation step needed in CI/Azure
- `setAuthCookie()` helper centralizes cookie settings; `secure: process.env.NODE_ENV === 'production'` ensures HTTP localhost dev works without HTTPS
- `getMe` derives level from DB (`passwordHash` null check) rather than trusting the JWT level field alone — always reflects current account state
- Jest `$transaction` mock uses `Promise.all(ops)` to resolve the array of PrismaPromises in the test environment without a real DB
- Nodemailer transport defaults to Ethereal (`smtp.ethereal.email`) when SMTP env vars are absent so development doesn't require an SMTP account

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- First run of auth tests had 1 failure: `Cannot read properties of undefined (reading 'create')` because the Prisma mock was missing the `post` key. Auto-fixed by adding `post.create` to the mock and changing `$transaction` mock to `Promise.all(ops)`. This is a test infrastructure issue, not a production code issue.

## User Setup Required

To use email verification in development, create a free Ethereal account at https://ethereal.email and add to `backend/.env`:

```
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=<your ethereal user>
SMTP_PASS=<your ethereal pass>
JWT_SECRET=<any long random string>
```

Preview sent emails at https://ethereal.email/messages

## Next Phase Readiness

- All 7 auth backend endpoints are live and tested
- Auth middleware ready for frontend integration (04-02)
- Cookie-based auth established — frontend just needs to include `credentials: 'include'` in fetch calls

---
*Phase: 04-auth-and-posting*
*Completed: 2026-03-16*
