import { AppShell } from "@/components/layout/AppShell";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { MarketTable } from "@/components/dashboard/MarketTable";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <AppShell title="Welcome to CoinBarrier!" subtitle="Suggested currencies and portfolio signals for the next 24 hours.">
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            {["Bitcoin", "Ethereum", "BNB"].map((name, index) => (
              <Card key={name} className="p-5">
                <h2 className="text-lg font-semibold">{name}</h2>
                <p className="mt-4 text-sm text-zinc-500">Reward Rate</p>
                <div className="text-2xl font-bold">{[13.62, 12.72, 6.29][index]}%</div>
                <div className={index === 2 ? "text-sm text-red-400" : "text-sm text-emerald-400"}>{index === 2 ? "-1.89%" : "+5.67%"}</div>
              </Card>
            ))}
          </div>
          <MarketTable compact />
        </div>
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-xl font-semibold">Liquid Staking Portfolio</h2>
            <p className="mt-3 text-sm text-zinc-400">Optimize and manage your Ethereum liquid staking investments.</p>
            <button className="mt-5 w-full rounded-xl bg-violet-500 py-3 font-semibold">Connect Wallet</button>
          </Card>
          <BalanceCard />
          <Watchlist title="New Listing" />
        </div>
      </div>
    </AppShell>
  );
}
