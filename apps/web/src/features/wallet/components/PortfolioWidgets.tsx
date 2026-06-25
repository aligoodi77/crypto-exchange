import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  formatCompactUsd,
  formatCryptoAmount,
  formatPercent,
  formatUsd,
  isPositive,
} from "@/features/wallet/formatters";

import type { WalletAsset, WalletSummary } from "@/features/wallet/types";

export function PortfolioSummaryCards({ summary }: { summary: WalletSummary }) {
  const profitIsPositive = isPositive(summary.totalProfitLoss);

  const cards = [
    {
      label: "Total Portfolio Value",
      value: formatUsd(summary.totalPortfolioValue),
      detail: `${summary.assetCount} crypto asset${
        summary.assetCount === 1 ? "" : "s"
      }`,
      tone: "text-white",
    },
    {
      label: "Available Cash",
      value: formatUsd(summary.cashBalanceUsd),
      detail: "Available for trading",
      tone: "text-white",
    },
    {
      label: "Crypto Asset Value",
      value: formatUsd(summary.totalAssetValue),
      detail: "Current market value",
      tone: "text-white",
    },
    {
      label: "Unrealized P/L",
      value: formatUsd(summary.totalProfitLoss),
      detail: formatPercent(summary.totalProfitLossPercent),
      tone: profitIsPositive ? "text-emerald-400" : "text-red-400",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card className="p-5" key={card.label}>
          <p className="text-sm text-muted-foreground">{card.label}</p>

          <p className={`mt-2 text-xl font-semibold ${card.tone}`}>
            {card.value}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">{card.detail}</p>
        </Card>
      ))}
    </section>
  );
}

export function PortfolioAllocation({
  assets,
  summary,
}: {
  assets: WalletAsset[];
  summary: WalletSummary;
}) {
  const totalAssetValue = Number(summary.totalAssetValue);

  const sortedAssets = [...assets]
    .sort(
      (firstAsset, secondAsset) =>
        Number(secondAsset.currentValue) - Number(firstAsset.currentValue),
    )
    .slice(0, 5);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Portfolio Allocation</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Based on your current crypto holdings.
          </p>
        </div>

        <span className="text-sm font-medium text-white">
          {formatCompactUsd(summary.totalAssetValue)}
        </span>
      </div>

      {sortedAssets.length > 0 ? (
        <div className="mt-6 space-y-5">
          {sortedAssets.map((asset) => {
            const allocation =
              totalAssetValue > 0
                ? (Number(asset.currentValue) / totalAssetValue) * 100
                : 0;

            return (
              <div key={asset.id}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <CoinAvatar asset={asset} />

                    <p className="truncate text-sm font-medium text-white">
                      {asset.coin.symbol}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {allocation.toFixed(2)}%
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-400"
                    style={{
                      width: `${Math.max(allocation, 2)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyPortfolio />
      )}
    </Card>
  );
}

export function HoldingsTable({ assets }: { assets: WalletAsset[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-white">Your Holdings</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Live value and unrealized performance for every asset.
          </p>
        </div>

        <Button asChild size="sm" variant="outline">
          <Link href="/markets">Browse Markets</Link>
        </Button>
      </div>

      {assets.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">
            <thead className="border-b border-white/10 bg-white/2">
              <tr>
                <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
                  Asset
                </th>

                <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
                  Amount
                </th>

                <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
                  Current Price
                </th>

                <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
                  Current Value
                </th>

                <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
                  Avg. Buy Price
                </th>

                <th className="px-5 py-3 text-xs font-medium text-muted-foreground">
                  Unrealized P/L
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {assets.map((asset) => {
                const positiveProfit = isPositive(asset.profitLoss);

                return (
                  <tr
                    className="border-b border-white/5 transition hover:bg-white/3"
                    key={asset.id}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CoinAvatar asset={asset} />

                        <div>
                          <p className="font-medium text-white">
                            {asset.coin.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {asset.coin.symbol}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-white">
                      {formatCryptoAmount(asset.amount)} {asset.coin.symbol}
                    </td>

                    <td className="px-5 py-4 text-sm text-white">
                      {formatUsd(asset.currentPrice)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-white">
                      {formatUsd(asset.currentValue)}
                    </td>

                    <td className="px-5 py-4 text-sm text-white">
                      {formatUsd(asset.averageBuyPrice)}
                    </td>

                    <td
                      className={`px-5 py-4 text-sm font-medium ${
                        positiveProfit ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      <p>{formatUsd(asset.profitLoss)}</p>

                      <p className="mt-1 text-xs">
                        {formatPercent(asset.profitLossPercent)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/trade/${encodeURIComponent(
                            asset.coin.symbol.toLowerCase(),
                          )}`}
                        >
                          Trade
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyPortfolio />
      )}
    </Card>
  );
}

function CoinAvatar({ asset }: { asset: WalletAsset }) {
  const fallbackLetter = asset.coin.symbol.slice(0, 1).toUpperCase();

  if (!asset.coin.image) {
    return (
      <span className="flex size-9 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-200">
        {fallbackLetter}
      </span>
    );
  }

  return (
    <img
      alt={`${asset.coin.name} logo`}
      className="size-9 rounded-full bg-white/10 object-cover"
      height={36}
      src={asset.coin.image}
      width={36}
    />
  );
}

function EmptyPortfolio() {
  return (
    <div className="flex flex-col items-start gap-3 px-5 py-10">
      <h3 className="font-medium text-white">Your portfolio is empty</h3>

      <p className="max-w-md text-sm text-muted-foreground">
        You have not bought any crypto yet. Browse the market and make your
        first simulated trade.
      </p>

      <Button asChild size="sm">
        <Link href="/markets">Explore Markets</Link>
      </Button>
    </div>
  );
}
