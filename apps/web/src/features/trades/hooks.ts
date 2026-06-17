"use client";

import { useMutation } from "@tanstack/react-query";
import { placeOrder } from "@/features/trades/api";

export function usePlaceOrder() {
  return useMutation({ mutationFn: placeOrder });
}
