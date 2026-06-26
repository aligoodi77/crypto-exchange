"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";

import { formatPercent, isPositive } from "@/features/markets/formatters";
import { useMarkets } from "@/features/markets/hooks";
import type { MarketCoin } from "@/features/markets/types";

export function Watchlist({ title = "Top Gainers" }: { title?: string }) {
  const marketsQuery = useMarkets({
    page: 1,
    limit: 5,
    sortBy: "change24h",
    sortOrder: "desc",
  });
  const coins = marketsQuery.data?.data ?? [];

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link className="text-xs text-zinc-400" href="/markets">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {marketsQuery.isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div className="h-10 animate-pulse rounded bg-white/10" key={index} />
          ))
        ) : coins.length ? (
          coins.map((coin) => <WatchlistRow coin={coin} key={coin.id} />)
        ) : (
          <p className="text-sm text-zinc-400">No assets to show.</p>
        )}
      </div>
    </Card>
  );
}

function WatchlistRow({ coin }: { coin: MarketCoin }) {
  const positive = isPositive(coin.change24h);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
      <span className="flex items-center gap-3">
        {coin.image ? (
          <img
            alt={`${coin.name} logo`}
            className="size-9 rounded-full bg-white/10"
            src={coin.image}
          />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-100">
            {coin.symbol.slice(0, 1)}
          </span>
        )}
        <span>
          {coin.name}
          <small className="block text-zinc-500">{coin.symbol}</small>
        </span>
      </span>
      <span className={positive ? "text-emerald-400" : "text-red-400"}>
        {formatPercent(coin.change24h)}
      </span>
    </div>
  );
}
