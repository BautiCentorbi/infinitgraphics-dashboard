-- CreateTable
CREATE TABLE "DataConnection" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'windsor',
    "externalAccountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataConnection_clientId_platform_key" ON "DataConnection"("clientId", "platform");

-- AddForeignKey
ALTER TABLE "DataConnection" ADD CONSTRAINT "DataConnection_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
