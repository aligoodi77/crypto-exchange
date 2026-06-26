"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

const miniChart = [
  { value: 20 },
  { value: 25 },
  { value: 23 },
  { value: 31 },
  { value: 29 },
  { value: 39 },
  { value: 35 },
  { value: 44 },
];

export function Sparkline({ red = false }: { red?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-14 w-full" />;

  return (
    <div className="h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={miniChart}>
          <Line type="monotone" dataKey="value" stroke={red ? "#ef4444" : "#8b5cf6"} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
