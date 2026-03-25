-- AlterTable
ALTER TABLE "Stadium" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Stadium_name_idx" ON "Stadium"("name");
