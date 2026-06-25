"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { isApiError } from "@/lib/api-error";

import {
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

const sortOptions: Array<{
  label: string;
  value: MarketSortBy;
}> = [
  {
    label: "Market Cap",
    value: "marketCap",
  },
  {
    label: "Price",
    value: "price",
  },
  {
    label: "24h Change",
    value: "change24h",
  },
  {
    label: "24h Volume",
    value: "volume24h",
  },
  {
    label: "Name",
    value: "name",
  },
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

  const movers = useMemo(() => {
    return [...coins]
      .sort(
        (firstCoin, secondCoin) =>
          Number(secondCoin.change24h) - Number(firstCoin.change24h),
      )
      .slice(0, 5);
  }, [coins]);

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

  const topCoin = coins[0];
  const strongestMover = movers[0];

  return (
    <AppShell
      subtitle="Track live crypto market prices and 24-hour changes."
      title="Markets"
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MarketStat
            label="Assets Available"
            value={pagination ? pagination.totalItems.toLocaleString() : "—"}
          />

          <MarketStat
            label="Top Result"
            value={
              topCoin ? `${topCoin.name} · ${formatUsd(topCoin.price)}` : "—"
            }
          />

          <MarketStat
            label="Strongest 24h Mover"
            value={
              strongestMover
                ? `${strongestMover.symbol} · ${formatPercent(
                    strongestMover.change24h,
                  )}`
                : "—"
            }
            positive={
              strongestMover ? isPositive(strongestMover.change24h) : undefined
            }
          />
        </section>

        <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              className="h-11 w-full rounded-xl border border-white/10 bg-white/4 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-muted-foreground focus:border-violet-400"
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search Bitcoin, ETH, Solana..."
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
                setSortOrder((currentOrder) =>
                  currentOrder === "asc" ? "desc" : "asc",
                );
                setPage(1);
              }}
              variant="outline"
            >
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>
        </section>

        {marketsQuery.isError ? (
          <MarketsError
            error={marketsQuery.error}
            onRetry={() => {
              void marketsQuery.refetch();
            }}
          />
        ) : (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <MarketsTable
              coins={coins}
              isFetching={marketsQuery.isFetching}
              isLoading={marketsQuery.isLoading}
              onNextPage={() => {
                setPage((currentPage) => currentPage + 1);
              }}
              onPreviousPage={() => {
                setPage((currentPage) => Math.max(1, currentPage - 1));
              }}
              onSortChange={handleSortChange}
              pagination={pagination}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />

            <MarketMovers coins={movers} />
          </section>
        )}
      </div>
    </AppShell>
  );
}

function MarketStat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p
        className={`mt-2 truncate text-lg font-semibold ${
          positive === undefined
            ? "text-white"
            : positive
              ? "text-emerald-400"
              : "text-red-400"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}

function MarketMovers({ coins }: { coins: MarketCoin[] }) {
  return (
    <Card className="h-fit p-5">
      <div className="mb-5">
        <h2 className="font-semibold text-white">Movers in This Result</h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Based on your current search and sorting.
        </p>
      </div>

      <div className="space-y-4">
        {coins.length > 0 ? (
          coins.map((coin) => {
            const positiveChange = isPositive(coin.change24h);

            return (
              <div
                className="flex items-center justify-between gap-3"
                key={coin.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {coin.name}
                  </p>

                  <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                </div>

                <p
                  className={`shrink-0 text-sm font-semibold ${
                    positiveChange ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatPercent(coin.change24h)}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            No market data to display.
          </p>
        )}
      </div>
    </Card>
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
      <h2 className="text-lg font-semibold text-white">
        Markets could not be loaded
      </h2>

      <p className="text-sm text-muted-foreground">{message}</p>

      <div>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </Card>
  );
}
