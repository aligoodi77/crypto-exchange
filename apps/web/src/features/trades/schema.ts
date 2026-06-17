import { z } from "zod";

export const orderSchema = z.object({
  side: z.enum(["buy", "sell"]),
  price: z.number().positive(),
  amount: z.number().positive(),
});
