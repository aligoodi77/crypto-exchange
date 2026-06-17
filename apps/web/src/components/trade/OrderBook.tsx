import { Card } from "@/components/ui/card";

const rows = ["68,743.21", "68,743.02", "68,742.80", "68,742.61", "68,742.42"];

export function OrderBook() {
  return (
    <Card className="p-4">
      <h2 className="mb-4 font-semibold">Order Book</h2>
      <div className="grid grid-cols-3 pb-2 text-xs text-zinc-500"><span>Price</span><span>Amount</span><span>Total</span></div>
      {rows.map((price, index) => (
        <div key={price} className="grid grid-cols-3 py-1.5 text-sm">
          <span className="text-red-400">{price}</span><span>0.{index + 12}48</span><span>{(8581 + index * 2112).toLocaleString()}</span>
        </div>
      ))}
      <div className="my-3 text-2xl font-bold text-red-400">68,742.31</div>
      {rows.map((price, index) => (
        <div key={`${price}-b`} className="grid grid-cols-3 py-1.5 text-sm">
          <span className="text-emerald-400">{price.replace("3", "1")}</span><span>0.{index + 21}34</span><span>{(14651 + index * 1440).toLocaleString()}</span>
        </div>
      ))}
    </Card>
  );
}
