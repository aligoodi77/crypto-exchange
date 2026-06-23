import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";

export const tradingFeePercent = new Prisma.Decimal(env.tradingFeePercent);

export const tradingFeeRate = tradingFeePercent.div(100);

export function calculateTradingFee(grossTotal: Prisma.Decimal) {
  return grossTotal.mul(tradingFeeRate);
}
