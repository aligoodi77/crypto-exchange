import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { TransactionItem } from "@/features/transactions/api";

import {
  formatCryptoAmount,
  formatDate,
  formatUsd,
} from "@/features/wallet/formatters";

type RecentTransactionsProps = {
  transactions: TransactionItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function RecentTransactions({
  transactions,
  isLoading,
  isError,
  onRetry,
}: RecentTransactionsProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="font-semibold text-white">Recent Activity</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your latest completed and pending transactions.
          </p>
        </div>

        <Button asChild size="sm" variant="outline">
          <Link href="/transactions">View All</Link>
        </Button>
      </div>

      {isLoading ? (
        <RecentTransactionsSkeleton />
      ) : isError ? (
        <div className="space-y-4 px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Could not load recent activity.
          </p>

          <Button onClick={onRetry} size="sm">
            Try Again
          </Button>
        </div>
      ) : transactions.length > 0 ? (
        <div className="divide-y divide-white/5">
          {transactions.map((transaction) => {
            const isBuy = transaction.type === "BUY";

            const transactionUsd =
              transaction.type === "BUY"
                ? transaction.chargedUsd
                : transaction.receivedUsd;

            return (
              <div
                className="flex items-center justify-between gap-4 px-5 py-4"
                key={transaction.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                      isBuy
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {isBuy ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {transaction.type} {transaction.coin?.symbol ?? "Asset"}
                    </p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {formatCryptoAmount(transaction.amount)}{" "}
                      {transaction.coin?.symbol ?? ""}
                      {" · "}
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-white">
                    {formatUsd(transactionUsd ?? transaction.grossTotal)}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      transaction.status === "SUCCESS"
                        ? "text-emerald-400"
                        : transaction.status === "FAILED"
                          ? "text-red-400"
                          : "text-amber-400"
                    }`}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        </div>
      )}
    </Card>
  );
}

function RecentTransactionsSkeleton() {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="flex items-center justify-between gap-4 px-5 py-4"
          key={index}
        >
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-white/10" />

            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-white/10" />
            <div className="ml-auto h-3 w-12 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
