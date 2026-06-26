"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { isApiError } from "@/lib/api-error";

import {
  AdminStateCard,
  AdminTableSkeleton,
  StatusBadge,
} from "@/features/admin/components/AdminShared";
import { useAdminTransactions } from "@/features/admin/hooks";
import {
  formatCryptoAmount,
  formatDate,
  formatUsd,
} from "@/features/wallet/formatters";

import { useAuthStore } from "@/store/auth-store";

type TypeFilter = "ALL" | "BUY" | "SELL";

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<TypeFilter>("ALL");
  const token = useAuthStore((state) => state.token);
  const transactionsQuery = useAdminTransactions(token, {
    page,
    limit: 10,
    type: type === "ALL" ? undefined : type,
  });

  return (
    <AppShell admin title="Transactions" subtitle="Monitor exchange-wide trade activity.">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-white">Transaction Monitoring</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {transactionsQuery.data?.pagination.total.toLocaleString() ?? "—"} transactions
            </p>
          </div>
          <div className="flex gap-2">
            {(["ALL", "BUY", "SELL"] as const).map((filter) => (
              <Button
                key={filter}
                onClick={() => {
                  setType(filter);
                  setPage(1);
                }}
                size="sm"
                variant={type === filter ? "default" : "outline"}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {transactionsQuery.isError ? (
          <AdminStateCard
            title="Transactions could not be loaded"
            message={
              isApiError(transactionsQuery.error)
                ? transactionsQuery.error.message
                : "Please try again."
            }
            onRetry={() => {
              void transactionsQuery.refetch();
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-260 text-left">
                <thead className="border-b border-white/10 bg-white/2">
                  <tr>
                    {["User", "Asset", "Type", "Amount", "Price", "Gross", "Fee", "Status", "Date"].map((heading) => (
                      <th className="px-5 py-3 text-xs font-medium text-zinc-400" key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactionsQuery.isLoading ? (
                    <AdminTableSkeleton columns={9} />
                  ) : transactionsQuery.data?.items.length ? (
                    transactionsQuery.data.items.map((transaction) => (
                      <tr className="border-b border-white/5" key={transaction.id}>
                        <td className="px-5 py-4 text-sm text-white">
                          {transaction.user.name}
                          <small className="block text-zinc-500">{transaction.user.email}</small>
                        </td>
                        <td className="px-5 py-4 text-sm text-white">{transaction.coin?.symbol ?? "—"}</td>
                        <td className="px-5 py-4 text-sm text-white">{transaction.type}</td>
                        <td className="px-5 py-4 text-sm text-white">{formatCryptoAmount(transaction.amount)}</td>
                        <td className="px-5 py-4 text-sm text-white">{formatUsd(transaction.price)}</td>
                        <td className="px-5 py-4 text-sm text-white">{formatUsd(transaction.grossTotal)}</td>
                        <td className="px-5 py-4 text-sm text-white">{formatUsd(transaction.fee)}</td>
                        <td className="px-5 py-4"><StatusBadge status={transaction.status} /></td>
                        <td className="px-5 py-4 text-sm text-zinc-300">{formatDate(transaction.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-14 text-center text-sm text-zinc-400" colSpan={9}>
                        No transactions match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {transactionsQuery.data?.pagination ? (
              <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
                <p className="text-sm text-zinc-400">
                  Page {transactionsQuery.data.pagination.page} of {transactionsQuery.data.pagination.totalPages || 1}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={!transactionsQuery.data.pagination.hasPreviousPage || transactionsQuery.isFetching}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    size="sm"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={!transactionsQuery.data.pagination.hasNextPage || transactionsQuery.isFetching}
                    onClick={() => setPage((current) => current + 1)}
                    size="sm"
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </Card>
    </AppShell>
  );
}
