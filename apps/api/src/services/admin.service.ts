import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";

import type {
  AdminTransactionsQuery,
  AdminUsersQuery,
  UpdateCoinStatusInput,
} from "../schemas/admin.schema.js";

export async function getAdminStats() {
  const [
    totalUsers,
    verifiedUsers,
    totalCoins,
    activeCoins,
    totalTransactions,
    tradeAggregate,
  ] = await prisma.$transaction([
    prisma.user.count(),

    prisma.user.count({
      where: {
        emailVerifiedAt: {
          not: null,
        },
      },
    }),

    prisma.coin.count(),

    prisma.coin.count({
      where: {
        isActive: true,
      },
    }),

    prisma.transaction.count(),

    prisma.transaction.aggregate({
      _sum: {
        total: true,
        fee: true,
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      unverified: totalUsers - verifiedUsers,
    },

    coins: {
      total: totalCoins,
      active: activeCoins,
      inactive: totalCoins - activeCoins,
    },

    trades: {
      totalTransactions,
      totalTradeVolume: tradeAggregate._sum.total?.toString() ?? "0",
      totalFees: tradeAggregate._sum.fee?.toString() ?? "0",
    },
  };
}

export async function getAdminUsers(query: AdminUsersQuery) {
  const { page, limit, search } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,

        wallet: {
          select: {
            balanceUsd: true,
          },
        },

        _count: {
          select: {
            transactions: true,
          },
        },
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    items: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,

      emailVerified: Boolean(user.emailVerifiedAt),
      emailVerifiedAt: user.emailVerifiedAt,

      cashBalanceUsd: user.wallet?.balanceUsd.toString() ?? "0",

      transactionCount: user._count.transactions,

      createdAt: user.createdAt,
    })),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getAdminUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,

      wallet: {
        select: {
          id: true,
          balanceUsd: true,

          assets: {
            select: {
              id: true,
              amount: true,
              averageBuyPrice: true,

              coin: {
                select: {
                  id: true,
                  name: true,
                  symbol: true,
                  image: true,
                  price: true,
                },
              },
            },
          },
        },
      },

      _count: {
        select: {
          transactions: true,
        },
      },

      transactions: {
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          type: true,
          amount: true,
          price: true,
          total: true,
          fee: true,
          status: true,
          createdAt: true,

          coin: {
            select: {
              name: true,
              symbol: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,

    emailVerified: Boolean(user.emailVerifiedAt),
    emailVerifiedAt: user.emailVerifiedAt,

    transactionCount: user._count.transactions,

    wallet: user.wallet
      ? {
          id: user.wallet.id,
          balanceUsd: user.wallet.balanceUsd.toString(),

          assets: user.wallet.assets.map((asset) => ({
            id: asset.id,
            amount: asset.amount.toString(),
            averageBuyPrice: asset.averageBuyPrice.toString(),

            coin: {
              id: asset.coin.id,
              name: asset.coin.name,
              symbol: asset.coin.symbol,
              image: asset.coin.image,
              currentPrice: asset.coin.price.toString(),
            },
          })),
        }
      : null,

    recentTransactions: user.transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      price: transaction.price.toString(),
      total: transaction.total.toString(),
      fee: transaction.fee.toString(),
      status: transaction.status,
      createdAt: transaction.createdAt,

      coin: transaction.coin
        ? {
            name: transaction.coin.name,
            symbol: transaction.coin.symbol,
          }
        : null,
    })),

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getAdminTransactions(
  query: AdminTransactionsQuery,
) {
  const { page, limit, type, userId } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {};

  if (type) {
    where.type = type;
  }

  if (userId) {
    where.userId = userId;
  }

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        amount: true,
        price: true,
        total: true,
        fee: true,
        status: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        coin: {
          select: {
            id: true,
            name: true,
            symbol: true,
          },
        },
      },
    }),

    prisma.transaction.count({
      where,
    }),
  ]);

  return {
    items: transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,

      amount: transaction.amount.toString(),
      price: transaction.price.toString(),

      grossTotal: transaction.total.toString(),
      fee: transaction.fee.toString(),

      status: transaction.status,
      createdAt: transaction.createdAt,

      user: transaction.user,

      coin: transaction.coin,
    })),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getAdminCoins() {
  const coins = await prisma.coin.findMany({
    orderBy: {
      marketCap: "desc",
    },
  });

  return coins.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    image: coin.image,

    price: coin.price.toString(),
    change24h: coin.change24h.toString(),
    marketCap: coin.marketCap.toString(),
    volume24h: coin.volume24h.toString(),

    isActive: coin.isActive,

    createdAt: coin.createdAt,
    updatedAt: coin.updatedAt,
  }));
}

export async function updateAdminCoinStatus(
  coinId: string,
  input: UpdateCoinStatusInput,
) {
  const coin = await prisma.coin.findUnique({
    where: {
      id: coinId,
    },
  });

  if (!coin) {
    throw new AppError("Coin not found", 404);
  }

  const updatedCoin = await prisma.coin.update({
    where: {
      id: coinId,
    },
    data: {
      isActive: input.isActive,
    },
  });

  return {
    id: updatedCoin.id,
    name: updatedCoin.name,
    symbol: updatedCoin.symbol,
    isActive: updatedCoin.isActive,
    updatedAt: updatedCoin.updatedAt,
  };
}
