import { prisma } from "../lib/prisma.js";
import { fetchMarketCoins } from "./coingecko.service.js";

export async function syncCoinMarketData() {
  const liveCoins = await fetchMarketCoins();

  const syncedCoins = await Promise.all(
    liveCoins.map((coin) =>
      prisma.coin.upsert({
        where: {
          symbol: coin.symbol.toUpperCase(),
        },

        update: {
          name: coin.name,
          image: coin.image,
          price: String(coin.current_price ?? 0),
          change24h: String(coin.price_change_percentage_24h ?? 0),
          marketCap: String(coin.market_cap ?? 0),
          volume24h: String(coin.total_volume ?? 0),
        },

        create: {
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          image: coin.image,
          price: String(coin.current_price ?? 0),
          change24h: String(coin.price_change_percentage_24h ?? 0),
          marketCap: String(coin.market_cap ?? 0),
          volume24h: String(coin.total_volume ?? 0),
        },
      }),
    ),
  );

  return syncedCoins;
}
