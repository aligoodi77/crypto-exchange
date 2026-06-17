import { X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { transactions } from "@/lib/mock-data";

export default function AdminTransactionsPage() {
  return (
    <AppShell admin title="Transaction Moderation" subtitle="Review flagged withdrawals, deposits, and exchange activity.">
      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Moderation Queue</h2>
        <div className="space-y-3">
          {transactions.concat(transactions).slice(0, 8).map((tx, index) => (
            <div key={`${tx.symbol}-${index}`} className="grid gap-3 rounded-xl border border-white/8 p-4 text-sm md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:items-center">
              <span>0x{index}f83a...e91b</span><span>{tx.asset}</span><span className={tx.amount.startsWith("+") ? "text-emerald-400" : "text-red-400"}>{tx.amount}</span><span>{index + 2}m ago</span><button className="grid size-8 place-items-center rounded-lg border border-white/10"><X className="size-4" /></button>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
