import { Card } from "@/components/ui/card";

export function TradeHistory() {
  return (
    <Card className="p-4">
      <h2 className="mb-4 font-semibold">Recent Trades</h2>
      <div className="grid grid-cols-3 pb-2 text-xs text-zinc-500"><span>Price</span><span>Amount</span><span>Time</span></div>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="grid grid-cols-3 py-1.5 text-sm">
          <span className={index % 3 === 0 ? "text-emerald-400" : "text-red-400"}>68,742.{31 - index}</span>
          <span>0.0{index + 4}56</span>
          <span>15:42:{31 - index}</span>
        </div>
      ))}
    </Card>
  );
}
