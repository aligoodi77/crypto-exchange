"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { isApiError } from "@/lib/api-error";

import {
  formatCompactUsd,
  formatPercent,
  formatUsd,
  isPositive,
} from "@/features/markets/formatters";
import { useMarkets } from "@/features/markets/hooks";
import { MarketsTable } from "@/features/markets/components/MarketsTable";
import type {
  MarketCoin,
  MarketSortBy,
  MarketSortOrder,
} from "@/features/markets/types";

const PAGE_SIZE = 10;

const sortOptions: Array<{ label: string; value: MarketSortBy }> = [
  { label: "Market Cap", value: "marketCap" },
  { label: "Price", value: "price" },
  { label: "24h Change", value: "change24h" },
  { label: "24h Volume", value: "volume24h" },
  { label: "Name", value: "name" },
];

export function MarketsClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<MarketSortBy>("marketCap");
  const [sortOrder, setSortOrder] = useState<MarketSortOrder>("desc");

  const marketsQuery = useMarkets({
    page,
    limit: PAGE_SIZE,
    search,
    sortBy,
    sortOrder,
  });

  const coins = marketsQuery.data?.data ?? [];
  const pagination = marketsQuery.data?.pagination;

  const movers = useMemo(
    () =>
      [...coins]
        .sort((firstCoin, secondCoin) => Number(secondCoin.change24h) - Number(firstCoin.change24h))
        .slice(0, 5),
    [coins],
  );
  const losers = useMemo(
    () =>
      [...coins]
        .sort((firstCoin, secondCoin) => Number(firstCoin.change24h) - Number(secondCoin.change24h))
        .slice(0, 5),
    [coins],
  );

  const topCoin = coins[0];
  const strongestMover = movers[0];

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSortChange(nextSortBy: MarketSortBy) {
    if (nextSortBy === sortBy) {
      setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSortBy);
      setSortOrder(nextSortBy === "name" ? "asc" : "desc");
    }
    setPage(1);
  }

  return (
    <AppShell title="Markets" subtitle="Explore the crypto markets and spot opportunities.">
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid gap-4 md:grid-cols-4">
            <MarketOverviewCard
              className="md:col-span-2"
              detail="+2.38% (24h)"
              label="Market Overview"
              positive
              sparkline
              value={topCoin ? formatCompactUsd(topCoin.marketCap) : "$2.48T"}
            />
            <MarketOverviewCard
              bars
              detail="+8.72%"
              label="24h Trading Volume"
              positive
              value={topCoin ? formatCompactUsd(topCoin.volume24h) : "$89.37B"}
            />
            <MarketOverviewCard
              detail="-0.84%"
              label="BTC Dominance"
              positive={false}
              ring
              value="54.12%"
            />
          </div>
          <MarketMoversCard coins={movers} title="Top Gainers" />
        </section>

        <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-11 w-full rounded-xl border border-white/10 bg-white/4 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-muted-foreground focus:border-violet-400"
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search anything"
              value={search}
            />
            {search ? (
              <button
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-white"
                onClick={() => handleSearchChange("")}
                type="button"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="flex gap-3">
            <select
              className="h-11 rounded-xl border border-white/10 bg-white/4 px-3 text-sm text-white outline-none focus:border-violet-400"
              onChange={(event) => {
                setSortBy(event.target.value as MarketSortBy);
                setPage(1);
              }}
              value={sortBy}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
                setPage(1);
              }}
              variant="outline"
            >
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>
        </section>

        <MarketTabs />
        <CategoryChips />

        {marketsQuery.isError ? (
          <MarketsError
            error={marketsQuery.error}
            onRetry={() => {
              void marketsQuery.refetch();
            }}
          />
        ) : (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" variant="outline">
                  <SlidersHorizontal className="size-4" />
                  Customize
                </Button>
              </div>
              <MarketsTable
                coins={coins}
                isFetching={marketsQuery.isFetching}
                isLoading={marketsQuery.isLoading}
                onNextPage={() => setPage((currentPage) => currentPage + 1)}
                onPreviousPage={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                onSortChange={handleSortChange}
                pagination={pagination}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            </div>

            <div className="space-y-6">
              <MarketMoversCard coins={losers} title="Top Losers" />
              <MarketSummaryCard
                activeMarkets={pagination?.totalItems ?? 0}
                strongestMover={strongestMover}
                topCoin={topCoin}
              />
              <Card className="overflow-hidden p-5">
                <h2 className="font-semibold text-white">Explore New Opportunities</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Discover new listings and early gems before they trend.
                </p>
                <Button asChild className="mt-5" size="sm">
                  <a href="/markets">View New Listings</a>
                </Button>
              </Card>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function MarketOverviewCard({
  label,
  value,
  detail,
  positive,
  className,
  sparkline,
  bars,
  ring,
}: {
  label: string;
  value: string;
  detail: string;
  positive: boolean;
  className?: string;
  sparkline?: boolean;
  bars?: boolean;
  ring?: boolean;
}) {
  return (
    <Card className={`min-h-32 overflow-hidden p-5 ${className ?? ""}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold text-white">{value}</p>
      <p className={positive ? "mt-1 text-sm text-emerald-400" : "mt-1 text-sm text-red-400"}>
        {detail}
      </p>
      {sparkline ? <OverviewSparkline /> : null}
      {bars ? <OverviewBars /> : null}
      {ring ? <OverviewRing /> : null}
    </Card>
  );
}

function MarketTabs() {
  const tabs = ["All Markets", "Trending", "Top Gainers", "Top Losers", "New Listings"];
  return (
    <div className="flex gap-2 overflow-x-auto">
      {tabs.map((tab, index) => (
        <button
          className={
            index === 0
              ? "shrink-0 rounded-xl border border-violet-400/30 bg-violet-500 px-4 py-2 text-sm font-semibold text-white"
              : "shrink-0 rounded-xl border border-white/10 bg-white/[.035] px-4 py-2 text-sm text-zinc-300"
          }
          key={tab}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function CategoryChips() {
  const chips = ["All", "Trending", "Layer 1", "DeFi", "NFT", "Gaming", "AI", "Meme", "Storage", "More"];
  return (
    <div className="flex gap-2 overflow-x-auto">
      {chips.map((chip, index) => (
        <button
          className={
            index === 0
              ? "shrink-0 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white"
              : "shrink-0 rounded-xl border border-white/10 bg-white/[.035] px-4 py-2 text-sm text-zinc-300"
          }
          key={chip}
          type="button"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

function MarketMoversCard({ coins, title }: { coins: MarketCoin[]; title: string }) {
  return (
    <Card className="h-fit p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-white">{title}</h2>
        <button className="text-xs text-zinc-400" type="button">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {coins.length > 0 ? (
          coins.map((coin) => {
            const positiveChange = isPositive(coin.change24h);
            return (
              <div className="flex items-center justify-between gap-3" key={coin.id}>
                <div className="flex min-w-0 items-center gap-3">
                  {coin.image ? <img alt="" className="size-8 rounded-full" src={coin.image} /> : null}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{coin.name}</p>
                    <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm text-white">{formatUsd(coin.price)}</p>
                  <p className={positiveChange ? "text-xs text-emerald-400" : "text-xs text-red-400"}>
                    {formatPercent(coin.change24h)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No market data to display.</p>
        )}
      </div>
    </Card>
  );
}

function MarketSummaryCard({
  activeMarkets,
  strongestMover,
  topCoin,
}: {
  activeMarkets: number;
  strongestMover?: MarketCoin;
  topCoin?: MarketCoin;
}) {
  return (
    <Card className="p-5">
      <h2 className="font-semibold text-white">Market Summary</h2>
      <div className="mt-5 space-y-3 text-sm">
        <SummaryRow label="Total Cryptocurrencies" value={activeMarkets.toLocaleString()} />
        <SummaryRow label="Total Market Cap" value={topCoin ? formatCompactUsd(topCoin.marketCap) : "—"} />
        <SummaryRow label="Total Volume (24h)" value={topCoin ? formatCompactUsd(topCoin.volume24h) : "—"} />
        <SummaryRow
          label="Top Mover"
          value={strongestMover ? `${strongestMover.symbol} ${formatPercent(strongestMover.change24h)}` : "—"}
        />
      </div>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function OverviewSparkline() {
  return (
    <svg className="mt-4 h-12 w-full" viewBox="0 0 180 48" aria-hidden="true">
      <path
        d="M4 38 C28 34 38 35 55 28 S78 12 98 20 122 31 144 12 160 10 176 4"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="3"
      />
    </svg>
  );
}

function OverviewBars() {
  return (
    <div className="mt-5 flex h-10 items-end gap-1.5">
      {[22, 36, 18, 30, 42, 24, 34, 20, 38, 28, 44, 26].map((height, index) => (
        <span className="w-full rounded-t bg-violet-500/80" key={index} style={{ height }} />
      ))}
    </div>
  );
}

function OverviewRing() {
  return (
    <div className="mt-4 h-14">
      <div className="size-14 rounded-full border-[12px] border-violet-500 border-t-white/15" />
    </div>
  );
}

function MarketsError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const message = isApiError(error)
    ? error.message
    : "Could not load market data. Please check the API server.";

  return (
    <Card className="space-y-4 p-6 text-center">
      <h2 className="text-lg font-semibold text-white">Markets could not be loaded</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
      <div>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </Card>
  );
}
