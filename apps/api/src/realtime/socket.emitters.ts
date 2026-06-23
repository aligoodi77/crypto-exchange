import type { Coin } from "@prisma/client";

import { SOCKET_EVENTS, type TradeEventType } from "./socket.events.js";
import { getIO, getOptionalIO } from "./socket.server.js";
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
  const io = getOptionalIO();

  // Standalone cron ya sync script Socket.IO nadare.
  // Pas event emit nemishe, vali sync ham fail nemishe.
  if (!io) {
    return;
  }

  io.to(MARKET_ROOM).emit("market:prices-updated", {
    occurredAt: new Date().toISOString(),
    coins: coins.map(serializeMarketCoin),
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
