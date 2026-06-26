"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  connectRealtime,
  disconnectRealtime,
} from "@/lib/realtime/socket.client";
import { useToastStore } from "@/store/toast-store";

export function useCryptoRealtime(token?: string) {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

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

      showToast({
        title: "Trade completed",
        description: "Wallet and transaction history were refreshed.",
        tone: "success",
      });
    }

    function handleAdminMarketSyncCompleted() {
      queryClient.invalidateQueries({
        queryKey: ["markets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin"],
      });

      showToast({
        title: "Market sync completed",
        tone: "info",
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

    socket.on("admin:market-sync-completed", handleAdminMarketSyncCompleted);

    return () => {
      socket.off("market:prices-updated", handleMarketPricesUpdated);

      socket.off("portfolio:updated", handlePortfolioUpdated);

      socket.off("trade:completed", handleTradeCompleted);

      socket.off("admin:market-sync-completed", handleAdminMarketSyncCompleted);

      disconnectRealtime();
    };
  }, [token, queryClient, showToast]);
}
