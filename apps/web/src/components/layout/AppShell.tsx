"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { useCryptoRealtime } from "@/hooks/use-crypto-realtime";
import { useAuthStore } from "@/store/auth-store";

export function AppShell({ children, title, subtitle, admin = false }: { children: React.ReactNode; title: string; subtitle?: string; admin?: boolean }) {
  const token = useAuthStore((state) => state.token);

  useCryptoRealtime(token ?? undefined);

  return (
    <div className="coin-surface min-h-screen pb-24 md:pb-0">
      <Sidebar admin={admin} />
      <main className="px-4 py-6 md:ml-[104px] md:px-8">
        <Header title={title} subtitle={subtitle} />
        {children}
      </main>
      <MobileNav admin={admin} />
    </div>
  );
}
