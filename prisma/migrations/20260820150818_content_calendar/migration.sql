-- AlterTable
ALTER TABLE "ContentPiece" ADD COLUMN     "hashtags" TEXT,
ADD COLUMN     "topicId" TEXT;

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_clientId_name_key" ON "Topic"("clientId", "name");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPiece" ADD CONSTRAINT "ContentPiece_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
