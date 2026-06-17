import { AppShell } from "@/components/layout/AppShell";
import { MarketTable } from "@/components/dashboard/MarketTable";
import { Watchlist } from "@/components/dashboard/Watchlist";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/dashboard/Sparkline";

export default function MarketsPage() {
  return (
    <AppShell title="Markets" subtitle="Explore the crypto markets and spot opportunities.">
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            {["Market Cap $2.48T", "24h Volume $89.37B", "BTC Dominance 54.12%", "Fear & Greed 72"].map((item) => (
              <Card key={item} className="p-4"><p className="text-sm text-zinc-400">{item.split(" ")[0]} {item.split(" ")[1]}</p><h2 className="mt-2 text-2xl font-bold">{item.split(" ").slice(2).join(" ")}</h2><Sparkline /></Card>
            ))}
          </div>
          <MarketTable />
        </div>
        <div className="space-y-5">
          <Watchlist title="Top Gainers" />
          <Watchlist title="Top Losers" />
          <Card className="p-5"><h2 className="font-semibold">Market Summary</h2><div className="mt-4 space-y-3 text-sm text-zinc-300">{["Total Cryptocurrencies 22,134", "Total Market Cap $2.48T", "Active Markets 9,845"].map((x) => <p key={x} className="flex justify-between"><span>{x.replace(/ [^ ]+$/, "")}</span><span>{x.split(" ").at(-1)}</span></p>)}</div></Card>
        </div>
      </div>
    </AppShell>
  );
}
