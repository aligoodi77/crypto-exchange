"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getMyTransactions,
  type TransactionsParams,
} from "@/features/transactions/api";

function normalizeTransactionsParams(params: TransactionsParams = {}) {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.type ? { type: params.type } : {}),
    ...(params.status ? { status: params.status } : {}),
  };
}

export const transactionKeys = {
  all: ["transactions"] as const,

  list: (
    userId: string | null,
    params: ReturnType<typeof normalizeTransactionsParams>,
  ) => [...transactionKeys.all, "list", userId ?? "anonymous", params] as const,
};

export function useMyTransactions(
  token: string | null,
  userId: string | null,
  params: TransactionsParams = {},
) {
  const normalizedParams = normalizeTransactionsParams(params);

  return useQuery({
    queryKey: transactionKeys.list(userId, normalizedParams),

    queryFn: () => getMyTransactions(token!, normalizedParams),

    enabled: Boolean(token && userId),

    staleTime: 10_000,

    refetchOnWindowFocus: true,
  });
}
