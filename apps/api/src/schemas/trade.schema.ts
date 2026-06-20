import { z } from "zod";

export const buyCoinSchema = z.object({
  symbol: z.string().min(1, "Coin symbol is required"),
  usdAmount: z.number().positive("USD amount must be greater than 0"),
});

export const sellCoinSchema = z.object({
  symbol: z.string().min(1, "Coin symbol is required"),
  coinAmount: z.number().positive("Coin amount must be greater than 0"),
});

export type BuyCoinInput = z.infer<typeof buyCoinSchema>;
export type SellCoinInput = z.infer<typeof sellCoinSchema>;
