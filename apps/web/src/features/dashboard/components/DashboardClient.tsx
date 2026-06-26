"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

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

import {
  formatCryptoAmount,
  formatPercent,
  formatUsd,
  isPositive,
} from "@/features/wallet/formatters";
import { useMyWallet } from "@/features/wallet/hooks";
import type { Wallet, WalletAsset } from "@/features/wallet/types";

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

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/trade/btc">Buy BTC</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/markets">Explore Markets</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/wallet">View Wallet</Link>
            </Button>
          </div>
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
            <AccountState
              emailVerified={Boolean(user?.emailVerified)}
              email={user?.email ?? ""}
            />

            <PortfolioSummaryCards summary={wallet.summary} />

            {wallet.assets.length > 0 ? (
              <>
                <PortfolioInsights wallet={wallet} />

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                  <PortfolioPerformanceChart wallet={wallet} />

                  <PortfolioAllocation
                    assets={wallet.assets}
                    summary={wallet.summary}
                  />
                </section>
              </>
            ) : (
              <EmptyDashboardState />
            )}

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
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

function AccountState({
  emailVerified,
  email,
}: {
  emailVerified: boolean;
  email: string;
}) {
  return (
    <section
      className={
        emailVerified
          ? "flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4"
          : "flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4"
      }
    >
      {emailVerified ? (
        <CheckCircle2 className="size-5 shrink-0 text-emerald-300" />
      ) : (
        <AlertTriangle className="size-5 shrink-0 text-amber-300" />
      )}
      <div>
        <p className="text-sm font-medium text-white">
          {emailVerified ? "Account verified" : "Email verification required"}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          {emailVerified
            ? `${email} is enabled for trading.`
            : "Trading stays disabled until you verify your email address."}
        </p>
      </div>
    </section>
  );
}

function PortfolioInsights({ wallet }: { wallet: Wallet }) {
  const rankedByProfit = [...wallet.assets].sort(
    (firstAsset, secondAsset) =>
      Number(secondAsset.profitLossPercent) - Number(firstAsset.profitLossPercent),
  );
  const topGainer = rankedByProfit[0];
  const topLoser = rankedByProfit.at(-1);
  const estimated24hProfitLoss = wallet.assets.reduce((total, asset) => {
    const previousValue =
      Number(asset.currentValue) / (1 + Number(asset.coin.change24h) / 100);

    return total + (Number(asset.currentValue) - previousValue);
  }, 0);
  const estimated24hPercent =
    Number(wallet.summary.totalAssetValue) > 0
      ? (estimated24hProfitLoss / Number(wallet.summary.totalAssetValue)) * 100
      : 0;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <InsightCard
        label="24h P/L"
        positive={estimated24hProfitLoss >= 0}
        value={formatUsd(estimated24hProfitLoss)}
        detail={formatPercent(estimated24hPercent)}
      />
      <AssetInsightCard asset={topGainer} label="Top Gainer" />
      <AssetInsightCard asset={topLoser} label="Top Loser" />
    </section>
  );
}

function InsightCard({
  label,
  value,
  detail,
  positive,
}: {
  label: string;
  value: string;
  detail: string;
  positive: boolean;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p
        className={
          positive
            ? "mt-2 text-xl font-semibold text-emerald-400"
            : "mt-2 text-xl font-semibold text-red-400"
        }
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-500">{detail}</p>
    </Card>
  );
}

function AssetInsightCard({
  asset,
  label,
}: {
  asset: WalletAsset | undefined;
  label: string;
}) {
  const positive = asset ? isPositive(asset.profitLossPercent) : true;

  return (
    <Card className="p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      {asset ? (
        <>
          <p className="mt-2 text-xl font-semibold text-white">
            {asset.coin.symbol}
          </p>
          <p
            className={
              positive ? "mt-2 text-xs text-emerald-400" : "mt-2 text-xs text-red-400"
            }
          >
            {formatPercent(asset.profitLossPercent)} ·{" "}
            {formatCryptoAmount(asset.amount)} {asset.coin.symbol}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">No holdings yet</p>
      )}
    </Card>
  );
}

function PortfolioPerformanceChart({ wallet }: { wallet: Wallet }) {
  const data = useMemo(() => {
    const currentValue = Number(wallet.summary.totalPortfolioValue);
    const profitLoss = Number(wallet.summary.totalProfitLoss);
    const startValue = Math.max(0, currentValue - profitLoss);

    return Array.from({ length: 8 }).map((_, index) => {
      const progress = index / 7;
      const wave = Math.sin(index * 1.2) * currentValue * 0.006;

      return {
        label: index === 7 ? "Today" : `D-${7 - index}`,
        value: Math.max(0, startValue + (currentValue - startValue) * progress + wave),
      };
    });
  }, [wallet.summary.totalPortfolioValue, wallet.summary.totalProfitLoss]);

  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Portfolio Value</h2>
          <p className="mt-1 text-sm text-zinc-400">7D indicative performance</p>
        </div>
        <span className="text-sm font-medium text-white">
          {formatUsd(wallet.summary.totalPortfolioValue)}
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,.06)" />
            <XAxis dataKey="label" fontSize={12} stroke="#71717a" />
            <YAxis
              fontSize={12}
              orientation="right"
              stroke="#71717a"
              tickFormatter={(value: number) =>
                Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 2,
                }).format(value)
              }
            />
            <Tooltip
              contentStyle={{
                background: "#111217",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 12,
              }}
              formatter={(value) => [formatUsd(Number(value)), "Value"]}
            />
            <Area
              dataKey="value"
              fill="rgba(16,185,129,.14)"
              stroke="#10b981"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function EmptyDashboardState() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-white">
        Build your first position
      </h2>
      <p className="mt-2 max-w-xl text-sm text-zinc-400">
        Your account has cash available but no crypto holdings yet. Start with a
        small demo trade, then this dashboard will show allocation, P/L, movers,
        and performance.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/trade/btc">Buy BTC</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/markets">Browse Markets</Link>
        </Button>
      </div>
    </Card>
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
