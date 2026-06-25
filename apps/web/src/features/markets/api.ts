import { apiClient } from "@/lib/api-client";

import type { MarketsParams, MarketsResponse } from "@/features/markets/types";

const DEFAULT_MARKETS_PARAMS = {
  page: 1,
  limit: 10,
  sortBy: "marketCap",
  sortOrder: "desc",
} as const;

export async function getMarkets(
  params: MarketsParams = {},
): Promise<MarketsResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? DEFAULT_MARKETS_PARAMS.page),
    limit: String(params.limit ?? DEFAULT_MARKETS_PARAMS.limit),
    sortBy: params.sortBy ?? DEFAULT_MARKETS_PARAMS.sortBy,
    sortOrder: params.sortOrder ?? DEFAULT_MARKETS_PARAMS.sortOrder,
  });

  const normalizedSearch = params.search?.trim();

  if (normalizedSearch) {
    searchParams.set("search", normalizedSearch);
  }

  return apiClient.get<MarketsResponse>(
    `/api/markets?${searchParams.toString()}`,
  );
}
