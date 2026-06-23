"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  connectRealtime,
  disconnectRealtime,
} from "@/lib/realtime/socket.client";

export function useCryptoRealtime(token?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = connectRealtime(token);

    function handleMarketPricesUpdated() {
      queryClient.invalidateQueries({
        queryKey: ["markets"],
      });
    }

    function handlePortfolioUpdated() {
      queryClient.invalidateQueries({
        queryKey: ["wallet"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    }

    function handleTradeCompleted() {
      queryClient.invalidateQueries({
        queryKey: ["wallet"],
      });

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    }

    socket.on("connect", () => {
      console.log("[socket] connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("[socket] connection error:", error.message);
    });

    socket.on("market:prices-updated", handleMarketPricesUpdated);

    socket.on("portfolio:updated", handlePortfolioUpdated);

    socket.on("trade:completed", handleTradeCompleted);

    return () => {
      socket.off("market:prices-updated", handleMarketPricesUpdated);

      socket.off("portfolio:updated", handlePortfolioUpdated);

      socket.off("trade:completed", handleTradeCompleted);

      disconnectRealtime();
    };
  }, [token, queryClient]);
}
