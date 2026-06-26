"use client";

import { create } from "zustand";

const WATCHLIST_STORAGE_KEY = "coinbarrier.watchlist";

type WatchlistState = {
  symbols: string[];
  isHydrated: boolean;
  hydrate: () => void;
  isWatched: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
};

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function readStoredSymbols() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(WATCHLIST_STORAGE_KEY) ?? "[]",
    );

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function saveSymbols(symbols: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(symbols));
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  symbols: [],
  isHydrated: false,

  hydrate: () => {
    set({
      symbols: readStoredSymbols(),
      isHydrated: true,
    });
  },

  isWatched: (symbol) => get().symbols.includes(normalizeSymbol(symbol)),

  toggle: (symbol) => {
    const normalizedSymbol = normalizeSymbol(symbol);

    set((state) => {
      const symbols = state.symbols.includes(normalizedSymbol)
        ? state.symbols.filter((item) => item !== normalizedSymbol)
        : [...state.symbols, normalizedSymbol];

      saveSymbols(symbols);

      return { symbols };
    });
  },
}));
