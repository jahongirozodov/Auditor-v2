-- AlterTable: drop region, address, risk, since columns from Organization
ALTER TABLE "Organization" DROP COLUMN "address",
DROP COLUMN "region",
DROP COLUMN "risk",
DROP COLUMN "since";
