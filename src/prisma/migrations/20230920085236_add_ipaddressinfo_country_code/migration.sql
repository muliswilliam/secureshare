/*
  Warnings:

  - Added the required column `countryCode` to the `IpAddressInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IpAddressInfo" ADD COLUMN     "countryCode" TEXT NOT NULL;
