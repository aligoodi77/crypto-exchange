"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function BuySellForm() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  return (
    <Card className="p-4">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Button variant={side === "buy" ? "green" : "secondary"} onClick={() => setSide("buy")}>Buy</Button>
        <Button variant={side === "sell" ? "red" : "secondary"} onClick={() => setSide("sell")}>Sell</Button>
      </div>
      <div className="mb-4 flex gap-2">
        <button className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold">Limit</button>
        <button className="rounded-lg bg-white/5 px-4 py-2 text-sm text-zinc-300">Market</button>
      </div>
      <label className="mb-3 block text-sm text-zinc-300">Price (USDT)<Input className="mt-2" defaultValue="68,742.31" /></label>
      <label className="mb-3 block text-sm text-zinc-300">Amount (BTC)<Input className="mt-2" placeholder="0.00" /></label>
      <div className="mb-4 grid grid-cols-5 gap-2 text-center text-xs text-zinc-400">
        {["0%", "25%", "50%", "75%", "100%"].map((item) => <span key={item}>{item}</span>)}
      </div>
      <label className="mb-4 block text-sm text-zinc-300">Total (USDT)<Input className="mt-2" placeholder="0.00" /></label>
      <Button className="w-full" variant={side === "buy" ? "green" : "red"}>{side === "buy" ? "Buy BTC" : "Sell BTC"}</Button>
    </Card>
  );
}
