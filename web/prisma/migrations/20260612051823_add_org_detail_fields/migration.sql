/*
  Warnings:

  - The `risk` column on the `Organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
DROP COLUMN "risk",
ADD COLUMN     "risk" TEXT,
ALTER COLUMN "since" DROP NOT NULL;

-- DropEnum
DROP TYPE "RiskLevel";
