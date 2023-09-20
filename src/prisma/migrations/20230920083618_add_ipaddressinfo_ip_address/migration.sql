/*
  Warnings:

  - You are about to drop the column `ip` on the `IpAddressInfo` table. All the data in the column will be lost.
  - You are about to drop the column `query` on the `IpAddressInfo` table. All the data in the column will be lost.
  - Added the required column `ipAddress` to the `IpAddressInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IpAddressInfo" DROP COLUMN "ip",
DROP COLUMN "query",
ADD COLUMN     "ipAddress" TEXT NOT NULL;
