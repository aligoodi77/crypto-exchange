import { z } from "zod";

export const transactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),

  type: z.enum(["BUY", "SELL"]).optional(),
});

export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;
