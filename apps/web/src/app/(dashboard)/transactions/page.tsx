import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { transactions } from "@/lib/mock-data";

export default function TransactionsPage() {
  return (
    <AppShell title="Transactions" subtitle="Track and manage all your crypto transactions.">
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        {["Total Deposits $28,590.42", "Total Withdrawals $14,230.18", "Total Buys $34,128.76", "Total Sells $19,860.54"].map((item) => <Card key={item} className="p-5"><p className="text-sm text-zinc-400">{item.replace(/ \$.*$/, "")}</p><h2 className="mt-2 text-2xl font-bold">${item.split("$")[1]}</h2></Card>)}
      </div>
      <Card className="p-4">
        <div className="mb-5 flex flex-wrap gap-2">{["All Transactions", "Deposits", "Withdrawals", "Buys", "Sells"].map((x, i) => <button key={x} className={i === 0 ? "rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold" : "rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300"}>{x}</button>)}</div>
        <div className="space-y-3">
          {transactions.map((tx) => <div key={`${tx.type}-${tx.symbol}`} className="grid gap-3 rounded-xl border border-white/8 p-4 text-sm md:grid-cols-6 md:items-center"><span>{tx.type}</span><span>{tx.asset}<small className="block text-zinc-500">{tx.symbol}</small></span><span className={tx.amount.startsWith("+") ? "text-emerald-400" : "text-red-400"}>{tx.amount}<small className="block text-zinc-400">{tx.usd}</small></span><span>Free</span><span className="text-emerald-400">{tx.status}</span><span>{tx.date}</span></div>)}
        </div>
      </Card>
    </AppShell>
  );
}
