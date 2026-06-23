const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const COINGECKO_TIMEOUT_MS = 5000;
const COINGECKO_CACHE_TTL_MS = 60_000;
const COINGECKO_MAX_ATTEMPTS = 3;

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

type CachedMarketCoins = {
  expiresAt: number;
  data: CoinGeckoMarketCoin[];
};

const marketCoinsCache = new Map<string, CachedMarketCoins>();

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithTimeout(url: string, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, COINGECKO_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchMarketCoins(ids = DEFAULT_COIN_IDS) {
  const cacheKey = [...ids].sort().join(",");
  const cached = marketCoinsCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

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

  const url = `${COINGECKO_BASE_URL}/coins/markets?${params}`;

  for (let attempt = 1; attempt <= COINGECKO_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, headers);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`CoinGecko API failed: ${response.status} ${message}`);
      }

      const data = (await response.json()) as CoinGeckoMarketCoin[];

      marketCoinsCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + COINGECKO_CACHE_TTL_MS,
      });

      return data;
    } catch (error) {
      if (attempt === COINGECKO_MAX_ATTEMPTS) {
        throw error;
      }

      await sleep(200 * attempt);
    }
  }

  throw new Error("CoinGecko API failed");
}
