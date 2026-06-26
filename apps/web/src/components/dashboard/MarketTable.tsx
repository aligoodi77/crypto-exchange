"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/dashboard/Sparkline";

import {
  formatCompactUsd,
  formatPercent,
  formatUsd,
  isPositive,
} from "@/features/markets/formatters";
import { useMarkets } from "@/features/markets/hooks";
import type { MarketCoin } from "@/features/markets/types";

export function MarketTable({ compact = false }: { compact?: boolean }) {
  const marketsQuery = useMarkets({
    page: 1,
    limit: compact ? 5 : 8,
    sortBy: "marketCap",
    sortOrder: "desc",
  });
  const coins = marketsQuery.data?.data ?? [];

  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["All", "Trending", "Layer 1", "DeFi"].map((tab, index) => (
            <button
              key={tab}
              className={
                index === 0
                  ? "rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold"
                  : "rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300"
              }
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <Button asChild size="sm" variant="outline">
          <Link href="/markets">View All</Link>
        </Button>
      </div>

      <div className="hidden min-w-full text-sm md:block">
        <div className="grid grid-cols-[52px_1.4fr_1fr_1fr_1fr_1fr_1fr_40px] border-b border-white/8 px-3 py-3 text-xs text-zinc-500">
          <span>#</span>
          <span>Asset</span>
          <span>Price</span>
          <span>24h %</span>
          <span>Market Cap</span>
          <span>Volume</span>
          <span>Last 7 Days</span>
          <span />
        </div>

        {marketsQuery.isLoading ? (
          <MarketRowsSkeleton rows={compact ? 5 : 8} />
        ) : coins.length ? (
          coins.map((coin, index) => (
            <MarketRow coin={coin} index={index} key={coin.id} />
          ))
        ) : (
          <div className="px-3 py-10 text-center text-sm text-zinc-400">
            No market data available.
          </div>
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {marketsQuery.isLoading ? (
          <MarketRowsSkeleton rows={5} mobile />
        ) : coins.length ? (
          coins.map((coin) => {
            const positive = isPositive(coin.change24h);

            return (
              <div
                key={coin.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-white/8 pb-3"
              >
                <span className="flex items-center gap-3">
                  <CoinAvatar coin={coin} />
                  <span>
                    {coin.name}
                    <small className="block text-zinc-500">{coin.symbol}</small>
                  </span>
                </span>
                <span className="text-sm">{formatUsd(coin.price)}</span>
                <span
                  className={
                    positive
                      ? "text-sm text-emerald-400"
                      : "text-sm text-red-400"
                  }
                >
                  {formatPercent(coin.change24h)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-zinc-400">No market data available.</p>
        )}
      </div>
    </Card>
  );
}

function MarketRow({ coin, index }: { coin: MarketCoin; index: number }) {
  const positive = isPositive(coin.change24h);

  return (
    <div className="grid grid-cols-[52px_1.4fr_1fr_1fr_1fr_1fr_1fr_40px] items-center border-b border-white/6 px-3 py-3 last:border-0">
      <span className="text-zinc-400">{index + 1}</span>
      <span className="flex items-center gap-3">
        <CoinAvatar coin={coin} />
        <span>
          {coin.name}
          <small className="block text-zinc-500">{coin.symbol}</small>
        </span>
      </span>
      <span>{formatUsd(coin.price)}</span>
      <span className={positive ? "text-emerald-400" : "text-red-400"}>
        {formatPercent(coin.change24h)}
      </span>
      <span>{formatCompactUsd(coin.marketCap)}</span>
      <span>{formatCompactUsd(coin.volume24h)}</span>
      <Sparkline red={!positive} />
      <Star className="size-5 text-yellow-400" />
    </div>
  );
}

function CoinAvatar({ coin }: { coin: MarketCoin }) {
  if (coin.image) {
    return (
      <img
        alt={`${coin.name} logo`}
        className="size-9 shrink-0 rounded-full bg-white/10"
        src={coin.image}
      />
    );
  }

  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-100">
      {coin.symbol.slice(0, 1)}
    </span>
  );
}

function MarketRowsSkeleton({
  rows,
  mobile = false,
}: {
  rows: number;
  mobile?: boolean;
}) {
  return Array.from({ length: rows }).map((_, index) =>
    mobile ? (
      <div className="h-12 animate-pulse rounded bg-white/10" key={index} />
    ) : (
      <div
        className="grid grid-cols-[52px_1.4fr_1fr_1fr_1fr_1fr_1fr_40px] gap-4 border-b border-white/6 px-3 py-4"
        key={index}
      >
        {Array.from({ length: 8 }).map((__, cellIndex) => (
          <div className="h-4 rounded bg-white/10" key={cellIndex} />
        ))}
      </div>
    ),
  );
}
