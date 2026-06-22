export const SOCKET_EVENTS = {
  MARKET_PRICES_UPDATED: "market:prices-updated",

  PORTFOLIO_UPDATED: "portfolio:updated",

  TRADE_COMPLETED: "trade:completed",

  ADMIN_MARKET_SYNC_COMPLETED: "admin:market-sync-completed",
} as const;

export type TradeEventType = "BUY" | "SELL";
