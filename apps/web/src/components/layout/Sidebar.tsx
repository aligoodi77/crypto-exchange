"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminNavItems, navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

export function Sidebar({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname();
  const items = admin ? adminNavItems : navItems;

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
      <button className="mx-auto grid size-10 place-items-center rounded-xl text-zinc-400 hover:bg-white/8 hover:text-white" aria-label="Logout">
        <LogOut className="size-5" />
      </button>
    </aside>
  );
}
