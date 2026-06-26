"use client";

import Link from "next/link";
import { Download, Plus, Upload } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { isApiError } from "@/lib/api-error";

import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { useMyTransactions } from "@/features/transactions/hooks";

import {
  HoldingsTable,
  PortfolioAllocation,
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
    <AppShell title="My Wallet" subtitle="Manage your assets, track balances, and transact securely.">
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
            <section className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)_16rem]">
              <WalletBalanceCard wallet={wallet} />
              <PortfolioAllocation assets={wallet.assets} summary={wallet.summary} />
              <WalletChangeCard wallet={wallet} />
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Your Wallets</h2>
                <Button asChild size="sm" variant="outline">
                  <Link href="/markets">
                    <Plus className="size-4" />
                    Add Wallet
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4 overflow-x-auto pb-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {wallet.assets.slice(0, 5).map((asset) => (
                  <AssetWalletCard asset={asset} key={asset.id} />
                ))}
                <Card className="grid min-h-44 place-items-center border-dashed p-5 text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-full border border-white/20 text-zinc-300">
                      <Plus className="size-6" />
                    </span>
                    <p className="mt-3 font-semibold text-white">Add More</p>
                    <p className="mt-1 text-xs text-zinc-500">Add asset to your wallet</p>
                  </div>
                </Card>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
              <HoldingsTable assets={wallet.assets} />
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

function WalletBalanceCard({ wallet }: { wallet: Wallet }) {
  const positive = isPositive(wallet.summary.totalProfitLossPercent);

  return (
    <Card className="p-5">
      <p className="text-sm text-zinc-400">Total Wallet Balance</p>
      <p className="mt-5 text-4xl font-bold tracking-normal text-white">
        {formatUsd(wallet.summary.totalPortfolioValue)}
      </p>
      <p className={positive ? "mt-2 text-sm text-emerald-400" : "mt-2 text-sm text-red-400"}>
        {formatPercent(wallet.summary.totalProfitLossPercent)} (24h)
      </p>
      <div className="mt-7 grid grid-cols-2 gap-3">
        <Button asChild>
          <Link href="/profile">
            <Download className="size-4" />
            Deposit
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/profile">
            <Upload className="size-4" />
            Withdraw
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function WalletChangeCard({ wallet }: { wallet: Wallet }) {
  const positive = isPositive(wallet.summary.totalProfitLoss);

  return (
    <Card className="p-5">
      <p className="text-sm text-zinc-400">24h Change</p>
      <p className={positive ? "mt-2 text-xl font-semibold text-emerald-400" : "mt-2 text-xl font-semibold text-red-400"}>
        {formatUsd(wallet.summary.totalProfitLoss)}
      </p>
      <MiniSparkline positive={positive} />
      <p className="mt-6 text-sm text-zinc-400">All Time Profit</p>
      <p className={positive ? "mt-2 text-xl font-semibold text-emerald-400" : "mt-2 text-xl font-semibold text-red-400"}>
        {formatUsd(wallet.summary.totalProfitLoss)}
      </p>
    </Card>
  );
}

function AssetWalletCard({ asset }: { asset: WalletAsset }) {
  const positive = isPositive(asset.profitLossPercent);

  return (
    <Card className="min-h-44 p-5">
      <div className="flex items-center gap-3">
        {asset.coin.image ? (
          <img alt="" className="size-10 rounded-full" src={asset.coin.image} />
        ) : (
          <span className="grid size-10 place-items-center rounded-full bg-violet-500/20 font-semibold text-violet-100">
            {asset.coin.symbol.slice(0, 1)}
          </span>
        )}
        <div>
          <p className="font-semibold text-white">{asset.coin.name}</p>
          <p className="text-xs text-zinc-500">{asset.coin.symbol}</p>
        </div>
      </div>
      <p className="mt-5 text-xl font-semibold text-white">{formatUsd(asset.currentValue)}</p>
      <p className="mt-1 text-xs text-zinc-400">
        {formatCryptoAmount(asset.amount)} {asset.coin.symbol}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className={positive ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
          {formatPercent(asset.profitLossPercent)}
        </span>
        <MiniSparkline positive={positive} small />
      </div>
    </Card>
  );
}

function MiniSparkline({ positive, small = false }: { positive: boolean; small?: boolean }) {
  return (
    <svg className={small ? "h-8 w-20" : "mt-5 h-20 w-full"} viewBox="0 0 120 48" aria-hidden="true">
      <path
        d={positive ? "M2 38 C14 32 22 35 34 27 S58 12 72 21 92 30 118 8" : "M2 12 C18 24 28 16 39 25 S63 36 77 27 99 25 118 39"}
        fill="none"
        stroke={positive ? "#8b5cf6" : "#ef4444"}
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
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
      <h2 className="text-lg font-semibold text-white">Wallet could not be loaded</h2>
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
