import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/lib/api-types";

export type AdminStats = {
  users: {
    total: number;
    verified: number;
    unverified: number;
  };
  coins: {
    total: number;
    active: number;
    inactive: number;
  };
  trades: {
    totalTransactions: number;
    totalTradeVolume: string;
    totalFees: string;
  };
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  cashBalanceUsd: string;
  transactionCount: number;
  createdAt: string;
};

export type AdminTransaction = {
  id: string;
  type: "BUY" | "SELL";
  amount: string;
  price: string;
  grossTotal: string;
  fee: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  coin: {
    id: string;
    name: string;
    symbol: string;
  } | null;
};

export type AdminCoin = {
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  price: string;
  change24h: string;
  marketCap: string;
  volume24h: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminListResponse<T> = {
  items: T[];
  pagination: AdminPagination;
};

export async function getAdminStats(token: string): Promise<AdminStats> {
  const response = await apiClient.get<ApiSuccessResponse<AdminStats>>(
    "/api/admin/stats",
    { token },
  );

  return response.data;
}

export async function getAdminUsers(
  token: string,
  params: { page?: number; limit?: number; search?: string } = {},
): Promise<AdminListResponse<AdminUser>> {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
  });

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  const response = await apiClient.get<
    ApiSuccessResponse<AdminListResponse<AdminUser>>
  >(`/api/admin/users?${searchParams.toString()}`, { token });

  return response.data;
}

export async function getAdminTransactions(
  token: string,
  params: { page?: number; limit?: number; type?: "BUY" | "SELL" } = {},
): Promise<AdminListResponse<AdminTransaction>> {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
  });

  if (params.type) {
    searchParams.set("type", params.type);
  }

  const response = await apiClient.get<
    ApiSuccessResponse<AdminListResponse<AdminTransaction>>
  >(`/api/admin/transactions?${searchParams.toString()}`, { token });

  return response.data;
}

export async function getAdminCoins(token: string): Promise<AdminCoin[]> {
  const response = await apiClient.get<ApiSuccessResponse<AdminCoin[]>>(
    "/api/admin/coins",
    { token },
  );

  return response.data;
}

export async function updateAdminCoinStatus(
  token: string,
  input: { id: string; isActive: boolean },
): Promise<Pick<AdminCoin, "id" | "name" | "symbol" | "isActive" | "updatedAt">> {
  const response = await apiClient.patch<
    ApiSuccessResponse<
      Pick<AdminCoin, "id" | "name" | "symbol" | "isActive" | "updatedAt">
    >,
    { isActive: boolean }
  >(`/api/admin/coins/${input.id}/status`, { isActive: input.isActive }, { token });

  return response.data;
}

export async function syncAdminCoins(
  token: string,
): Promise<{ count: number; syncedAt: string }> {
  const response = await apiClient.post<
    ApiSuccessResponse<{ count: number; syncedAt: string }>,
    Record<string, never>
  >("/api/admin/coins/sync", {}, { token });

  return response.data;
}
