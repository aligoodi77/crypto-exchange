import { Card } from "@/components/ui/card";
import { CoinIcon } from "@/components/shared/CoinIcon";
import { Sparkline } from "@/components/dashboard/Sparkline";

export function WalletCard({ asset }: { asset: { name: string; symbol: string; balance: number; change: number; color: string } }) {
  return (
    <Card className="min-w-44 p-4">
      <div className="flex items-center gap-3">
        <CoinIcon asset={asset} />
        <span className="font-semibold">{asset.name}<small className="block text-xs text-zinc-500">{asset.symbol}</small></span>
      </div>
      <div className="mt-4 text-xl font-bold">${asset.balance.toLocaleString()}</div>
      <div className={asset.change >= 0 ? "mt-1 text-sm text-emerald-400" : "mt-1 text-sm text-red-400"}>{asset.change > 0 ? "+" : ""}{asset.change}%</div>
      <Sparkline red={asset.change < 0} />
    </Card>
  );
}
