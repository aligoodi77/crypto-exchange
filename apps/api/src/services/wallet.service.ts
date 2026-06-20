import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/app-error";

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

  const zero = new Prisma.Decimal(0);

  let totalAssetValue = zero;
  let totalCostBasis = zero;

  const assets = wallet.assets.map((asset) => {
    const currentPrice = asset.coin.price;

    const currentValue = asset.amount.mul(currentPrice);

    const costBasis = asset.amount.mul(asset.averageBuyPrice);

    const profitLoss = currentValue.sub(costBasis);

    const profitLossPercent = costBasis.eq(0)
      ? zero
      : profitLoss.div(costBasis).mul(100);

    totalAssetValue = totalAssetValue.add(currentValue);
    totalCostBasis = totalCostBasis.add(costBasis);

    return {
      id: asset.id,

      amount: asset.amount.toString(),
      averageBuyPrice: asset.averageBuyPrice.toString(),

      currentPrice: currentPrice.toString(),
      currentValue: currentValue.toString(),

      costBasis: costBasis.toString(),

      profitLoss: profitLoss.toString(),

      profitLossPercent: profitLossPercent.toDecimalPlaces(2).toString(),

      coin: {
        id: asset.coin.id,
        name: asset.coin.name,
        symbol: asset.coin.symbol,
        image: asset.coin.image,
        change24h: asset.coin.change24h.toString(),
      },
    };
  });

  const totalProfitLoss = totalAssetValue.sub(totalCostBasis);

  const totalProfitLossPercent = totalCostBasis.eq(0)
    ? zero
    : totalProfitLoss.div(totalCostBasis).mul(100);

  const totalPortfolioValue = wallet.balanceUsd.add(totalAssetValue);

  return {
    id: wallet.id,

    balanceUsd: wallet.balanceUsd.toString(),

    assets,

    summary: {
      cashBalanceUsd: wallet.balanceUsd.toString(),

      totalAssetValue: totalAssetValue.toString(),

      totalCostBasis: totalCostBasis.toString(),

      totalProfitLoss: totalProfitLoss.toString(),

      totalProfitLossPercent: totalProfitLossPercent
        .toDecimalPlaces(2)
        .toString(),

      totalPortfolioValue: totalPortfolioValue.toString(),

      assetCount: assets.length,
    },

    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
}
