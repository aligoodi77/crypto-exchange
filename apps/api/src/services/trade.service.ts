import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";

import {
  calculateTradingFee,
  tradingFeePercent,
} from "../utils/trading-fee.js";

import type { BuyCoinInput, SellCoinInput } from "../schemas/trade.schema.js";

import {
  emitPortfolioUpdated,
  emitTradeCompleted,
} from "../realtime/socket.emitters.js";

const TRADE_TRANSACTION_MAX_RETRIES = 3;

function isSerializableConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

async function runSerializableTrade<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  for (let attempt = 1; attempt <= TRADE_TRANSACTION_MAX_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(callback, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (
        attempt < TRADE_TRANSACTION_MAX_RETRIES &&
        isSerializableConflict(error)
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Trade could not be completed. Please try again.", 409);
}

export async function buyCoin(userId: string, input: BuyCoinInput) {
  const symbol = input.symbol.toUpperCase();

  // Pooli ke user mikhad crypto bekhare.
  const grossUsd = new Prisma.Decimal(input.usdAmount);

  // Fee va majmoo pooli ke az wallet kam mishe.
  const fee = calculateTradingFee(grossUsd);
  const chargedUsd = grossUsd.add(fee);

  const result = await runSerializableTrade(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    if (wallet.balanceUsd.lt(chargedUsd)) {
      throw new AppError("Insufficient USD balance including fee", 400);
    }

    const coin = await tx.coin.findUnique({
      where: {
        symbol,
      },
    });

    if (!coin) {
      throw new AppError("Coin not found", 404);
    }

    if (!coin.isActive) {
      throw new AppError("This coin is currently unavailable for trading", 400);
    }

    if (coin.price.lte(0)) {
      throw new AppError("Coin price is not valid", 400);
    }

    // Fee to tedad crypto hesab nemishe.
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

    // Average buy price fee ro ham dar nazar migire
    // ta P/L hazine vagheii user ro neshon bede.
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

        coin: transaction.coin
          ? {
              id: transaction.coin.id,
              name: transaction.coin.name,
              symbol: transaction.coin.symbol,
              image: transaction.coin.image,
            }
          : null,

        createdAt: transaction.createdAt,
      },
    };
  });

  // Emit bayad baad az success shodan database transaction bashe.
  try {
    emitPortfolioUpdated(userId, "BUY");

    emitTradeCompleted(userId, {
      type: "BUY",
      symbol,
    });
  } catch (error) {
    console.error("[socket] Failed to emit buy updates:", error);
  }

  return result;
}

export async function sellCoin(userId: string, input: SellCoinInput) {
  const symbol = input.symbol.toUpperCase();

  const coinAmountToSell = new Prisma.Decimal(input.coinAmount);

  const result = await runSerializableTrade(async (tx) => {
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

    if (!coin) {
      throw new AppError("Coin not found", 404);
    }

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

    // Majmoo forosh ghabl az fee.
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

        coin: transaction.coin
          ? {
              id: transaction.coin.id,
              name: transaction.coin.name,
              symbol: transaction.coin.symbol,
              image: transaction.coin.image,
            }
          : null,

        createdAt: transaction.createdAt,
      },
    };
  });

  // Faghat vaghti sell transaction ba movafaghiat commit shod emit mikonim.
  try {
    emitPortfolioUpdated(userId, "SELL");

    emitTradeCompleted(userId, {
      type: "SELL",
      symbol,
    });
  } catch (error) {
    console.error("[socket] Failed to emit sell updates:", error);
  }

  return result;
}
