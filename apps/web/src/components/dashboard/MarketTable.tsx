import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { assets } from "@/lib/mock-data";
import { currency } from "@/lib/utils";
import { CoinIcon } from "@/components/shared/CoinIcon";
import { Sparkline } from "@/components/dashboard/Sparkline";

export function MarketTable({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", "Trending", "Layer 1", "DeFi", "More"].map((tab, index) => (
          <button key={tab} className={index === 0 ? "rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold" : "rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300"}>
            {tab}
          </button>
        ))}
      </div>
      <div className="hidden min-w-full text-sm md:block">
        <div className="grid grid-cols-[52px_1.4fr_1fr_1fr_1fr_1fr_1fr_40px] border-b border-white/8 px-3 py-3 text-xs text-zinc-500">
          <span>#</span><span>Asset</span><span>Price</span><span>24h %</span><span>Market Cap</span><span>Volume</span><span>Last 7 Days</span><span />
        </div>
        {assets.slice(0, compact ? 5 : 8).map((asset, index) => (
          <div key={asset.symbol} className="grid grid-cols-[52px_1.4fr_1fr_1fr_1fr_1fr_1fr_40px] items-center border-b border-white/6 px-3 py-3 last:border-0">
            <span className="text-zinc-400">{index + 1}</span>
            <span className="flex items-center gap-3"><CoinIcon asset={asset} /> <span>{asset.name}<small className="block text-zinc-500">{asset.symbol}</small></span></span>
            <span>{currency(asset.price)}</span>
            <span className={asset.change >= 0 ? "text-emerald-400" : "text-red-400"}>{asset.change > 0 ? "+" : ""}{asset.change}%</span>
            <span>$1.36T</span>
            <span>$24.21B</span>
            <Sparkline red={asset.change < 0} />
            <Star className="size-5 text-yellow-400" />
          </div>
        ))}
      </div>
      <div className="space-y-3 md:hidden">
        {assets.slice(0, 6).map((asset) => (
          <div key={asset.symbol} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-white/8 pb-3">
            <span className="flex items-center gap-3"><CoinIcon asset={asset} /> <span>{asset.name}<small className="block text-zinc-500">{asset.symbol}</small></span></span>
            <span className="text-sm">{currency(asset.price)}</span>
            <span className={asset.change >= 0 ? "text-sm text-emerald-400" : "text-sm text-red-400"}>{asset.change > 0 ? "+" : ""}{asset.change}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
