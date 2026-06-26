"use client";

import { Star } from "lucide-react";
import { useParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { BuySellForm } from "@/components/trade/BuySellForm";
import { OrderBook } from "@/components/trade/OrderBook";
import { TradeHistory } from "@/components/trade/TradeHistory";
import { TradingChart } from "@/components/trade/TradingChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { isApiError } from "@/lib/api-error";

import {
  formatCompactUsd,
  formatPercent,
  formatUsd,
  isPositive,
} from "@/features/markets/formatters";
import { useMarkets } from "@/features/markets/hooks";
import type { MarketCoin } from "@/features/markets/types";

import {
  formatCryptoAmount,
} from "@/features/wallet/formatters";
import { useMyWallet } from "@/features/wallet/hooks";

import { useAuthStore } from "@/store/auth-store";

function normalizeSymbol(value: string) {
  return value
    .toUpperCase()
    .replace(/-USDT$/, "")
    .replace(/USDT$/, "");
}

export default function TradePage() {
  const params = useParams<{ symbol: string }>();
  const routeSymbol = normalizeSymbol(params.symbol ?? "btc");

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const marketsQuery = useMarkets({
    search: routeSymbol,
    limit: 20,
    sortBy: "marketCap",
    sortOrder: "desc",
  });
  const walletQuery = useMyWallet(token, user?.id ?? null);

  const coin =
    marketsQuery.data?.data.find(
      (marketCoin) => marketCoin.symbol.toUpperCase() === routeSymbol,
    ) ?? null;

  return (
    <AppShell title="Trade" subtitle="Spot market buy and sell">
      <div className="space-y-5">
        {marketsQuery.isLoading ? (
          <TradeHeaderSkeleton />
        ) : marketsQuery.isError ? (
          <TradeError
            message={
              isApiError(marketsQuery.error)
                ? marketsQuery.error.message
                : "Could not load selected coin."
            }
            onRetry={() => {
              void marketsQuery.refetch();
            }}
          />
        ) : coin ? (
          <>
            <TradeHeader coin={coin} />

            <div className="grid gap-5 xl:grid-cols-[1.4fr_320px_320px]">
              <TradingChart />
              <OrderBook />
              <TradeHistory />
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <BuySellForm coin={coin} wallet={walletQuery.data ?? null} />

              <AssetSummary
                coin={coin}
                cryptoAmount={
                  walletQuery.data?.assets.find(
                    (asset) => asset.coin.symbol === coin.symbol,
                  )?.amount ?? "0"
                }
                isLoading={walletQuery.isPending}
              />
            </div>
          </>
        ) : (
          <TradeError
            message={`${routeSymbol} is not available for trading.`}
            onRetry={() => {
              void marketsQuery.refetch();
            }}
          />
        )}
      </div>
    </AppShell>
  );
}

function TradeHeader({ coin }: { coin: MarketCoin }) {
  const positive = isPositive(coin.change24h);

  return (
    <Card className="grid gap-4 p-4 md:grid-cols-[1fr_repeat(5,auto)] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        {coin.image ? (
          <img
            alt={`${coin.name} logo`}
            className="size-10 rounded-full bg-white/10"
            height={40}
            src={coin.image}
            width={40}
          />
        ) : (
          <div className="grid size-10 place-items-center rounded-full bg-violet-500/20 font-semibold text-violet-100">
            {coin.symbol.slice(0, 1)}
          </div>
        )}

        <div className="min-w-0">
          <h2 className="truncate font-semibold">{coin.symbol}/USD</h2>
          <p className="truncate text-xs text-zinc-500">{coin.name}</p>
        </div>
      </div>

      <div className={positive ? "text-2xl font-bold text-emerald-400" : "text-2xl font-bold text-red-400"}>
        {formatUsd(coin.price)}
      </div>

      <div className={positive ? "text-sm text-emerald-400" : "text-sm text-red-400"}>
        24h {formatPercent(coin.change24h)}
      </div>

      <div className="text-sm text-zinc-400">
        Market cap {formatCompactUsd(coin.marketCap)}
      </div>

      <div className="text-sm text-zinc-400">
        Volume {formatCompactUsd(coin.volume24h)}
      </div>

      <div className="text-sm text-zinc-400">
        Updated {new Date(coin.updatedAt).toLocaleTimeString()}
      </div>

      <Star className="size-5 text-zinc-400" />
    </Card>
  );
}

function AssetSummary({
  coin,
  cryptoAmount,
  isLoading,
}: {
  coin: MarketCoin;
  cryptoAmount: string;
  isLoading: boolean;
}) {
  const amount = Number(cryptoAmount);
  const value = amount * Number(coin.price);

  return (
    <Card className="p-5">
      <h2 className="font-semibold">Asset Summary</h2>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          <div className="h-8 w-36 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        </div>
      ) : (
        <>
          <div className="mt-6 text-3xl font-bold">{formatUsd(value)}</div>
          <p className="mt-2 text-sm text-zinc-400">
            {formatCryptoAmount(cryptoAmount)} {coin.symbol} available
          </p>
          <p
            className={
              isPositive(coin.change24h)
                ? "mt-2 text-emerald-400"
                : "mt-2 text-red-400"
            }
          >
            {formatPercent(coin.change24h)} today
          </p>
        </>
      )}
    </Card>
  );
}

function TradeHeaderSkeleton() {
  return (
    <Card className="grid gap-4 p-4 md:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="h-10 animate-pulse rounded bg-white/10" key={index} />
      ))}
    </Card>
  );
}

function TradeError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="space-y-4 p-6 text-center">
      <h2 className="text-lg font-semibold text-white">Trade page unavailable</h2>
      <p className="text-sm text-zinc-400">{message}</p>
      <Button onClick={onRetry}>Try Again</Button>
    </Card>
  );
}
