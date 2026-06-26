"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminCoins,
  getAdminStats,
  getAdminTransactions,
  getAdminUsers,
  syncAdminCoins,
  updateAdminCoinStatus,
} from "@/features/admin/api";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: (params: { page: number; limit: number; search: string }) =>
    [...adminKeys.all, "users", params] as const,
  transactions: (params: { page: number; limit: number; type?: "BUY" | "SELL" }) =>
    [...adminKeys.all, "transactions", params] as const,
  coins: () => [...adminKeys.all, "coins"] as const,
};

export function useAdminStats(token: string | null) {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => getAdminStats(token!),
    enabled: Boolean(token),
    staleTime: 15_000,
  });
}

export function useAdminUsers(
  token: string | null,
  params: { page?: number; limit?: number; search?: string } = {},
) {
  const normalized = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search?.trim() ?? "",
  };

  return useQuery({
    queryKey: adminKeys.users(normalized),
    queryFn: () => getAdminUsers(token!, normalized),
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminTransactions(
  token: string | null,
  params: { page?: number; limit?: number; type?: "BUY" | "SELL" } = {},
) {
  const normalized = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    type: params.type,
  };

  return useQuery({
    queryKey: adminKeys.transactions(normalized),
    queryFn: () =>
      getAdminTransactions(token!, {
        page: normalized.page,
        limit: normalized.limit,
        type: normalized.type,
      }),
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminCoins(token: string | null) {
  return useQuery({
    queryKey: adminKeys.coins(),
    queryFn: () => getAdminCoins(token!),
    enabled: Boolean(token),
    staleTime: 15_000,
  });
}

export function useUpdateAdminCoinStatus(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; isActive: boolean }) =>
      updateAdminCoinStatus(token!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.coins() });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}

export function useSyncAdminCoins(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => syncAdminCoins(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}
