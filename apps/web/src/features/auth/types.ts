export type AuthRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
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
