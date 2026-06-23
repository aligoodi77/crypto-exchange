import { afterAll, beforeEach } from "vitest";
import { prisma } from "../lib/prisma.js";

async function cleanDatabase() {
  // Child table ha bayad ghabl az parent table ha pak beshan.
  await prisma.tradeIdempotencyKey.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.revokedToken.deleteMany();

  await prisma.transaction.deleteMany();
  await prisma.walletAsset.deleteMany();
  await prisma.wallet.deleteMany();

  await prisma.coin.deleteMany();
  await prisma.user.deleteMany();
}

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
