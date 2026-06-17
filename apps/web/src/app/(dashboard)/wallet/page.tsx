import { AppShell } from "@/components/layout/AppShell";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { MarketTable } from "@/components/dashboard/MarketTable";
import { WalletCard } from "@/components/wallet/WalletCard";
import { Card } from "@/components/ui/card";
import { assets, transactions } from "@/lib/mock-data";

export default function WalletPage() {
  return (
    <AppShell title="My Wallet" subtitle="Manage your assets, track balances, and transact securely.">
      <div className="grid gap-5 xl:grid-cols-[320px_1fr_260px]">
        <BalanceCard />
        <PortfolioChart />
        <Card className="p-5"><h2 className="text-sm text-zinc-400">All Time Profit</h2><div className="mt-8 text-2xl font-bold text-emerald-400">+$8,742.19</div><p className="text-emerald-400">+19.12%</p></Card>
      </div>
      <h2 className="mb-4 mt-6 text-lg font-semibold">Your Wallets</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">{assets.slice(0, 5).map((asset) => <WalletCard key={asset.symbol} asset={asset} />)}</div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <MarketTable compact />
        <Card className="p-5"><h2 className="mb-4 font-semibold">Recent Activity</h2>{transactions.map((tx) => <div key={`${tx.type}-${tx.symbol}`} className="flex justify-between border-b border-white/8 py-3 text-sm"><span>{tx.type}<small className="block text-zinc-500">{tx.symbol}</small></span><span className={tx.amount.startsWith("+") ? "text-emerald-400" : "text-red-400"}>{tx.amount}</span></div>)}</Card>
      </div>
    </AppShell>
  );
}
