export type TradeSide = "buy" | "sell";

export type TradeResult = {
  wallet: {
    id: string;
    balanceUsd: string;
  };
  asset: {
    id: string;
    amount: string;
    averageBuyPrice: string;
    coin: {
      id: string;
      name: string;
      symbol: string;
      image: string | null;
      price: string;
    };
  } | null;
  transaction: {
    id: string;
    type: "BUY" | "SELL";
    amount: string;
    price: string;
    grossTotal: string;
    fee: string;
    chargedUsd?: string;
    receivedUsd?: string;
    feePercent: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    coin: {
      id: string;
      name: string;
      symbol: string;
      image: string | null;
    } | null;
    createdAt: string;
  };
};

export type BuyTradeInput = {
  symbol: string;
  usdAmount: string;
  idempotencyKey: string;
};

export type SellTradeInput = {
  symbol: string;
  coinAmount: string;
  idempotencyKey: string;
};
