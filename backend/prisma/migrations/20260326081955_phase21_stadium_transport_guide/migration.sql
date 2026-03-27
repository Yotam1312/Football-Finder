-- AlterTable
ALTER TABLE "Stadium" ADD COLUMN     "budgetCheap" TEXT,
ADD COLUMN     "budgetComfort" TEXT,
ADD COLUMN     "budgetStandard" TEXT,
ADD COLUMN     "fromAirportInfo" TEXT,
ADD COLUMN     "paymentInfo" TEXT,
ADD COLUMN     "proTips" TEXT[],
ADD COLUMN     "recommendedApps" TEXT[],
ADD COLUMN     "travelTimesInfo" TEXT;
