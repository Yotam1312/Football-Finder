-- AlterEnum
ALTER TYPE "PostType" ADD VALUE 'GETTING_THERE';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "transportType" TEXT,
ADD COLUMN     "travelCost" TEXT,
ADD COLUMN     "travelTime" TEXT;

-- AlterTable
ALTER TABLE "Stadium" ADD COLUMN     "nearbyBuses" TEXT[],
ADD COLUMN     "nearbyMetros" TEXT[],
ADD COLUMN     "nearbyTrains" TEXT[],
ADD COLUMN     "parkingInfo" TEXT,
ADD COLUMN     "publicTransportInfo" TEXT,
ADD COLUMN     "walkingTimeFromCenter" TEXT;
