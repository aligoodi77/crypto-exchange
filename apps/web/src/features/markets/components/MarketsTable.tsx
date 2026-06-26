"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  formatCompactUsd,
  formatPercent,
  formatRelativeTime,
  formatUsd,
  isPositive,
  isStaleMarketPrice,
} from "@/features/markets/formatters";

import type {
  MarketCoin,
  MarketSortBy,
  MarketSortOrder,
} from "@/features/markets/types";

type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type MarketsTableProps = {
  coins: MarketCoin[];
  pagination?: Pagination;
  isLoading: boolean;
  isFetching: boolean;
  sortBy: MarketSortBy;
  sortOrder: MarketSortOrder;
  onSortChange: (sortBy: MarketSortBy) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

const sortableColumns: Array<{
  label: string;
  key: MarketSortBy;
}> = [
  {
    label: "Asset",
    key: "name",
  },
  {
    label: "Price",
    key: "price",
  },
  {
    label: "24h %",
    key: "change24h",
  },
  {
    label: "Market Cap",
    key: "marketCap",
  },
  {
    label: "Volume",
    key: "volume24h",
  },
];

export function MarketsTable({
  coins,
  pagination,
  isLoading,
  isFetching,
  sortBy,
  sortOrder,
  onSortChange,
  onPreviousPage,
  onNextPage,
}: MarketsTableProps) {
  const newestUpdateMs = Math.max(
    0,
    ...coins
      .map((coin) => new Date(coin.updatedAt).getTime())
      .filter(Number.isFinite),
  );
  const newestUpdateIso = newestUpdateMs
    ? new Date(newestUpdateMs).toISOString()
    : null;
  const marketDataIsStale = newestUpdateIso
    ? isStaleMarketPrice(newestUpdateIso)
    : false;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-white">All Markets</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {pagination
              ? `${pagination.totalItems.toLocaleString()} assets available`
              : "Loading available assets..."}
          </p>

          <p
            className={
              marketDataIsStale
                ? "mt-1 text-xs text-amber-300"
                : "mt-1 text-xs text-zinc-500"
            }
          >
            Market prices are delayed and simulated
            {newestUpdateIso
              ? ` · updated ${formatRelativeTime(newestUpdateIso)}`
              : ""}
            {marketDataIsStale ? " · stale" : ""}
          </p>
        </div>

        {isFetching && !isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="size-3 animate-spin" />
            Refreshing
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-190 text-left">
          <thead className="border-b border-white/10 bg-white/2">
            <tr>
              <th className="w-14 px-5 py-3 text-xs font-medium text-muted-foreground">
                #
              </th>

              {sortableColumns.map((column) => (
                <th
                  className="px-5 py-3 text-xs font-medium text-muted-foreground"
                  key={column.key}
                >
                  <button
                    className="inline-flex items-center gap-1 transition hover:text-white"
                    onClick={() => onSortChange(column.key)}
                    type="button"
                  >
                    {column.label}

                    <SortIcon
                      active={sortBy === column.key}
                      sortOrder={sortOrder}
                    />
                  </button>
                </th>
              ))}

              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                Updated
              </th>

              <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <MarketsTableSkeleton />
            ) : coins.length > 0 ? (
              coins.map((coin, index) => {
                const rank =
                  ((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10) +
                  index +
                  1;

                const positiveChange = isPositive(coin.change24h);

                return (
                  <tr
                    className="border-b border-white/5 transition hover:bg-white/3"
                    key={coin.id}
                  >
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {rank}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <MarketAvatar coin={coin} />

                        <div>
                          <p className="font-medium text-white">{coin.name}</p>

                          <p className="text-xs text-muted-foreground">
                            {coin.symbol}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-white">
                      {formatUsd(coin.price)}
                    </td>

                    <td
                      className={`px-5 py-4 text-sm font-medium ${
                        positiveChange ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {formatPercent(coin.change24h)}
                    </td>

                    <td className="px-5 py-4 text-sm text-white">
                      {formatCompactUsd(coin.marketCap)}
                    </td>

                    <td className="px-5 py-4 text-sm text-white">
                      {formatCompactUsd(coin.volume24h)}
                    </td>

                    <td
                      className={
                        isStaleMarketPrice(coin.updatedAt)
                          ? "px-5 py-4 text-right text-sm text-amber-300"
                          : "px-5 py-4 text-right text-sm text-zinc-400"
                      }
                    >
                      {formatRelativeTime(coin.updatedAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/trade/${encodeURIComponent(
                            coin.symbol.toLowerCase(),
                          )}`}
                        >
                          Trade
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-5 py-14 text-center text-sm text-muted-foreground"
                  colSpan={8}
                >
                  No assets matched your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages || 1}
          </p>

          <div className="flex gap-2">
            <Button
              disabled={!pagination.hasPreviousPage || isFetching}
              onClick={onPreviousPage}
              size="sm"
              variant="outline"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <Button
              disabled={!pagination.hasNextPage || isFetching}
              onClick={onNextPage}
              size="sm"
              variant="outline"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function SortIcon({
  active,
  sortOrder,
}: {
  active: boolean;
  sortOrder: MarketSortOrder;
}) {
  if (!active) {
    return <span className="text-[10px] text-muted-foreground/70">↕</span>;
  }

  return sortOrder === "asc" ? (
    <ArrowUp className="size-3 text-violet-300" />
  ) : (
    <ArrowDown className="size-3 text-violet-300" />
  );
}

function MarketAvatar({ coin }: { coin: MarketCoin }) {
  const fallbackLetter = coin.symbol.slice(0, 1).toUpperCase();

  if (!coin.image) {
    return (
      <span className="flex size-9 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-200">
        {fallbackLetter}
      </span>
    );
  }

  return (
    <img
      alt=""
      className="size-9 rounded-full bg-white/10 object-cover"
      height={36}
      src={coin.image}
      width={36}
    />
  );
}

function MarketsTableSkeleton() {
  return Array.from({ length: 10 }).map((_, index) => (
    <tr className="border-b border-white/5" key={index}>
      {Array.from({ length: 8 }).map((__, cellIndex) => (
        <td className="px-5 py-5" key={cellIndex}>
          <div className="h-4 animate-pulse rounded bg-white/10" />
        </td>
      ))}
    </tr>
  ));
}
