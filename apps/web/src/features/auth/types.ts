export type AuthRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: AuthRole;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
};

export type RegisterResult = AuthSession & {
  emailVerificationRequired: boolean;
  verificationEmailSent: boolean;
};

export type UpdateProfileInput = {
  name: string;
  avatarUrl?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ResendVerificationResult = {
  email: string;
  expiresAt: string;
};

export type VerifyEmailCodeInput = {
  code: string;
};
