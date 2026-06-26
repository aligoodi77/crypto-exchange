"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronDown,
  LogOut,
  MailCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRealtimeStore } from "@/store/realtime-store";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/features/auth/hooks";
import { disconnectRealtime } from "@/lib/realtime/socket.client";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const lastPriceUpdateAt = useRealtimeStore((state) => state.lastPriceUpdateAt);
  const requestReconnect = useRealtimeStore((state) => state.requestReconnect);
  const realtimeStatus = useRealtimeStore((state) => state.status);
  const logoutMutation = useLogout(token);
  const initial = user?.name?.slice(0, 1).toUpperCase() ?? "U";
  const lastPriceUpdate = lastPriceUpdateAt
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(lastPriceUpdateAt))
    : "No price update yet";

  async function handleLogout() {
    try {
      if (token) {
        await logoutMutation.mutateAsync();
      }
    } catch {
      // Local logout still clears an unusable or expired session.
    } finally {
      disconnectRealtime();
      clearSession();
      queryClient.clear();
      router.replace("/login");
    }
  }

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
        <Button
          className="relative rounded-full border border-white/10 bg-white/[.06] shadow-lg shadow-black/10"
          variant="secondary"
          size="icon"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-violet-500 text-[10px] font-bold text-white ring-2 ring-[#07090f]">
            3
          </span>
        </Button>
        <div className="relative">
          <button
            className={cn(
              "flex items-center gap-3 rounded-full border border-white/10 bg-white/[.055] p-1.5 pr-3 shadow-lg shadow-black/10 transition hover:border-violet-300/35 hover:bg-white/[.085]",
              userMenuOpen && "border-violet-300/35 bg-white/[.085]",
            )}
            onClick={() => setUserMenuOpen((current) => !current)}
            type="button"
          >
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              initial={isHydrated ? initial : ""}
              size="md"
            />
            <div className="hidden max-w-44 text-left md:block">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-white">
                  {isHydrated ? user?.name ?? "Trader" : "Loading..."}
                </p>
              </div>
              <p className="truncate text-xs text-zinc-400">
                {user?.emailVerified ? "Verified account" : "Verify email"}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "size-4 text-zinc-300 transition",
                userMenuOpen && "rotate-180",
              )}
            />
          </button>

          {userMenuOpen ? (
            <div className="absolute right-0 top-[calc(100%+.75rem)] z-50 w-80 overflow-hidden rounded-3xl border border-white/10 bg-[#111217]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_65%_0%,rgba(168,85,247,.24),transparent_52%)]" />
              <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.055] p-3">
                <UserAvatar
                  avatarUrl={user?.avatarUrl}
                  initial={isHydrated ? initial : ""}
                  size="lg"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {user?.name ?? "Trader"}
                    </p>
                    {user?.role ? (
                      <Badge className="bg-violet-500/18 text-violet-100">
                        {user.role}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-zinc-400">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="relative mt-3 grid grid-cols-2 gap-2">
                <AccountInfoTile
                  icon={ShieldCheck}
                  label="Security"
                  value={user?.emailVerified ? "Verified" : "Pending"}
                  tone={user?.emailVerified ? "success" : "warning"}
                />
                <AccountInfoTile
                  icon={MailCheck}
                  label="Email"
                  value={user?.emailVerified ? "Active" : "Code needed"}
                  tone={user?.emailVerified ? "success" : "warning"}
                />
              </div>

              <div className="relative mt-3 grid gap-2">
                <Link
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-zinc-200 transition hover:bg-white/8"
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <span className="grid size-8 place-items-center rounded-xl bg-white/[.06]">
                    <User className="size-4" />
                  </span>
                  <span>
                    <span className="block font-medium text-white">Profile</span>
                    <span className="block text-xs text-zinc-500">
                      Manage account and avatar
                    </span>
                  </span>
                </Link>
                <button
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-red-200 transition hover:bg-red-500/10 disabled:opacity-50"
                  disabled={logoutMutation.isPending}
                  onClick={() => {
                    void handleLogout();
                  }}
                  type="button"
                >
                  <span className="grid size-8 place-items-center rounded-xl bg-red-500/10">
                    <LogOut className="size-4" />
                  </span>
                  <span className="font-medium">
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function AccountInfoTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  tone: "success" | "warning";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3">
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Icon
          className={cn(
            "size-4",
            tone === "success" ? "text-emerald-300" : "text-amber-300",
          )}
        />
        {label}
      </div>
      <p
        className={cn(
          "mt-2 text-sm font-semibold",
          tone === "success" ? "text-emerald-200" : "text-amber-200",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function UserAvatar({
  avatarUrl,
  initial,
  size,
}: {
  avatarUrl?: string | null;
  initial: string;
  size: "md" | "lg";
}) {
  const className = cn(
    "grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-pink-300 to-violet-600 font-bold text-white ring-2 ring-white/10",
    size === "md" ? "size-11" : "size-12",
  );

  if (avatarUrl) {
    return (
      <span className="relative shrink-0">
        <img
          alt="Profile"
          className={cn(className, "object-cover")}
          height={size === "md" ? 44 : 48}
          src={avatarUrl}
          width={size === "md" ? 44 : 48}
        />
        <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#111217] bg-emerald-400" />
      </span>
    );
  }

  return (
    <span className="relative shrink-0">
      <div className={className}>{initial}</div>
      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#111217] bg-emerald-400" />
    </span>
  );
}
