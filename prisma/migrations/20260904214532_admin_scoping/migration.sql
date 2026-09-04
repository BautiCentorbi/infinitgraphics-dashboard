-- CreateEnum
CREATE TYPE "ClientRequestStatus" AS ENUM ('pending', 'approved', 'denied');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'owner';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canCreateClients" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AdminClientAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminClientAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ClientRequestStatus" NOT NULL DEFAULT 'pending',
    "requestedById" TEXT NOT NULL,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminClientAccess_userId_clientId_key" ON "AdminClientAccess"("userId", "clientId");

-- AddForeignKey
ALTER TABLE "AdminClientAccess" ADD CONSTRAINT "AdminClientAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminClientAccess" ADD CONSTRAINT "AdminClientAccess_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
