import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";
import type { BuyCoinInput } from "../schemas/trade.schema.js";

export async function buyCoin(userId: string, input: BuyCoinInput) {
  const symbol = input.symbol.toUpperCase();
  const usdAmount = new Prisma.Decimal(input.usdAmount);

  const result = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    if (wallet.balanceUsd.lt(usdAmount)) {
      throw new AppError("Insufficient USD balance", 400);
    }

    const coin = await tx.coin.findUnique({
      where: {
        symbol,
      },
    });

    if (!coin) {
      throw new AppError("Coin not found", 404);
    }

    if (coin.price.lte(0)) {
      throw new AppError("Coin price is not valid", 400);
    }

    const coinAmount = usdAmount.div(coin.price);

    const existingAsset = await tx.walletAsset.findUnique({
      where: {
        walletId_coinId: {
          walletId: wallet.id,
          coinId: coin.id,
        },
      },
    });

    let newAssetAmount = coinAmount;
    let newAverageBuyPrice = coin.price;

    if (existingAsset) {
      const oldAmount = existingAsset.amount;
      const oldAverageBuyPrice = existingAsset.averageBuyPrice;

      const oldTotalCost = oldAmount.mul(oldAverageBuyPrice);
      const newTotalCost = oldTotalCost.add(usdAmount);

      newAssetAmount = oldAmount.add(coinAmount);
      newAverageBuyPrice = newTotalCost.div(newAssetAmount);
    }

    const updatedWallet = await tx.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balanceUsd: wallet.balanceUsd.sub(usdAmount),
      },
    });

    const walletAsset = await tx.walletAsset.upsert({
      where: {
        walletId_coinId: {
          walletId: wallet.id,
          coinId: coin.id,
        },
      },
      update: {
        amount: newAssetAmount,
        averageBuyPrice: newAverageBuyPrice,
      },
      create: {
        walletId: wallet.id,
        coinId: coin.id,
        amount: coinAmount,
        averageBuyPrice: coin.price,
      },
      include: {
        coin: true,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId,
        coinId: coin.id,
        type: "BUY",
        amount: coinAmount,
        price: coin.price,
        total: usdAmount,
        status: "SUCCESS",
      },
      include: {
        coin: true,
      },
    });

    return {
      wallet: {
        id: updatedWallet.id,
        balanceUsd: updatedWallet.balanceUsd.toString(),
      },
      asset: {
        id: walletAsset.id,
        amount: walletAsset.amount.toString(),
        averageBuyPrice: walletAsset.averageBuyPrice.toString(),
        coin: {
          id: walletAsset.coin.id,
          name: walletAsset.coin.name,
          symbol: walletAsset.coin.symbol,
          image: walletAsset.coin.image,
          price: walletAsset.coin.price.toString(),
        },
      },
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        price: transaction.price.toString(),
        total: transaction.total.toString(),
        status: transaction.status,
        coin: transaction.coin,
        createdAt: transaction.createdAt,
      },
    };
  });

  return result;
}
