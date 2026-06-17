import { Check, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { users } from "@/lib/mock-data";

export default function AdminUsersPage() {
  return (
    <AppShell admin title="Admin Dashboard" subtitle="Monitor and manage the CoinBarrier exchange platform.">
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        {["Total Users 128,741", "24h Volume $54.38M", "24h Transactions 346,782", "24h Revenue $1.28M"].map((item) => <Card key={item} className="p-5"><p className="text-sm text-zinc-400">{item.replace(/ [^ ]+$/, "")}</p><h2 className="mt-2 text-2xl font-bold">{item.split(" ").at(-1)}</h2><Sparkline /></Card>)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Recent Users</h2>
          {users.map((user, index) => <div key={user.email} className="grid grid-cols-[32px_1fr_auto_auto] items-center gap-3 border-b border-white/8 py-3 text-sm"><span>{index + 1}</span><span>{user.name}<small className="block text-zinc-500">{user.email}</small></span><Badge className={user.kyc === "Verified" ? "bg-emerald-500/15 text-emerald-300" : "bg-yellow-500/15 text-yellow-300"}>{user.kyc}</Badge><span>{user.volume}</span></div>)}
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">KYC Approval Queue</h2>
          {users.slice(0, 4).map((user) => <div key={user.email} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-white/8 py-3 text-sm"><span>{user.name}<small className="block text-zinc-500">{user.email}</small></span><button className="grid size-9 place-items-center rounded-lg border border-emerald-500/40 text-emerald-400"><Check className="size-4" /></button><button className="grid size-9 place-items-center rounded-lg border border-red-500/40 text-red-400"><X className="size-4" /></button></div>)}
        </Card>
      </div>
    </AppShell>
  );
}
