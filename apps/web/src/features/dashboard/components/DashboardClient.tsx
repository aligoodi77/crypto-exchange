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
import { AlertTriangle, CheckCircle2, MoreHorizontal, Plus, WalletCards } from "lucide-react";

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
      subtitle="We're here to ensure your digital assets are protected and your experience is exceptional."
      title={`Welcome to CoinBarrier${user?.name ? `, ${user.name.split(" ")[0]}` : ""}!`}
    >
      <div className="space-y-6">
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

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="space-y-6">
                <ResourceSection assets={wallet.assets} />

                {wallet.assets.length > 0 ? (
                  <InvestmentTable assets={wallet.assets} />
                ) : (
                  <EmptyDashboardState />
                )}

                <PortfolioSummaryCards summary={wallet.summary} />

                <section className="grid gap-6 lg:grid-cols-2">
                  <PortfolioPerformanceChart wallet={wallet} />
                  <RecentTransactions
                    isError={recentTransactionsQuery.isError}
                    isLoading={recentTransactionsQuery.isPending}
                    onRetry={() => {
                      void recentTransactionsQuery.refetch();
                    }}
                    transactions={recentTransactionsQuery.data?.items ?? []}
                  />
                </section>
              </div>

              <div className="space-y-6">
                <LiquidStakingPanel />
                <DashboardWalletPanel wallet={wallet} />
                <PortfolioAllocation
                  assets={wallet.assets}
                  summary={wallet.summary}
                />
                <NewListingsPanel />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

function ResourceSection({ assets }: { assets: WalletAsset[] }) {
  const featured = assets.slice(0, 3);
  const fallback: WalletAsset[] = assets.length ? featured : [];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-violet-300">Suggested currencies for the next 24 hours</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Principal Resources</h2>
        </div>
        <div className="flex gap-2">
          <span className="rounded-xl border border-white/10 bg-white/[.055] px-4 py-2 text-sm text-white">24h</span>
          <span className="rounded-xl border border-white/10 bg-white/[.055] px-4 py-2 text-sm text-white">Desc</span>
        </div>
      </div>

      {fallback.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {fallback.map((asset) => (
            <ResourceCard asset={asset} key={asset.id} />
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <p className="text-sm text-zinc-400">Buy your first asset to populate recommendations.</p>
        </Card>
      )}
    </section>
  );
}

function ResourceCard({ asset }: { asset: WalletAsset }) {
  const positive = isPositive(asset.coin.change24h);

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-center gap-3">
        {asset.coin.image ? (
          <img alt="" className="size-11 rounded-full bg-white/10" src={asset.coin.image} />
        ) : (
          <span className="grid size-11 place-items-center rounded-full bg-violet-500/20 font-semibold text-violet-100">
            {asset.coin.symbol.slice(0, 1)}
          </span>
        )}
        <div>
          <h3 className="font-semibold text-white">{asset.coin.name}</h3>
          <p className="text-xs text-zinc-500">{asset.coin.symbol}</p>
        </div>
      </div>
      <p className="mt-6 text-xs text-zinc-500">Reward Rate</p>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-2xl font-bold text-white">
          {Math.max(1.2, Math.abs(Number(asset.profitLossPercent)) + 4).toFixed(2)}%
        </span>
        <span className={positive ? "text-xs text-emerald-400" : "text-xs text-red-400"}>
          {formatPercent(asset.coin.change24h)}
        </span>
      </div>
      <MiniSparkline positive={positive} />
    </Card>
  );
}

