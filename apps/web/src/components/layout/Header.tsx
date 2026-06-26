"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const initial = user?.name?.slice(0, 1).toUpperCase() ?? "U";

  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-normal text-white md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
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
