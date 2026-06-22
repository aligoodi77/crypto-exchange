import { z } from "zod";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const adminUsersQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).max(100).optional(),
});

export const adminTransactionsQuerySchema = paginationSchema.extend({
  type: z.enum(["BUY", "SELL"]).optional(),

  userId: z.string().uuid().optional(),
});

export const updateCoinStatusSchema = z.object({
  isActive: z.boolean(),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid id"),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;

export type AdminTransactionsQuery = z.infer<
  typeof adminTransactionsQuerySchema
>;

export type UpdateCoinStatusInput = z.infer<
  typeof updateCoinStatusSchema
>;
