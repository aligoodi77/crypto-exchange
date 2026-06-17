"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

const data = [
  { name: "BTC", value: 48.12, color: "#f59e0b" },
  { name: "ETH", value: 24.35, color: "#3b82f6" },
  { name: "SOL", value: 12.21, color: "#8b5cf6" },
  { name: "BNB", value: 7.85, color: "#facc15" },
  { name: "Others", value: 7.47, color: "#d4d4d8" },
];

export function PortfolioChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">Portfolio Allocation</h2>
        <button className="rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-300">View All</button>
      </div>
      <div className="grid items-center gap-5 md:grid-cols-[220px_1fr]">
        <div className="relative h-52">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={56} outerRadius={86} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="absolute inset-0 grid place-items-center text-center text-sm font-bold">
            $54,380.42
            <span className="block text-xs font-normal text-zinc-400">USD</span>
          </div>
        </div>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="grid grid-cols-[1fr_auto] items-center text-sm">
              <span className="flex items-center gap-2">
                <i className="size-2.5 rounded-full" style={{ background: item.color }} />
                {item.name}
              </span>
              <span>{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
