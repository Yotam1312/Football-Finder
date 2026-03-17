-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "favoriteClubId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_favoriteClubId_fkey" FOREIGN KEY ("favoriteClubId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
