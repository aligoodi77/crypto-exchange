import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/lib/api-types";

import type {
  BuyTradeInput,
  SellTradeInput,
  TradeResult,
} from "@/features/trades/types";

export async function buyCoin(
  token: string,
  input: BuyTradeInput,
): Promise<TradeResult> {
  const response = await apiClient.post<
    ApiSuccessResponse<TradeResult>,
    { symbol: string; usdAmount: string }
  >(
    "/api/trades/buy",
    {
      symbol: input.symbol,
      usdAmount: input.usdAmount,
    },
    {
      token,
      headers: {
        "Idempotency-Key": input.idempotencyKey,
      },
    },
  );

  return response.data;
}

export async function sellCoin(
  token: string,
  input: SellTradeInput,
): Promise<TradeResult> {
  const response = await apiClient.post<
    ApiSuccessResponse<TradeResult>,
    { symbol: string; coinAmount: string }
  >(
    "/api/trades/sell",
    {
      symbol: input.symbol,
      coinAmount: input.coinAmount,
    },
    {
      token,
      headers: {
        "Idempotency-Key": input.idempotencyKey,
      },
    },
  );

  return response.data;
}
