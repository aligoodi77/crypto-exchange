-- CreateTable
CREATE TABLE "TradeIdempotencyKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeIdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TradeIdempotencyKey_userId_key_key" ON "TradeIdempotencyKey"("userId", "key");

-- CreateIndex
CREATE INDEX "TradeIdempotencyKey_createdAt_idx" ON "TradeIdempotencyKey"("createdAt");

-- AddForeignKey
ALTER TABLE "TradeIdempotencyKey" ADD CONSTRAINT "TradeIdempotencyKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
