/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `IpAddressInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "IpAddressInfo" DROP CONSTRAINT "IpAddressInfo_eventId_fkey";

-- AlterTable
ALTER TABLE "IpAddressInfo" ALTER COLUMN "eventId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "IpAddressInfo_eventId_key" ON "IpAddressInfo"("eventId");

-- AddForeignKey
ALTER TABLE "IpAddressInfo" ADD CONSTRAINT "IpAddressInfo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
