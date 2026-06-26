"use client";

import { useEffect, useState } from "react";
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

const chartData = [
  { name: "06:00", value: 68200, volume: 28 },
  { name: "07:30", value: 68480, volume: 42 },
  { name: "09:00", value: 68620, volume: 35 },
  { name: "10:30", value: 69080, volume: 64 },
  { name: "12:00", value: 68690, volume: 31 },
  { name: "13:30", value: 68742, volume: 45 },
];

export function TradingChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["1m", "5m", "15m", "1H", "4H", "1D"].map((period) => (
          <button key={period} className={period === "5m" ? "rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold" : "rounded-lg bg-white/5 px-3 py-1.5 text-xs text-zinc-300"}>
            {period}
          </button>
        ))}
      </div>
      <div className="h-[330px] md:h-[420px]">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
              <YAxis orientation="right" stroke="#71717a" fontSize={12} domain={["dataMin - 200", "dataMax + 200"]} />
              <Tooltip contentStyle={{ background: "#111217", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="rgba(139,92,246,.16)" strokeWidth={2} />
              <Bar dataKey="volume" fill="rgba(16,185,129,.38)" yAxisId={0} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
