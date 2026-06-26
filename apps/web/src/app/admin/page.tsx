"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { isApiError } from "@/lib/api-error";

import { AdminStateCard } from "@/features/admin/components/AdminShared";
import { useAdminStats } from "@/features/admin/hooks";
import { formatCompactUsd, formatUsd } from "@/features/wallet/formatters";

import { useAuthStore } from "@/store/auth-store";

export default function AdminPage() {
  const token = useAuthStore((state) => state.token);
  const statsQuery = useAdminStats(token);
  const stats = statsQuery.data;

  return (
    <AppShell admin title="Admin" subtitle="Platform controls and live exchange health.">
      {statsQuery.isLoading ? (
        <section className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card className="h-30 animate-pulse bg-white/3" key={index} />
          ))}
        </section>
      ) : statsQuery.isError ? (
        <AdminStateCard
          title="Admin stats could not be loaded"
          message={
            isApiError(statsQuery.error)
              ? statsQuery.error.message
              : "Please check the API server."
          }
          onRetry={() => {
            void statsQuery.refetch();
          }}
        />
      ) : stats ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total users" value={stats.users.total.toLocaleString()} />
            <StatCard label="Verified users" value={stats.users.verified.toLocaleString()} />
            <StatCard label="Unverified users" value={stats.users.unverified.toLocaleString()} />
            <StatCard label="Active coins" value={`${stats.coins.active}/${stats.coins.total}`} />
            <StatCard label="Trade volume" value={formatCompactUsd(stats.trades.totalTradeVolume)} />
            <StatCard label="Total fees" value={formatUsd(stats.trades.totalFees)} />
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <AdminLink href="/admin/users" label="Manage Users" />
            <AdminLink href="/admin/transactions" label="Monitor Transactions" />
            <AdminLink href="/admin/coins" label="Manage Coins" />
          </section>
        </div>
      ) : null}
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

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Card className="p-5">
      <h2 className="font-semibold text-white">{label}</h2>
      <Button asChild className="mt-4" size="sm" variant="outline">
        <Link href={href}>Open</Link>
      </Button>
    </Card>
  );
}
