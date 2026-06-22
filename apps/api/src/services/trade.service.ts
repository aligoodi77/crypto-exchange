import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";
import {
  calculateTradingFee,
  tradingFeePercent,
} from "../utils/trading-fee.js";
import type { BuyCoinInput, SellCoinInput } from "../schemas/trade.schema.js";

export async function buyCoin(userId: string, input: BuyCoinInput) {
  const symbol = input.symbol.toUpperCase();

  // In amount faghat pooli hast ke user mikhad crypto bekhare.
  const grossUsd = new Prisma.Decimal(input.usdAmount);

  // Fee va pooli ke vaghean az wallet kam mishe.
  const fee = calculateTradingFee(grossUsd);
  const chargedUsd = grossUsd.add(fee);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    // Balance bayad fee ro ham cover kone.
    if (wallet.balanceUsd.lt(chargedUsd)) {
      throw new AppError("Insufficient USD balance including fee", 400);
    }

    const coin = await tx.coin.findUnique({
      where: {
        symbol,
      },
    });

    if (!coin.isActive) {
      throw new AppError("This coin is currently unavailable for trading", 400);
    }

    if (coin.price.lte(0)) {
      throw new AppError("Coin price is not valid", 400);
    }

    // Tedad coin faghat bar asas grossUsd hesab mishe, na fee.
    const coinAmount = grossUsd.div(coin.price);

    const existingAsset = await tx.walletAsset.findUnique({
      where: {
        walletId_coinId: {
          walletId: wallet.id,
          coinId: coin.id,
        },
      },
    });

    let newAssetAmount = coinAmount;

    // Buy fee ro to average buy price hesab mikonim
    // ta P/L vaghean hazine real user ro neshon bede.
    let newAverageBuyPrice = chargedUsd.div(coinAmount);

    if (existingAsset) {
      const oldCostBasis = existingAsset.amount.mul(
        existingAsset.averageBuyPrice,
      );

      const newTotalCostBasis = oldCostBasis.add(chargedUsd);

      newAssetAmount = existingAsset.amount.add(coinAmount);

      newAverageBuyPrice = newTotalCostBasis.div(newAssetAmount);
    }

    const updatedWallet = await tx.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balanceUsd: wallet.balanceUsd.sub(chargedUsd),
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
        averageBuyPrice: newAverageBuyPrice,
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
        total: grossUsd,
        fee,
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

        grossTotal: transaction.total.toString(),
        fee: transaction.fee.toString(),
        chargedUsd: chargedUsd.toString(),
        feePercent: tradingFeePercent.toString(),

        status: transaction.status,
        coin: transaction.coin,
        createdAt: transaction.createdAt,
      },
    };
  });
}

export async function sellCoin(userId: string, input: SellCoinInput) {
  const symbol = input.symbol.toUpperCase();

  const coinAmountToSell = new Prisma.Decimal(input.coinAmount);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    const coin = await tx.coin.findUnique({
      where: {
        symbol,
      },
    });

    if (!coin.isActive) {
      throw new AppError("This coin is currently unavailable for trading", 400);
    }

    if (coin.price.lte(0)) {
      throw new AppError("Coin price is not valid", 400);
    }

    const asset = await tx.walletAsset.findUnique({
      where: {
        walletId_coinId: {
          walletId: wallet.id,
          coinId: coin.id,
        },
      },
    });

    if (!asset || asset.amount.lt(coinAmountToSell)) {
      throw new AppError("Insufficient coin balance", 400);
    }

    // Gross yani total sale ghabl az kam shodane fee.
    const grossUsd = coinAmountToSell.mul(coin.price);

    const fee = calculateTradingFee(grossUsd);

    // Pooli ke vaghean be wallet user ezafe mishe.
    const receivedUsd = grossUsd.sub(fee);

    const remainingAmount = asset.amount.sub(coinAmountToSell);

    const updatedWallet = await tx.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balanceUsd: wallet.balanceUsd.add(receivedUsd),
      },
    });

    let updatedAsset: {
      id: string;
      amount: string;
      averageBuyPrice: string;
      coin: {
        id: string;
        name: string;
        symbol: string;
        image: string | null;
        price: string;
      };
    } | null = null;

    if (remainingAmount.eq(0)) {
      await tx.walletAsset.delete({
        where: {
          id: asset.id,
        },
      });
    } else {
      const savedAsset = await tx.walletAsset.update({
        where: {
          id: asset.id,
        },
        data: {
          amount: remainingAmount,
        },
        include: {
          coin: true,
        },
      });

      updatedAsset = {
        id: savedAsset.id,
        amount: savedAsset.amount.toString(),
        averageBuyPrice: savedAsset.averageBuyPrice.toString(),
        coin: {
          id: savedAsset.coin.id,
          name: savedAsset.coin.name,
          symbol: savedAsset.coin.symbol,
          image: savedAsset.coin.image,
          price: savedAsset.coin.price.toString(),
        },
      };
    }

    const transaction = await tx.transaction.create({
      data: {
        userId,
        coinId: coin.id,
        type: "SELL",
        amount: coinAmountToSell,
        price: coin.price,
        total: grossUsd,
        fee,
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

      asset: updatedAsset,

      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        price: transaction.price.toString(),

        grossTotal: transaction.total.toString(),
        fee: transaction.fee.toString(),
        receivedUsd: receivedUsd.toString(),
        feePercent: tradingFeePercent.toString(),

        status: transaction.status,
        coin: transaction.coin,
        createdAt: transaction.createdAt,
      },
    };
  });
}
