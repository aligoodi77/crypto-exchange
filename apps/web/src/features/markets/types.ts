import type { PaginatedApiResponse } from "@/lib/api-types";

export type MarketCoin = {
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  price: string;
  change24h: string;
  marketCap: string;
  volume24h: string;
  updatedAt: string;
};

export type MarketSortBy =
  | "marketCap"
  | "price"
  | "change24h"
  | "volume24h"
  | "name";

export type MarketSortOrder = "asc" | "desc";

export type MarketsParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: MarketSortBy;
  sortOrder?: MarketSortOrder;
};

export type MarketsResponse = PaginatedApiResponse<MarketCoin>;
