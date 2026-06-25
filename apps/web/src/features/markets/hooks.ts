"use client";

import { useQuery } from "@tanstack/react-query";

import { getMarkets } from "@/features/markets/api";

import type {
  MarketsParams,
  MarketSortBy,
  MarketSortOrder,
} from "@/features/markets/types";

type NormalizedMarketsParams = {
  page: number;
  limit: number;
  search: string;
  sortBy: MarketSortBy;
  sortOrder: MarketSortOrder;
};

function normalizeMarketsParams(
  params: MarketsParams = {},
): NormalizedMarketsParams {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search?.trim() ?? "",
    sortBy: params.sortBy ?? "marketCap",
    sortOrder: params.sortOrder ?? "desc",
  };
}

export const marketKeys = {
  all: ["markets"] as const,

  list: (params: NormalizedMarketsParams) =>
    [...marketKeys.all, "list", params] as const,
};

export function useMarkets(params: MarketsParams = {}) {
  const normalizedParams = normalizeMarketsParams(params);

  return useQuery({
    queryKey: marketKeys.list(normalizedParams),

    queryFn: () => getMarkets(normalizedParams),

    staleTime: 30_000,

    placeholderData: (previousData) => previousData,

    refetchOnWindowFocus: false,
  });
}
