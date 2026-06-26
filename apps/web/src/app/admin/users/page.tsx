"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { isApiError } from "@/lib/api-error";

import {
  AdminStateCard,
  AdminTableSkeleton,
  StatusBadge,
} from "@/features/admin/components/AdminShared";
import { useAdminStats, useAdminUsers } from "@/features/admin/hooks";
import { formatDate, formatUsd } from "@/features/wallet/formatters";

import { useAuthStore } from "@/store/auth-store";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const token = useAuthStore((state) => state.token);

  const statsQuery = useAdminStats(token);
  const usersQuery = useAdminUsers(token, { page, limit: 10, search });

  return (
    <AppShell admin title="Users" subtitle="Monitor and manage exchange users.">
      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Users" value={statsQuery.data?.users.total.toLocaleString() ?? "—"} />
          <StatCard label="Verified" value={statsQuery.data?.users.verified.toLocaleString() ?? "—"} />
          <StatCard label="Unverified" value={statsQuery.data?.users.unverified.toLocaleString() ?? "—"} />
          <StatCard label="Trades" value={statsQuery.data?.trades.totalTransactions.toLocaleString() ?? "—"} />
        </section>

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-white">User List</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {usersQuery.data?.pagination.total.toLocaleString() ?? "—"} users
              </p>
            </div>

            <Input
              className="md:max-w-xs"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name or email"
              value={search}
            />
          </div>

          {usersQuery.isError ? (
            <AdminStateCard
              title="Users could not be loaded"
              message={
                isApiError(usersQuery.error)
                  ? usersQuery.error.message
                  : "Please try again."
              }
              onRetry={() => {
                void usersQuery.refetch();
              }}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-220 text-left">
                  <thead className="border-b border-white/10 bg-white/2">
                    <tr>
                      {["Name", "Email", "Role", "Verified", "Cash", "Trades", "Joined"].map((heading) => (
                        <th className="px-5 py-3 text-xs font-medium text-zinc-400" key={heading}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersQuery.isLoading ? (
                      <AdminTableSkeleton columns={7} />
                    ) : usersQuery.data?.items.length ? (
                      usersQuery.data.items.map((user) => (
                        <tr className="border-b border-white/5" key={user.id}>
                          <td className="px-5 py-4 text-sm font-medium text-white">{user.name}</td>
                          <td className="px-5 py-4 text-sm text-zinc-300">{user.email}</td>
                          <td className="px-5 py-4 text-sm text-white">{user.role}</td>
                          <td className="px-5 py-4">
                            <StatusBadge status={user.emailVerified ? "VERIFIED" : "PENDING"} />
                          </td>
                          <td className="px-5 py-4 text-sm text-white">{formatUsd(user.cashBalanceUsd)}</td>
                          <td className="px-5 py-4 text-sm text-white">{user.transactionCount.toLocaleString()}</td>
                          <td className="px-5 py-4 text-sm text-zinc-300">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-5 py-14 text-center text-sm text-zinc-400" colSpan={7}>
                          No users match the current search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {usersQuery.data?.pagination ? (
                <Pagination
                  hasNext={usersQuery.data.pagination.hasNextPage}
                  hasPrevious={usersQuery.data.pagination.hasPreviousPage}
                  isFetching={usersQuery.isFetching}
                  onNext={() => setPage((current) => current + 1)}
                  onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                  page={usersQuery.data.pagination.page}
                  totalPages={usersQuery.data.pagination.totalPages}
                />
              ) : null}
            </>
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
      <h2 className="mt-2 text-2xl font-bold">{value}</h2>
    </Card>
  );
}

function Pagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  isFetching,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  isFetching: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
      <p className="text-sm text-zinc-400">Page {page} of {totalPages || 1}</p>
      <div className="flex gap-2">
        <Button disabled={!hasPrevious || isFetching} onClick={onPrevious} size="sm" variant="outline">Previous</Button>
        <Button disabled={!hasNext || isFetching} onClick={onNext} size="sm" variant="outline">Next</Button>
      </div>
    </div>
  );
}
