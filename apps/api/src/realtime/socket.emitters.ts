import type { Coin } from "@prisma/client";

import { SOCKET_EVENTS, type TradeEventType } from "./socket.events.js";
import { getIO } from "./socket.server.js";
import { ADMIN_ROOM, getUserRoom, MARKET_ROOM } from "./socket.rooms.js";

function serializeMarketCoin(coin: Coin) {
  return {
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    image: coin.image,

    price: coin.price.toString(),
    change24h: coin.change24h.toString(),
    marketCap: coin.marketCap.toString(),
    volume24h: coin.volume24h.toString(),

    updatedAt: coin.updatedAt,
  };
}

export function emitMarketPricesUpdated(coins: Coin[]) {
  const occurredAt = new Date().toISOString();

  const activeCoins = coins.filter((coin) => coin.isActive);

  const io = getIO();

  if (activeCoins.length > 0) {
    io.to(MARKET_ROOM).emit(SOCKET_EVENTS.MARKET_PRICES_UPDATED, {
      occurredAt,
      source: "coin-sync",
      coins: activeCoins.map(serializeMarketCoin),
    });
  }

  io.to(ADMIN_ROOM).emit(SOCKET_EVENTS.ADMIN_MARKET_SYNC_COMPLETED, {
    occurredAt,
    totalSyncedCoins: coins.length,
    activeSyncedCoins: activeCoins.length,
  });
}

export function emitPortfolioUpdated(userId: string, reason: TradeEventType) {
  getIO().to(getUserRoom(userId)).emit(SOCKET_EVENTS.PORTFOLIO_UPDATED, {
    occurredAt: new Date().toISOString(),
    reason,
  });
}

export function emitTradeCompleted(
  userId: string,
  data: {
    type: TradeEventType;
    symbol: string;
  },
) {
  getIO()
    .to(getUserRoom(userId))
    .emit(SOCKET_EVENTS.TRADE_COMPLETED, {
      occurredAt: new Date().toISOString(),
      ...data,
    });
}
