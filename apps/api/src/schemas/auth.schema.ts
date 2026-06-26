import { z } from "zod";

const passwordMessage =
  "Password must be at least 8 characters and include lowercase, uppercase, and a symbol";

export const passwordSchema = z
  .string()
  .min(8, passwordMessage)
  .regex(/[a-z]/, passwordMessage)
  .regex(/[A-Z]/, passwordMessage)
  .regex(/[^A-Za-z0-9]/, passwordMessage);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((email) => email.toLowerCase()),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((email) => email.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be at most 60 characters"),
  avatarUrl: z
    .string()
    .trim()
    .max(500_000, "Profile image is too large")
    .refine(
      (value) =>
        value === "" ||
        value.startsWith("data:image/jpeg;base64,") ||
        value.startsWith("data:image/png;base64,") ||
        value.startsWith("data:image/webp;base64,") ||
        value.startsWith("https://") ||
        value.startsWith("http://"),
      "Profile image must be a PNG, JPG, WEBP, or image URL",
    )
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const verifyEmailQuerySchema = z.object({
  token: z.string().min(32, "Verification token is invalid"),
});

export const verifyEmailCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type VerifyEmailQueryInput = z.infer<typeof verifyEmailQuerySchema>;
export type VerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>;
export type VerifyEmailCodeInput = z.infer<typeof verifyEmailCodeSchema>;
