import { z } from "zod";

export const getMarketsQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(20),
  search: z.string().trim().max(50, "Search is too long").optional(),
  sortBy: z
    .enum(["marketCap", "price", "change24h", "volume24h", "name"])
    .default("marketCap"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type GetMarketsQuery = z.infer<typeof getMarketsQuerySchema>;
