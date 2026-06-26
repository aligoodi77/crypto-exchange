"use client";

import { Bell, ChevronDown, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRealtimeStore } from "@/store/realtime-store";
import { useAuthStore } from "@/store/auth-store";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const lastPriceUpdateAt = useRealtimeStore((state) => state.lastPriceUpdateAt);
  const requestReconnect = useRealtimeStore((state) => state.requestReconnect);
  const realtimeStatus = useRealtimeStore((state) => state.status);
  const initial = user?.name?.slice(0, 1).toUpperCase() ?? "U";
  const lastPriceUpdate = lastPriceUpdateAt
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(lastPriceUpdateAt))
    : "No price update yet";

  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-normal text-white md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[.045] px-3 py-2 text-xs text-zinc-300 lg:flex">
          <span
            className={cn(
              "size-2 rounded-full",
              realtimeStatus === "live"
                ? "bg-emerald-400"
                : realtimeStatus === "reconnecting"
                  ? "bg-amber-400"
                  : "bg-red-400",
            )}
          />
          <div>
            <p className="font-medium capitalize text-white">
              {realtimeStatus === "live"
                ? "Live"
                : realtimeStatus === "reconnecting"
                  ? "Reconnecting"
                  : "Offline"}
            </p>
            <p className="text-[11px] text-zinc-500">{lastPriceUpdate}</p>
          </div>
          {realtimeStatus !== "live" ? (
            <button
              aria-label="Retry realtime connection"
              className="rounded-lg p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              onClick={requestReconnect}
              type="button"
            >
              <RefreshCw className="size-3.5" />
            </button>
          ) : null}
        </div>
        <label className="hidden h-12 min-w-[360px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[.055] px-4 text-zinc-400 md:flex">
          <Search className="size-5" />
          <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-400" placeholder="Search anything" />
        </label>
        <Button variant="secondary" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>
        <div className="hidden items-center gap-3 md:flex">
          <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-pink-300 to-violet-600 font-bold">
            {isHydrated ? initial : ""}
          </div>
          <div className="max-w-44">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">
                {isHydrated ? user?.name ?? "Trader" : "Loading..."}
              </p>
              {user?.role ? <Badge>{user.role}</Badge> : null}
            </div>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
          <ChevronDown className="size-4 text-zinc-300" />
        </div>
      </div>
    </header>
  );
}
