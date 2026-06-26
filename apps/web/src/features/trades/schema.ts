import { z } from "zod";

const decimalRegex = /^\d+(\.\d+)?$/;

export const orderSchema = z.object({
  side: z.enum(["buy", "sell"]),
  amount: z
    .string()
    .trim()
    .regex(decimalRegex, "Enter a positive decimal amount.")
    .refine((value) => Number(value) > 0, "Amount must be greater than 0."),
});

export const tradingFeePercent =
  Number(process.env.NEXT_PUBLIC_TRADING_FEE_PERCENT ?? "0.2") || 0.2;

export const tradingFeeRate = tradingFeePercent / 100;
