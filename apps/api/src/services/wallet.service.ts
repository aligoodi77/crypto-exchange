import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function getMyWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: {
      userId,
    },
    include: {
      assets: {
        include: {
          coin: true,
        },
      },
    },
  });

  if (!wallet) {
    throw new AppError("Wallet not found", 404);
  }

  return {
    id: wallet.id,
    balanceUsd: wallet.balanceUsd.toString(),
    assets: wallet.assets.map((asset) => ({
      id: asset.id,
      amount: asset.amount.toString(),
      coin: {
        id: asset.coin.id,
        name: asset.coin.name,
        symbol: asset.coin.symbol,
        image: asset.coin.image,
        price: asset.coin.price.toString(),
        change24h: asset.coin.change24h.toString(),
      },
    })),
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
}
