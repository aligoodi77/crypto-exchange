"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";

import { isApiError } from "@/lib/api-error";

import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { useMyTransactions } from "@/features/transactions/hooks";

import {
  PortfolioAllocation,
  PortfolioSummaryCards,
} from "@/features/wallet/components/PortfolioWidgets";

import { useMyWallet } from "@/features/wallet/hooks";

import { useAuthStore } from "@/store/auth-store";

export function DashboardClient() {
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
      subtitle="A real-time overview of your simulated crypto portfolio."
      title="Dashboard"
    >
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>

            <h2 className="mt-1 text-2xl font-semibold text-white">
              {user?.name ?? "Trader"}
            </h2>
          </div>

          <Button asChild>
            <Link href="/markets">Browse Markets</Link>
          </Button>
        </section>

        {walletQuery.isPending ? (
          <DashboardSkeleton />
        ) : walletQuery.isError ? (
          <DashboardError
            message={
              isApiError(walletQuery.error)
                ? walletQuery.error.message
                : "Could not load your wallet. Please verify that the API is running."
            }
            onRetry={() => {
              void walletQuery.refetch();
            }}
          />
        ) : wallet ? (
          <>
            <PortfolioSummaryCards summary={wallet.summary} />

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <PortfolioAllocation
                assets={wallet.assets}
                summary={wallet.summary}
              />

              <RecentTransactions
                isError={recentTransactionsQuery.isError}
                isLoading={recentTransactionsQuery.isPending}
                onRetry={() => {
                  void recentTransactionsQuery.refetch();
                }}
                transactions={recentTransactionsQuery.data?.items ?? []}
              />
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="space-y-4 p-6 text-center">
      <h2 className="text-lg font-semibold text-white">
        Dashboard could not be loaded
      </h2>

      <p className="text-sm text-muted-foreground">{message}</p>

      <div>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
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

      <section className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card className="h-72 animate-pulse bg-white/3" key={index} />
        ))}
      </section>
    </div>
  );
}
