/*
  Warnings:

  - Added the required column `regionName` to the `IpAddressInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IpAddressInfo" ADD COLUMN     "regionName" TEXT NOT NULL;
