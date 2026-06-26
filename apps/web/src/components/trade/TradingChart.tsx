"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";

const timeframes = ["1H", "1D", "1W", "1M"] as const;
type Timeframe = (typeof timeframes)[number];

type ChartPoint = {
  name: string;
  value: number;
  volume: number;
};

function createChartData(price: number, change24h: number, timeframe: Timeframe) {
  const pointsByTimeframe: Record<Timeframe, number> = {
    "1H": 12,
    "1D": 24,
    "1W": 14,
    "1M": 30,
  };
  const points = pointsByTimeframe[timeframe];
  const volatility = Math.max(Math.abs(change24h) / 100, 0.015);
  const timeframeScale =
    timeframe === "1H" ? 0.25 : timeframe === "1D" ? 1 : timeframe === "1W" ? 1.8 : 2.6;
  const start = price / (1 + (change24h / 100) * timeframeScale);

  return Array.from({ length: points }).map((_, index): ChartPoint => {
    const progress = points === 1 ? 1 : index / (points - 1);
    const wave = Math.sin(index * 1.7) * volatility * price * 0.35;
    const drift = start + (price - start) * progress;
    const value = Math.max(0.000001, drift + wave);

    return {
      name:
        timeframe === "1H"
          ? `${index * 5}m`
          : timeframe === "1D"
            ? `${index}:00`
            : timeframe === "1W"
              ? `D${index + 1}`
              : `${index + 1}`,
      value,
      volume: Math.round(20 + Math.abs(Math.cos(index * 1.1)) * 80),
    };
  });
}

export function TradingChart({
  price,
  change24h,
}: {
  price: string | number;
  change24h: string | number;
}) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");

  useEffect(() => setMounted(true), []);

  const chartData = useMemo(
    () => createChartData(Number(price), Number(change24h), timeframe),
    [change24h, price, timeframe],
  );

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {timeframes.map((period) => (
            <button
              key={period}
              className={
                period === timeframe
                  ? "rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold"
                  : "rounded-lg bg-white/5 px-3 py-1.5 text-xs text-zinc-300"
              }
              onClick={() => setTimeframe(period)}
              type="button"
            >
              {period}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500">Indicative price history</span>
      </div>
      <div className="h-[330px] md:h-[420px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
              <YAxis
                domain={["dataMin", "dataMax"]}
                fontSize={12}
                orientation="right"
                stroke="#71717a"
                tickFormatter={(value: number) =>
                  Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 2,
                  }).format(value)
                }
              />
              <Tooltip
                contentStyle={{
                  background: "#111217",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 12,
                }}
                formatter={(value, name) => {
                  const numericValue = Number(value);

                  return name === "value"
                    ? [
                        Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: numericValue >= 10 ? 2 : 6,
                        }).format(numericValue),
                        "Price",
                      ]
                    : [numericValue, "Volume"];
                }}
              />
              <Area
                dataKey="value"
                fill="rgba(139,92,246,.16)"
                stroke="#8b5cf6"
                strokeWidth={2}
                type="monotone"
              />
              <Bar dataKey="volume" fill="rgba(16,185,129,.30)" yAxisId={0} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </Card>
  );
}
