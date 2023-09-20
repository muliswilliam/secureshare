-- DropIndex
DROP INDEX "Event_timestamp_idx";

-- CreateTable
CREATE TABLE "IpAddressInfo" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "timezone" TEXT NOT NULL,
    "isp" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "as" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "IpAddressInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_id_timestamp_idx" ON "Event"("id", "timestamp");

-- AddForeignKey
ALTER TABLE "IpAddressInfo" ADD CONSTRAINT "IpAddressInfo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
