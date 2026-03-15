-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "ticketUrl" TEXT;

-- CreateTable
CREATE TABLE "TeamStanding" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "draws" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "goalsFor" INTEGER NOT NULL,
    "goalsAgainst" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "TeamStanding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamStanding_teamId_idx" ON "TeamStanding"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamStanding_teamId_leagueId_season_key" ON "TeamStanding"("teamId", "leagueId", "season");

-- AddForeignKey
ALTER TABLE "TeamStanding" ADD CONSTRAINT "TeamStanding_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamStanding" ADD CONSTRAINT "TeamStanding_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
