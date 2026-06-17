import { Card } from "@/components/ui/card";
import { assets } from "@/lib/mock-data";
import { CoinIcon } from "@/components/shared/CoinIcon";

export function Watchlist({ title = "Top Gainers" }: { title?: string }) {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <button className="text-xs text-zinc-400">View All</button>
      </div>
      <div className="space-y-3">
        {assets.slice(0, 5).map((asset) => (
          <div key={asset.symbol} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
            <span className="flex items-center gap-3"><CoinIcon asset={asset} /> <span>{asset.name}<small className="block text-zinc-500">{asset.symbol}</small></span></span>
            <span className={asset.change >= 0 ? "text-emerald-400" : "text-red-400"}>{asset.change > 0 ? "+" : ""}{asset.change}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
