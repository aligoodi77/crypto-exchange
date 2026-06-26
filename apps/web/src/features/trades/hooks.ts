"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { buyCoin, sellCoin } from "@/features/trades/api";
import type { BuyTradeInput, SellTradeInput } from "@/features/trades/types";

function useTradeInvalidation() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["markets"] });
  };
}

export function useBuyTrade(token: string | null) {
  const invalidateTradeData = useTradeInvalidation();

  return useMutation({
    mutationFn: (input: BuyTradeInput) => buyCoin(token!, input),
    onSuccess: invalidateTradeData,
  });
}

export function useSellTrade(token: string | null) {
  const invalidateTradeData = useTradeInvalidation();

  return useMutation({
    mutationFn: (input: SellTradeInput) => sellCoin(token!, input),
    onSuccess: invalidateTradeData,
  });
}
