import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import type { GetMarketsQuery } from "../schemas/market.schema.js";

export async function getMarkets(query: GetMarketsQuery) {
  const { page, limit, search, sortBy, sortOrder } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.CoinWhereInput = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        symbol: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const orderByMap = {
    marketCap: { marketCap: sortOrder },
    price: { price: sortOrder },
    change24h: { change24h: sortOrder },
    volume24h: { volume24h: sortOrder },
    name: { name: sortOrder },
  } satisfies Record<
    GetMarketsQuery["sortBy"],
    Prisma.CoinOrderByWithRelationInput
  >;

  const orderBy = orderByMap[sortBy];

  const [totalItems, coins] = await prisma.$transaction([
    prisma.coin.count({
      where,
    }),

    prisma.coin.findMany({
      where,
      orderBy,
      skip,
      take: limit,

      select: {
        id: true,
        name: true,
        symbol: true,
        image: true,
        price: true,
        change24h: true,
        marketCap: true,
        volume24h: true,
        updatedAt: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data: coins.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image,

      price: coin.price.toString(),
      change24h: coin.change24h.toString(),
      marketCap: coin.marketCap.toString(),
      volume24h: coin.volume24h.toString(),

      updatedAt: coin.updatedAt.toISOString(),
    })),

    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
