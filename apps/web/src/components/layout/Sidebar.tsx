"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, PanelLeftClose } from "lucide-react";
import { adminNavItems, navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { useLogout } from "@/features/auth/hooks";
import { disconnectRealtime } from "@/lib/realtime/socket.client";
import { useAuthStore } from "@/store/auth-store";
import { useToastStore } from "@/store/toast-store";

export function Sidebar({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const showToast = useToastStore((state) => state.showToast);
  const logoutMutation = useLogout(token);
  const items = admin && user?.role === "ADMIN" ? adminNavItems : navItems;

  async function handleLogout() {
    try {
      if (token) {
        await logoutMutation.mutateAsync();
      }
      showToast({ title: "Logged out", tone: "info" });
    } catch {
      showToast({
        title: "Local session cleared",
        description: "The API logout request did not complete.",
        tone: "info",
      });
    } finally {
      disconnectRealtime();
      clearSession();
      queryClient.clear();
      router.replace("/login");
    }
  }

  return (
    <aside className="group fixed inset-y-0 left-0 z-30 hidden w-[104px] overflow-hidden border-r border-white/8 bg-[#101116]/80 px-4 py-7 shadow-2xl shadow-black/20 backdrop-blur-xl transition-[width] duration-300 ease-out hover:w-[260px] focus-within:w-[260px] md:flex md:flex-col">
      <div className="flex items-center justify-between gap-3">
        <Logo
          compact
          className="min-w-0 justify-start transition-transform duration-300 group-hover:translate-x-0"
        />
        <span className="pointer-events-none flex min-w-0 flex-1 items-center overflow-hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="truncate text-lg font-bold text-white">
            Coin<span className="text-violet-300">Barrier</span>
          </span>
        </span>
        <PanelLeftClose className="size-4 shrink-0 text-zinc-500 opacity-0 transition group-hover:opacity-100" />
      </div>

      <nav className="mt-12 flex flex-1 flex-col gap-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-14 w-full items-center gap-4 rounded-2xl px-3 text-zinc-400 transition hover:bg-white/8 hover:text-white",
                active &&
                  "bg-violet-500/90 text-white shadow-[0_0_24px_rgba(139,92,246,.34)]",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl transition",
                  active ? "bg-white/14" : "bg-white/[.045]",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 translate-x-1 whitespace-nowrap text-sm font-medium opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <button
        className="flex h-12 w-full items-center gap-4 rounded-2xl px-3 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
        aria-label="Logout"
        disabled={logoutMutation.isPending}
        onClick={() => {
          void handleLogout();
        }}
        type="button"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[.045]">
          <LogOut className="size-5" />
        </span>
        <span className="translate-x-1 whitespace-nowrap text-sm font-medium opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100">
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </span>
      </button>
    </aside>
  );
}
