const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

const DEFAULT_COIN_IDS = [
  "bitcoin",
  "ethereum",
  "tether",
  "binancecoin",
  "solana",
];

type CoinGeckoMarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number | null;
  total_volume: number | null;
};

export async function fetchMarketCoins(ids = DEFAULT_COIN_IDS) {
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: ids.join(","),
    order: "market_cap_desc",
    per_page: String(ids.length),
    page: "1",
    sparkline: "false",
    price_change_percentage: "24h",
  });

  const headers: Record<string, string> = {};

  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?${params}`, {
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`CoinGecko API failed: ${response.status} ${message}`);
  }

  return response.json() as Promise<CoinGeckoMarketCoin[]>;
}
