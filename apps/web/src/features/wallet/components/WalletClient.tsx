"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";

import { isApiError } from "@/lib/api-error";

import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { useMyTransactions } from "@/features/transactions/hooks";

import {
  HoldingsTable,
  PortfolioAllocation,
  PortfolioSummaryCards,
} from "@/features/wallet/components/PortfolioWidgets";

import { useMyWallet } from "@/features/wallet/hooks";

import { useAuthStore } from "@/store/auth-store";

export function WalletClient() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const walletQuery = useMyWallet(token, user?.id ?? null);

  const recentTransactionsQuery = useMyTransactions(token, user?.id ?? null, {
    page: 1,
    limit: 5,
  });

  const wallet = walletQuery.data;

  return (
    <AppShell
      subtitle="Manage your available cash, holdings, and portfolio performance."
      title="Wallet"
    >
      <div className="space-y-6">
        {walletQuery.isPending ? (
          <WalletSkeleton />
        ) : walletQuery.isError ? (
          <WalletError
            message={
              isApiError(walletQuery.error)
                ? walletQuery.error.message
                : "Could not load your wallet. Check whether the API server is running."
            }
            onRetry={() => {
              void walletQuery.refetch();
            }}
          />
        ) : wallet ? (
          <>
            <PortfolioSummaryCards summary={wallet.summary} />

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <HoldingsTable assets={wallet.assets} />

              <PortfolioAllocation
                assets={wallet.assets}
                summary={wallet.summary}
              />
            </section>

            <RecentTransactions
              isError={recentTransactionsQuery.isError}
              isLoading={recentTransactionsQuery.isPending}
              onRetry={() => {
                void recentTransactionsQuery.refetch();
              }}
              transactions={recentTransactionsQuery.data?.items ?? []}
            />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

function WalletError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="space-y-4 p-6 text-center">
      <h2 className="text-lg font-semibold text-white">
        Wallet could not be loaded
      </h2>

      <p className="text-sm text-muted-foreground">{message}</p>

      <button
        className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-400"
        onClick={onRetry}
        type="button"
      >
        Try Again
      </button>
    </Card>
  );
}

function WalletSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card className="space-y-3 p-5" key={index}>
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="h-7 w-36 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
          </Card>
        ))}
      </section>

      <Card className="h-96 animate-pulse bg-white/3" />
    </div>
  );
}
