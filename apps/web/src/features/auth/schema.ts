import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2),
  confirmPassword: z.string().min(8),
  referralCode: z.string().optional(),
});
