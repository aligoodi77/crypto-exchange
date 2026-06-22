-- AlterTable
ALTER TABLE "Coin" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Coin_isActive_idx" ON "Coin"("isActive");
