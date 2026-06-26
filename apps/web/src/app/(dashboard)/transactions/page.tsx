"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { isApiError } from "@/lib/api-error";

import type {
  TransactionItem,
  TransactionStatus,
  TransactionType,
} from "@/features/transactions/api";
import { useMyTransactions } from "@/features/transactions/hooks";
import {
  formatCryptoAmount,
  formatDate,
  formatUsd,
} from "@/features/wallet/formatters";

import { useAuthStore } from "@/store/auth-store";

const PAGE_SIZE = 10;
type TypeFilter = "ALL" | Extract<TransactionType, "BUY" | "SELL">;
type StatusFilter = "ALL" | TransactionStatus;

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const transactionsQuery = useMyTransactions(token, user?.id ?? null, {
    page,
    limit: PAGE_SIZE,
    type: typeFilter === "ALL" ? undefined : typeFilter,
  });

  const transactions = useMemo(() => {
    const items = transactionsQuery.data?.items ?? [];

    if (statusFilter === "ALL") {
      return items;
    }

    return items.filter((transaction) => transaction.status === statusFilter);
  }, [statusFilter, transactionsQuery.data?.items]);

  const pagination = transactionsQuery.data?.pagination;

  function updateTypeFilter(nextType: TypeFilter) {
    setTypeFilter(nextType);
    setPage(1);
  }

  function updateStatusFilter(nextStatus: StatusFilter) {
    setStatusFilter(nextStatus);
    setPage(1);
  }

  return (
    <AppShell title="Transactions" subtitle="Full trade history and settlement details.">
      <div className="space-y-5">
        <Card className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["ALL", "BUY", "SELL"] as const).map((filter) => (
                <Button
                  key={filter}
                  onClick={() => updateTypeFilter(filter)}
                  size="sm"
                  variant={typeFilter === filter ? "default" : "outline"}
                >
                  {filter === "ALL" ? "All Types" : filter}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {(["ALL", "SUCCESS", "PENDING", "FAILED"] as const).map(
                (filter) => (
                  <Button
                    key={filter}
                    onClick={() => updateStatusFilter(filter)}
                    size="sm"
                    variant={statusFilter === filter ? "secondary" : "outline"}
                  >
                    {filter === "ALL" ? "All Statuses" : filter}
                  </Button>
                ),
              )}
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">All Transactions</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {pagination
                  ? `${pagination.total.toLocaleString()} server-side matches`
                  : "Loading transaction history..."}
              </p>
            </div>

            {transactionsQuery.isFetching && !transactionsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <RefreshCw className="size-3 animate-spin" />
                Refreshing
              </div>
            ) : null}
          </div>

          {transactionsQuery.isError ? (
            <TransactionsError
              message={
                isApiError(transactionsQuery.error)
                  ? transactionsQuery.error.message
                  : "Could not load transactions."
              }
              onRetry={() => {
                void transactionsQuery.refetch();
              }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-280 text-left">
                  <thead className="border-b border-white/10 bg-white/2">
                    <tr>
                      {[
                        "Type",
                        "Asset",
                        "Amount",
                        "Price",
                        "Fee",
                        "Gross Total",
                        "Charged USD",
                        "Received USD",
                        "Date",
                        "Status",
                      ].map((heading) => (
                        <th
                          className="px-5 py-3 text-xs font-medium text-zinc-400"
                          key={heading}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {transactionsQuery.isLoading ? (
                      <TransactionsSkeleton />
                    ) : transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <TransactionRow
                          key={transaction.id}
                          transaction={transaction}
                        />
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-5 py-14 text-center text-sm text-zinc-400"
                          colSpan={10}
                        >
                          No transactions match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination ? (
                <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-zinc-400">
                    Page {pagination.page} of {pagination.totalPages || 1}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      disabled={!pagination.hasPreviousPage || transactionsQuery.isFetching}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      size="sm"
                      variant="outline"
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </Button>

                    <Button
                      disabled={!pagination.hasNextPage || transactionsQuery.isFetching}
                      onClick={() => setPage((current) => current + 1)}
                      size="sm"
                      variant="outline"
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function TransactionRow({ transaction }: { transaction: TransactionItem }) {
  return (
    <tr className="border-b border-white/5 transition hover:bg-white/3">
      <td className="px-5 py-4">
        <Badge
          className={
            transaction.type === "BUY"
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-red-500/15 text-red-300"
          }
        >
          {transaction.type}
        </Badge>
      </td>
      <td className="px-5 py-4 text-sm text-white">
        {transaction.coin?.name ?? "Asset"}
        <small className="block text-zinc-500">
          {transaction.coin?.symbol ?? "—"}
        </small>
      </td>
      <td className="px-5 py-4 text-sm text-white">
        {formatCryptoAmount(transaction.amount)}
      </td>
      <td className="px-5 py-4 text-sm text-white">
        {formatUsd(transaction.price)}
      </td>
      <td className="px-5 py-4 text-sm text-white">
        {formatUsd(transaction.fee)}
      </td>
      <td className="px-5 py-4 text-sm text-white">
        {formatUsd(transaction.grossTotal)}
      </td>
      <td className="px-5 py-4 text-sm text-white">
        {transaction.chargedUsd ? formatUsd(transaction.chargedUsd) : "—"}
      </td>
      <td className="px-5 py-4 text-sm text-white">
        {transaction.receivedUsd ? formatUsd(transaction.receivedUsd) : "—"}
      </td>
      <td className="px-5 py-4 text-sm text-zinc-300">
        {formatDate(transaction.createdAt)}
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={transaction.status} />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const className =
    status === "SUCCESS"
      ? "bg-emerald-500/15 text-emerald-300"
      : status === "FAILED"
        ? "bg-red-500/15 text-red-300"
        : "bg-amber-500/15 text-amber-300";

  return <Badge className={className}>{status}</Badge>;
}

function TransactionsSkeleton() {
  return Array.from({ length: 10 }).map((_, rowIndex) => (
    <tr className="border-b border-white/5" key={rowIndex}>
      {Array.from({ length: 10 }).map((__, cellIndex) => (
        <td className="px-5 py-5" key={cellIndex}>
          <div className="h-4 animate-pulse rounded bg-white/10" />
        </td>
      ))}
    </tr>
  ));
}

function TransactionsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-4 px-5 py-12 text-center">
      <h2 className="text-lg font-semibold text-white">
        Transactions could not be loaded
      </h2>
      <p className="text-sm text-zinc-400">{message}</p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}
