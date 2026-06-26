import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCryptoAmount, formatUsd } from "@/features/wallet/formatters";

function createRows(price: number, side: "ask" | "bid") {
  return Array.from({ length: 6 }).map((_, index) => {
    const direction = side === "ask" ? 1 : -1;
    const rowPrice = price * (1 + direction * (index + 1) * 0.0009);
    const amount = 0.015 + index * 0.012;

    return {
      price: rowPrice,
      amount,
      total: rowPrice * amount,
    };
  });
}

export function OrderBook({
  price,
  symbol,
}: {
  price: string | number;
  symbol: string;
}) {
  const currentPrice = Number(price);
  const asks = createRows(currentPrice, "ask").reverse();
  const bids = createRows(currentPrice, "bid");

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold">Order Book</h2>
        <Badge className="bg-amber-500/15 text-amber-300">Demo</Badge>
      </div>
      <div className="grid grid-cols-3 pb-2 text-xs text-zinc-500">
        <span>Price</span>
        <span>Amount</span>
        <span>Total</span>
      </div>
      {asks.map((row) => (
        <div className="grid grid-cols-3 py-1.5 text-sm" key={`ask-${row.price}`}>
          <span className="text-red-400">{formatUsd(row.price)}</span>
          <span>{formatCryptoAmount(row.amount)} {symbol}</span>
          <span>{formatUsd(row.total)}</span>
        </div>
      ))}
      <div className="my-3 text-2xl font-bold text-white">
        {formatUsd(currentPrice)}
      </div>
      {bids.map((row) => (
        <div className="grid grid-cols-3 py-1.5 text-sm" key={`bid-${row.price}`}>
          <span className="text-emerald-400">{formatUsd(row.price)}</span>
          <span>{formatCryptoAmount(row.amount)} {symbol}</span>
          <span>{formatUsd(row.total)}</span>
        </div>
      ))}
    </Card>
  );
}
