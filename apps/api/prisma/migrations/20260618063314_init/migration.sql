-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'BUY', 'SELL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "image" TEXT,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "change24h" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "marketCap" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "volume24h" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balanceUsd" DECIMAL(65,30) NOT NULL DEFAULT 10000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletAsset" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "coinId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "averageBuyPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coinId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "TransactionStatus" NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Coin_symbol_key" ON "Coin"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAsset_walletId_coinId_key" ON "WalletAsset"("walletId", "coinId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletAsset" ADD CONSTRAINT "WalletAsset_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletAsset" ADD CONSTRAINT "WalletAsset_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
