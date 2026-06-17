import { Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BuySellForm } from "@/components/trade/BuySellForm";
import { OrderBook } from "@/components/trade/OrderBook";
import { TradeHistory } from "@/components/trade/TradeHistory";
import { TradingChart } from "@/components/trade/TradingChart";
import { Card } from "@/components/ui/card";
import { CoinIcon } from "@/components/shared/CoinIcon";

export default function TradePage() {
  const btc = { symbol: "BTC", color: "bg-amber-400" };
  return (
    <AppShell title="Trade" subtitle="Spot Trading">
      <Card className="mb-5 grid gap-4 p-4 md:grid-cols-[1fr_repeat(5,auto)] md:items-center">
        <div className="flex items-center gap-3"><CoinIcon asset={btc} /><div><h2 className="font-semibold">BTC/USDT</h2><p className="text-xs text-zinc-500">Bitcoin / Tether</p></div></div>
        <div className="text-2xl font-bold text-red-400">68,742.31</div>
        {["24h Change +2.45%", "24h High 69,145.22", "24h Low 66,412.10", "24h Volume 876.21M"].map((x) => <div key={x} className="text-sm text-zinc-400">{x}</div>)}
        <Star className="size-5 text-zinc-400" />
      </Card>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_320px_320px]">
        <TradingChart />
        <OrderBook />
        <TradeHistory />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
        <BuySellForm />
        <Card className="p-5"><h2 className="font-semibold">Asset Summary</h2><div className="mt-6 text-3xl font-bold">$54,380.42</div><p className="text-emerald-400">+3.28% (24h)</p><button className="mt-8 w-full rounded-xl border border-violet-400 py-3 text-violet-200">Transfer Assets</button></Card>
      </div>
    </AppShell>
  );
}
