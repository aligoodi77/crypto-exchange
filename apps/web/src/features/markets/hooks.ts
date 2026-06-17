"use client";

import { useQuery } from "@tanstack/react-query";
import { getMarkets } from "@/features/markets/api";

export function useMarkets() {
  return useQuery({ queryKey: ["markets"], queryFn: getMarkets });
}
