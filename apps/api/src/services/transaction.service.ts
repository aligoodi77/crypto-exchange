import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { TransactionsQuery } from "../schemas/transaction.schema.js";

export async function getMyTransactions(
  userId: string,
  query: TransactionsQuery,
) {
  const { page, limit, type } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {
    userId,
  };

  if (type) {
    where.type = type;
  }

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: {
        coin: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
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
      total: transaction.total.toString(),
      status: transaction.status,
      createdAt: transaction.createdAt,

      coin: transaction.coin
        ? {
            id: transaction.coin.id,
            name: transaction.coin.name,
            symbol: transaction.coin.symbol,
            image: transaction.coin.image,
            currentPrice: transaction.coin.price.toString(),
          }
        : null,
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
