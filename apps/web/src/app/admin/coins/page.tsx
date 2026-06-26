"use client";

import { RefreshCw } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { isApiError } from "@/lib/api-error";

import {
  AdminStateCard,
  AdminTableSkeleton,
  StatusBadge,
} from "@/features/admin/components/AdminShared";
import {
  useAdminCoins,
  useSyncAdminCoins,
  useUpdateAdminCoinStatus,
} from "@/features/admin/hooks";
import {
  formatCompactUsd,
  formatPercent,
  formatUsd,
} from "@/features/wallet/formatters";

import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";

export default function AdminCoinsPage() {
  const token = useAuthStore((state) => state.token);
  const showToast = useToastStore((state) => state.showToast);
  const coinsQuery = useAdminCoins(token);
  const updateStatus = useUpdateAdminCoinStatus(token);
  const syncCoins = useSyncAdminCoins(token);
  const coins = coinsQuery.data ?? [];
  const activeCoins = coins.filter((coin) => coin.isActive).length;

  async function toggleCoin(id: string, isActive: boolean) {
    try {
      await updateStatus.mutateAsync({ id, isActive: !isActive });
      showToast({ title: "Coin status updated", tone: "success" });
    } catch (error) {
      showToast({
        title: "Could not update coin",
        description: isApiError(error) ? error.message : "Please try again.",
        tone: "error",
      });
    }
  }

  async function sync() {
    try {
      const result = await syncCoins.mutateAsync();
      showToast({
        title: "Coins synced",
        description: `${result.count} coins updated.`,
        tone: "success",
      });
    } catch (error) {
      showToast({
        title: "Coin sync failed",
        description: isApiError(error) ? error.message : "Please try again.",
        tone: "error",
      });
    }
  }

  return (
    <AppShell admin title="Coins" subtitle="Configure tradable assets and market sync.">
      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Listed Assets" value={coins.length.toLocaleString()} />
          <StatCard label="Active Assets" value={activeCoins.toLocaleString()} />
          <StatCard label="Inactive Assets" value={(coins.length - activeCoins).toLocaleString()} />
        </section>

        <div className="flex justify-end">
          <Button
            disabled={syncCoins.isPending}
            onClick={() => {
              void sync();
            }}
          >
            <RefreshCw className={syncCoins.isPending ? "size-4 animate-spin" : "size-4"} />
            {syncCoins.isPending ? "Syncing..." : "Manual Coin Sync"}
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold text-white">Coin List</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Activate or deactivate coins for user trading.
            </p>
          </div>

          {coinsQuery.isError ? (
            <AdminStateCard
              title="Coins could not be loaded"
              message={
                isApiError(coinsQuery.error)
                  ? coinsQuery.error.message
                  : "Please try again."
              }
              onRetry={() => {
                void coinsQuery.refetch();
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-240 text-left">
                <thead className="border-b border-white/10 bg-white/2">
                  <tr>
                    {["Asset", "Price", "24h", "Market Cap", "Volume", "Status", "Action"].map((heading) => (
                      <th className="px-5 py-3 text-xs font-medium text-zinc-400" key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coinsQuery.isLoading ? (
                    <AdminTableSkeleton columns={7} />
                  ) : coins.length ? (
                    coins.map((coin) => (
                      <tr className="border-b border-white/5" key={coin.id}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {coin.image ? (
                              <img alt="" className="size-9 rounded-full bg-white/10" src={coin.image} />
                            ) : (
                              <span className="grid size-9 place-items-center rounded-full bg-violet-500/20 text-sm font-semibold">
                                {coin.symbol.slice(0, 1)}
                              </span>
                            )}
                            <div>
                              <p className="font-medium text-white">{coin.name}</p>
                              <p className="text-xs text-zinc-500">{coin.symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-white">{formatUsd(coin.price)}</td>
                        <td className="px-5 py-4 text-sm text-white">{formatPercent(coin.change24h)}</td>
                        <td className="px-5 py-4 text-sm text-white">{formatCompactUsd(coin.marketCap)}</td>
                        <td className="px-5 py-4 text-sm text-white">{formatCompactUsd(coin.volume24h)}</td>
                        <td className="px-5 py-4"><StatusBadge status={coin.isActive ? "ACTIVE" : "INACTIVE"} /></td>
                        <td className="px-5 py-4">
                          <Button
                            disabled={updateStatus.isPending}
                            onClick={() => {
                              void toggleCoin(coin.id, coin.isActive);
                            }}
                            size="sm"
                            variant={coin.isActive ? "red" : "green"}
                          >
                            {coin.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-14 text-center text-sm text-zinc-400" colSpan={7}>
                        No coins found. Run manual sync to import market data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <h2 className="mt-2 text-2xl font-bold text-white">{value}</h2>
    </Card>
  );
}