function InvestmentTable({ assets }: { assets: WalletAsset[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold text-white">Investment Crypto</h2>
          <span className="text-xs text-violet-200">Last Update 45 minutes ago</span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/markets">View All</Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-170 text-left">
          <tbody>
            {assets.slice(0, 5).map((asset, index) => {
              const positive = isPositive(asset.profitLossPercent);
              return (
                <tr className="border-b border-white/5" key={asset.id}>
                  <td className="px-5 py-4 text-sm text-zinc-400">{index + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {asset.coin.image ? <img alt="" className="size-10 rounded-full" src={asset.coin.image} /> : null}
                      <div>
                        <p className="font-medium text-white">{asset.coin.name}</p>
                        <p className="text-xs text-zinc-500">{asset.coin.symbol} | {formatPercent(asset.profitLossPercent)} APY</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-white">{formatUsd(asset.currentPrice)}</td>
                  <td className="px-5 py-4"><MiniSparkline positive={positive} compact /></td>
                  <td className={positive ? "px-5 py-4 text-sm text-emerald-400" : "px-5 py-4 text-sm text-red-400"}>
                    {formatPercent(asset.profitLossPercent)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-white">{formatUsd(asset.currentValue)}</td>
                  <td className="px-5 py-4 text-right">
                    <MoreHorizontal className="ml-auto size-5 text-zinc-500" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function LiquidStakingPanel() {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-white">Liquid Staking Portfolio</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        An all-in-one tool called Liquid Staking Portfolio lets you optimize and manage your liquid staking investments.
      </p>
      <div className="mt-5 grid gap-3">
        <Button asChild>
          <Link href="/wallet">
            Connect Wallet
            <WalletCards className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/wallet">Connect Wallet</Link>
        </Button>
      </div>
    </Card>
  );
}

function DashboardWalletPanel({ wallet }: { wallet: Wallet }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Wallet</h2>
        <Button asChild size="sm" variant="outline">
          <Link href="/wallet">
            New Wallet
            <Plus className="size-4" />
          </Link>
        </Button>
      </div>
      <p className="mt-8 text-xs text-zinc-500">My Balance</p>
      <p className="mt-1 text-3xl font-bold text-white">{formatUsd(wallet.summary.totalPortfolioValue)}</p>
      <div className="mt-6 space-y-3">
        {wallet.assets.slice(0, 4).map((asset) => (
          <div className="flex items-center justify-between gap-3" key={asset.id}>
            <div className="flex items-center gap-2">
              {asset.coin.image ? <img alt="" className="size-7 rounded-full" src={asset.coin.image} /> : null}
              <span className="text-sm text-white">{asset.coin.symbol}</span>
            </div>
            <span className={isPositive(asset.profitLossPercent) ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
              {formatPercent(asset.profitLossPercent)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NewListingsPanel() {
  const listings = [
    ["BB", "BounceBit", "$0.022322", "+5.80%"],
    ["REZ", "Renzo", "$0.0229128", "+9.99%"],
    ["XRP", "Ripple", "$0.1719259", "-2.20%"],
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">New Listing</h2>
        <Button asChild size="sm" variant="outline"><Link href="/markets">See All</Link></Button>
      </div>
      <div className="mt-5 space-y-4">
        {listings.map(([symbol, name, price, change]) => (
          <div className="flex items-center justify-between gap-3" key={symbol}>
            <div>
              <p className="font-medium text-white">{symbol}</p>
              <p className="text-xs text-zinc-500">{name}</p>
            </div>
            <p className="text-sm text-white">{price}</p>
            <p className={change.startsWith("+") ? "text-sm text-emerald-400" : "text-sm text-red-400"}>{change}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MiniSparkline({ positive, compact = false }: { positive: boolean; compact?: boolean }) {
  return (
    <div className={compact ? "h-8 w-28" : "mt-4 h-16 w-full"}>
      <svg className="h-full w-full" viewBox="0 0 120 44" role="img" aria-label="Sparkline">
        <path
          d={positive ? "M2 31 C15 12 23 35 36 24 S59 8 72 17 91 30 118 6" : "M2 10 C18 25 28 13 39 20 S62 33 76 23 101 19 118 40"}
          fill="none"
          stroke={positive ? "#8b5cf6" : "#ef4444"}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    </div>
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
