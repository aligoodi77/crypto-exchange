import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import type { TransactionItem } from "@/features/transactions/api";
import {
  formatCryptoAmount,
  formatDate,
  formatUsd,
} from "@/features/wallet/formatters";

export function TradeHistory({
  transactions,
  isLoading,
}: {
  transactions: TransactionItem[];
  isLoading: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold">Your Recent Trades</h2>
        <Badge className="bg-violet-500/15 text-violet-200">Real</Badge>
      </div>
      <div className="grid grid-cols-3 pb-2 text-xs text-zinc-500">
        <span>Price</span>
        <span>Amount</span>
        <span>Time</span>
      </div>
      {isLoading ? (
        Array.from({ length: 8 }).map((_, index) => (
          <div className="grid grid-cols-3 gap-3 py-2" key={index}>
            {Array.from({ length: 3 }).map((__, cellIndex) => (
              <div className="h-4 animate-pulse rounded bg-white/10" key={cellIndex} />
            ))}
          </div>
        ))
      ) : transactions.length > 0 ? (
        transactions.map((transaction) => (
          <div className="grid grid-cols-3 py-1.5 text-sm" key={transaction.id}>
            <span
              className={
                transaction.type === "BUY" ? "text-emerald-400" : "text-red-400"
              }
            >
              {formatUsd(transaction.price)}
            </span>
            <span>{formatCryptoAmount(transaction.amount)}</span>
            <span className="truncate text-zinc-400">
              {formatDate(transaction.createdAt)}
            </span>
          </div>
        ))
      ) : (
        <p className="py-8 text-center text-sm text-zinc-400">
          No trades for this asset yet.
        </p>
      )}
    </Card>
  );
}
