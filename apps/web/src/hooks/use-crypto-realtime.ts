"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  connectRealtime,
  disconnectRealtime,
} from "@/lib/realtime/socket.client";
import { useRealtimeStore } from "@/store/realtime-store";
import { useToastStore } from "@/store/toast-store";

export function useCryptoRealtime(token?: string) {
  const queryClient = useQueryClient();
  const markPriceUpdate = useRealtimeStore((state) => state.markPriceUpdate);
  const reconnectRequestId = useRealtimeStore(
    (state) => state.reconnectRequestId,
  );
  const setRealtimeStatus = useRealtimeStore((state) => state.setStatus);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (!token) {
      setRealtimeStatus("offline");
      return;
    }

    setRealtimeStatus("reconnecting");
    const socket = connectRealtime(token);

    function handleMarketPricesUpdated() {
      markPriceUpdate();

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
      setRealtimeStatus("live");
      console.log("[socket] connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setRealtimeStatus("offline");
    });

    socket.on("connect_error", (error) => {
      setRealtimeStatus("offline");
      console.error("[socket] connection error:", error.message);
    });

    socket.io.on("reconnect_attempt", () => {
      setRealtimeStatus("reconnecting");
    });

    socket.io.on("reconnect", () => {
      setRealtimeStatus("live");
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

      socket.io.off("reconnect_attempt");
      socket.io.off("reconnect");

      disconnectRealtime();
    };
  }, [
    markPriceUpdate,
    reconnectRequestId,
    setRealtimeStatus,
    token,
    queryClient,
    showToast,
  ]);
}
