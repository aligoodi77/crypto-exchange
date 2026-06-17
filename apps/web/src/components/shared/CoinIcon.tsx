import { cn } from "@/lib/utils";

export function CoinIcon({ asset, className }: { asset: { symbol: string; color: string }; className?: string }) {
  return <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-black", asset.color, className)}>{asset.symbol.slice(0, 1)}</span>;
}
