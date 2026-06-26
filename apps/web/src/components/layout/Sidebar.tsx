"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[104px] border-r border-white/8 bg-black/24 px-4 py-7 md:flex md:flex-col">
      <Logo compact className="justify-center" />
      <nav className="mt-12 flex flex-1 flex-col items-center gap-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex w-full flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] text-zinc-400 transition",
                active && "bg-violet-500/85 text-white shadow-[0_0_22px_rgba(139,92,246,.35)]",
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        className="mx-auto grid size-10 place-items-center rounded-xl text-zinc-400 hover:bg-white/8 hover:text-white disabled:opacity-50"
        aria-label="Logout"
        disabled={logoutMutation.isPending}
        onClick={() => {
          void handleLogout();
        }}
        type="button"
      >
        <LogOut className="size-5" />
      </button>
    </aside>
  );
}
