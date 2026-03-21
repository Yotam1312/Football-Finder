---
phase: 10-photo-upload
plan: "01"
subsystem: backend
tags: [upload, azure-blob, multer, photo]
dependency_graph:
  requires: []
  provides: [POST /api/upload, photoUrl in post creation]
  affects: [backend/src/app.ts, backend/src/controllers/posts.controller.ts]
tech_stack:
  added: [multer@2.1.1, @azure/storage-blob@12.31.0, @types/multer]
  patterns: [multer memoryStorage, BlobServiceClient.fromConnectionString, requireLevel3 guard]
key_files:
  created:
    - backend/src/controllers/upload.controller.ts
    - backend/src/routes/upload.routes.ts
    - backend/src/__tests__/upload.test.ts
  modified:
    - backend/src/app.ts
    - backend/src/controllers/posts.controller.ts
    - backend/src/__tests__/posts.test.ts
    - backend/.env.example
    - backend/package.json
decisions:
  - "@types/multer installed as devDependency — multer v2.1.1 does not ship its own TypeScript types despite plan note; @types/multer resolves the TS2339 and TS7016 errors"
metrics:
  duration: 4min
  completed: "2026-03-21"
  tasks_completed: 3
  files_changed: 8
---

# Phase 10 Plan 01: Backend Upload Endpoint Summary

**One-liner:** multer + Azure Blob Storage POST /api/upload endpoint behind requireLevel3, with 5MB/type validation and 4 passing unit tests.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create upload controller and route | e921bfb | upload.controller.ts, upload.routes.ts, app.ts, .env.example, package.json |
| 2 | Create upload endpoint tests | ce058f2 | upload.test.ts |
| 3 | Extend posts test for photoUrl persistence | 1e7d21a | posts.test.ts, posts.controller.ts |

## What Was Built

**upload.controller.ts** exports:
- `upload` — multer configured with memoryStorage, 5MB fileSize limit, and fileFilter accepting only image/jpeg, image/png, image/webp
- `uploadPhoto` — async handler that connects to Azure Blob Storage, generates a UUID-based blob name under the `posts/` prefix, uploads the buffer with correct Content-Type, and returns `{ url }` or 500 on error

**upload.routes.ts** registers `POST /` with:
- `requireLevel3` middleware (401 for unauthenticated, 403 for Level 2 users)
- multer wrapped in a custom callback to intercept multer errors and return 400 JSON instead of Express's default HTML error page
- `uploadPhoto` controller

**app.ts** now includes `app.use('/api/upload', uploadRoutes)`.

**posts.controller.ts** now passes `photoUrl: photoUrl || null` to `prisma.post.create`.

## Test Results

All 86 backend tests pass (14 suites). 4 new upload tests cover:
1. 401 for unauthenticated request
2. 400 for non-image MIME type (text/plain)
3. 400 for file over 5MB
4. 200 with `{ url }` for valid jpeg upload (Azure SDK fully mocked)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed @types/multer despite plan saying "do NOT install @types/multer"**
- **Found during:** Task 1 TypeScript verification
- **Issue:** multer v2.1.1 does not ship its own TypeScript declaration files. The plan note ("multer v2+ ships its own types") is incorrect. Without `@types/multer`, the compiler emitted TS7016 (implicit any for multer module) and TS2339 (req.file does not exist on Request).
- **Fix:** Added `@types/multer` as a devDependency. The official `@types/multer` package augments Express's `Request` interface with the `file` property, which resolved all type errors.
- **Files modified:** backend/package.json, backend/package-lock.json
- **Commit:** e921bfb

## Self-Check

- [x] backend/src/controllers/upload.controller.ts exists
- [x] backend/src/routes/upload.routes.ts exists
- [x] backend/src/__tests__/upload.test.ts exists
- [x] All 86 tests pass
- [x] `npx tsc --noEmit` exits 0
