import { z } from "zod";

const positiveDecimalInput = (fieldName: string) =>
  z.union([
    z.number().positive(`${fieldName} must be greater than 0`).finite(),
    z
      .string()
      .trim()
      .regex(/^\d+(\.\d+)?$/, `${fieldName} must be a positive decimal`)
      .refine(
        (value) => !/^0+(\.0+)?$/.test(value),
        `${fieldName} must be greater than 0`,
      ),
  ]);

export const buyCoinSchema = z.object({
  symbol: z.string().min(1, "Coin symbol is required"),
  usdAmount: positiveDecimalInput("USD amount"),
});

export const sellCoinSchema = z.object({
  symbol: z.string().min(1, "Coin symbol is required"),
  coinAmount: positiveDecimalInput("Coin amount"),
});

export type BuyCoinInput = z.infer<typeof buyCoinSchema>;
export type SellCoinInput = z.infer<typeof sellCoinSchema>;
