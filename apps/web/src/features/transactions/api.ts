import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/lib/api-types";

export type TransactionType = "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW";

export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

export type TransactionItem = {
  id: string;
  type: TransactionType;
  amount: string;
  price: string;
  grossTotal: string;
  fee: string;
  chargedUsd: string | null;
  receivedUsd: string | null;
  status: TransactionStatus;
  createdAt: string;

  coin: {
    id: string;
    name: string;
    symbol: string;
    image: string | null;
    currentPrice: string;
  } | null;
};

export type TransactionsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type TransactionsResponse = {
  items: TransactionItem[];
  pagination: TransactionsPagination;
};

export type TransactionsParams = {
  page?: number;
  limit?: number;
  type?: "BUY" | "SELL";
  status?: TransactionStatus;
};

export async function getMyTransactions(
  token: string,
  params: TransactionsParams = {},
): Promise<TransactionsResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
  });

  if (params.type) {
    searchParams.set("type", params.type);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  const response = await apiClient.get<
    ApiSuccessResponse<TransactionsResponse>
  >(`/api/transactions?${searchParams.toString()}`, {
    token,
  });

  return response.data;
}
