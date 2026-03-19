-- Phase 9: OAuth Foundation — schema migration
-- Adds Google OAuth fields to User, fixes cascade delete rules, drops VerificationToken table.

-- Step 1: Add new columns to User table
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "country" TEXT;

-- Step 2: Add unique constraint on googleId (allows NULLs — only non-null values must be unique)
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- Step 3: Drop old FK on Post.userId (no cascade rule) and re-create with SET NULL
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_userId_fkey";
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Drop old FK on Upvote.userId and re-create with CASCADE
ALTER TABLE "Upvote" DROP CONSTRAINT IF EXISTS "Upvote_userId_fkey";
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Drop old FK on UserFavorite.userId and re-create with CASCADE
ALTER TABLE "UserFavorite" DROP CONSTRAINT IF EXISTS "UserFavorite_userId_fkey";
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Drop VerificationToken table (and its FK to User, which cascades automatically)
DROP TABLE IF EXISTS "VerificationToken";
