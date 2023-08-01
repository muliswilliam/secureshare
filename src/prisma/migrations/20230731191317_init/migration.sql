-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "createdAt" INTEGER NOT NULL,
    "notifyOnOpen" BOOLEAN NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
