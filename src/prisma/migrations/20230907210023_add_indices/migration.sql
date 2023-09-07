-- CreateIndex
CREATE INDEX "Message_userId_publicId_idx" ON "Message"("userId", "publicId");
