import { prisma } from "../src/lib/prisma";

const coins = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    price: "68742.31",
    change24h: "2.45",
    marketCap: "1360000000000",
    volume24h: "24210000000",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    price: "3721.41",
    change24h: "1.86",
    marketCap: "447810000000",
    volume24h: "14320000000",
  },
  {
    name: "Tether",
    symbol: "USDT",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    price: "1.00",
    change24h: "0.01",
    marketCap: "112570000000",
    volume24h: "52910000000",
  },
  {
    name: "BNB",
    symbol: "BNB",
    image:
      "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    price: "589.27",
    change24h: "-0.74",
    marketCap: "86190000000",
    volume24h: "1320000000",
  },
  {
    name: "Solana",
    symbol: "SOL",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    price: "164.35",
    change24h: "4.32",
    marketCap: "77010000000",
    volume24h: "3210000000",
  },
];

async function main() {
  console.log("Start seeding coins...");

  for (const coin of coins) {
    await prisma.coin.upsert({
      where: {
        symbol: coin.symbol,
      },
      update: coin,
      create: coin,
    });
  }

  console.log("Coins seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
