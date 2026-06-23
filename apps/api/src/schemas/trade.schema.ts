import { z } from "zod";

export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8, "Idempotency-Key must be at least 8 characters")
  .max(128, "Idempotency-Key must be at most 128 characters")
  .regex(
    /^[A-Za-z0-9._:-]+$/,
    "Idempotency-Key can only contain letters, numbers, dots, underscores, colons, and hyphens",
  );

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
