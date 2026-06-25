export type WalletAsset = {
  id: string;
  amount: string;
  averageBuyPrice: string;
  currentPrice: string;
  currentValue: string;
  costBasis: string;
  profitLoss: string;
  profitLossPercent: string;

  coin: {
    id: string;
    name: string;
    symbol: string;
    image: string | null;
    change24h: string;
  };
};

export type WalletSummary = {
  cashBalanceUsd: string;
  totalAssetValue: string;
  totalCostBasis: string;
  totalProfitLoss: string;
  totalProfitLossPercent: string;
  totalPortfolioValue: string;
  assetCount: number;
};

export type Wallet = {
  id: string;
  balanceUsd: string;
  assets: WalletAsset[];
  summary: WalletSummary;
  createdAt: string;
  updatedAt: string;
};
