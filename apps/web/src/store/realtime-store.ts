"use client";

import { create } from "zustand";

export type RealtimeStatus = "live" | "reconnecting" | "offline";

type RealtimeState = {
  status: RealtimeStatus;
  lastPriceUpdateAt: string | null;
  reconnectRequestId: number;
  setStatus: (status: RealtimeStatus) => void;
  markPriceUpdate: () => void;
  requestReconnect: () => void;
};

export const useRealtimeStore = create<RealtimeState>((set) => ({
  status: "offline",
  lastPriceUpdateAt: null,
  reconnectRequestId: 0,

  setStatus: (status) => set({ status }),

  markPriceUpdate: () =>
    set({
      lastPriceUpdateAt: new Date().toISOString(),
    }),

  requestReconnect: () =>
    set((state) => ({
      status: "reconnecting",
      reconnectRequestId: state.reconnectRequestId + 1,
    })),
}));
