import { Prisma } from "@prisma/client";

const rawFeePercent = process.env.TRADING_FEE_PERCENT ?? "0.2";

export const tradingFeePercent = new Prisma.Decimal(rawFeePercent);

if (tradingFeePercent.lt(0) || tradingFeePercent.gt(100)) {
  throw new Error("TRADING_FEE_PERCENT must be between 0 and 100");
}

export const tradingFeeRate = tradingFeePercent.div(100);

export function calculateTradingFee(grossTotal: Prisma.Decimal) {
  return grossTotal.mul(tradingFeeRate);
}
