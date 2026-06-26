import { z } from "zod";

const passwordMessage =
  "Password must be at least 8 characters and include lowercase, uppercase, and a symbol.";

export const passwordSchema = z
  .string()
  .min(8, passwordMessage)
  .regex(/[a-z]/, passwordMessage)
  .regex(/[A-Z]/, passwordMessage)
  .regex(/[^A-Za-z0-9]/, passwordMessage);

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),

  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),

    email: z.string().trim().email("Please enter a valid email address."),

    password: passwordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginFormValues = z.infer<typeof loginSchema>;

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name must be at most 60 characters."),
  avatarUrl: z
    .string()
    .max(500_000, "Profile image is too large.")
    .nullable()
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password.",
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const verifyEmailCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export type VerifyEmailCodeFormValues = z.infer<typeof verifyEmailCodeSchema>;
