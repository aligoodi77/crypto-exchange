import bcrypt from "bcrypt";
import { resolveMx } from "node:dns/promises";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "../schemas/auth.schema.js";
import { AppError } from "../utils/app-error.js";
import { createAndSendVerificationEmail } from "./email-verification.service.js";
import { env } from "../config/env.js";

const SALT_ROUNDS = 10;

type OAuthProvider = "GOOGLE" | "GITHUB";

async function assertEmailDomainCanReceiveMail(email: string) {
  const domain = email.split("@")[1];

  if (!domain) {
    throw new AppError("Invalid email address", 400);
  }

  try {
    const records = await resolveMx(domain);

    if (
      records.length === 0 ||
      records.every((record) => record.exchange === ".")
    ) {
      throw new AppError("Email address domain cannot receive email", 400);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Email address domain cannot receive email", 400);
  }
}

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    emailVerified: Boolean(user.emailVerifiedAt),
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(input: RegisterInput) {
  await assertEmailDomainCanReceiveMail(input.email);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      wallet: {
        create: {
          balanceUsd: 10000,
        },
      },
    },
  });

  let verificationEmailSent = true;

  try {
    await createAndSendVerificationEmail(user.id);
  } catch (error) {
    verificationEmailSent = false;
    console.error("[email-verification] Failed to send:", error);

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    throw new AppError(
      "Email address could not be verified. Please use a valid email address.",
      400,
    );
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  return {
    user: sanitizeUser(user),
    token,
    emailVerificationRequired: !user.emailVerifiedAt,
    verificationEmailSent,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.passwordHash) {
    throw new AppError(
      "This account uses Google or GitHub sign in. Please continue with your connected provider.",
      401,
    );
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    emailVerified: Boolean(user.emailVerifiedAt),
    emailVerifiedAt: user.emailVerifiedAt,
    wallet: user.wallet,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateMyProfile(
  userId: string,
  input: UpdateProfileInput,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: input.name,
      ...(input.avatarUrl !== undefined
        ? {
            avatarUrl: input.avatarUrl || null,
          }
        : {}),
    },
  });

  return sanitizeUser(updatedUser);
}

export async function changeMyPassword(
  userId: string,
  input: ChangePasswordInput,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.passwordHash) {
    throw new AppError(
      "Set a password is not available for OAuth-only accounts yet.",
      400,
    );
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    input.currentPassword,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  const newPasswordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash: newPasswordHash,
      tokenVersion: {
        increment: 1,
      },
    },
  });

  return sanitizeUser(updatedUser);
}

function buildOAuthRedirectPath(token: string) {
  return `/oauth/callback?token=${encodeURIComponent(token)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function postOAuthToken(
  url: string,
  body: URLSearchParams,
): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload: unknown = await response.json();

  if (!response.ok || !isRecord(payload) || typeof payload.access_token !== "string") {
    throw new AppError("OAuth provider did not return an access token", 400);
  }

  return payload.access_token;
}

async function fetchGoogleProfile(code: string, redirectUri: string) {
  if (!env.googleClientId || !env.googleClientSecret) {
    throw new AppError("Google OAuth is not configured", 503);
  }

  const accessToken = await postOAuthToken(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  );

  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const profile: unknown = await response.json();

  if (
    !response.ok ||
    !isRecord(profile) ||
    typeof profile.sub !== "string" ||
    typeof profile.email !== "string"
  ) {
    throw new AppError("Could not read Google profile", 400);
  }

  if (profile.email_verified !== true) {
    throw new AppError("Google account email is not verified", 400);
  }

  return {
    providerAccountId: profile.sub,
    email: profile.email.toLowerCase(),
    name:
      typeof profile.name === "string" && profile.name.trim()
        ? profile.name
        : profile.email.split("@")[0] ?? "Google User",
    avatarUrl: typeof profile.picture === "string" ? profile.picture : null,
    emailVerified: true,
  };
}

async function fetchGithubProfile(code: string, redirectUri: string) {
  if (!env.githubClientId || !env.githubClientSecret) {
    throw new AppError("GitHub OAuth is not configured", 503);
  }

  const accessToken = await postOAuthToken(
    "https://github.com/login/oauth/access_token",
    new URLSearchParams({
      code,
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      redirect_uri: redirectUri,
    }),
  );

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "CoinBarrier",
    },
  });
  const githubUser: unknown = await userResponse.json();

  const emailResponse = await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "CoinBarrier",
    },
  });
  const emails: unknown = await emailResponse.json();

  if (
    !userResponse.ok ||
    !emailResponse.ok ||
    !isRecord(githubUser) ||
    typeof githubUser.id !== "number" ||
    !Array.isArray(emails)
  ) {
    throw new AppError("Could not read GitHub profile", 400);
  }

  const primaryEmail = emails.find(
    (email): email is Record<string, unknown> =>
      isRecord(email) &&
      email.primary === true &&
      typeof email.email === "string",
  );

  if (!primaryEmail || primaryEmail.verified !== true) {
    throw new AppError("GitHub account email is not verified", 400);
  }

  const fallbackLogin =
    typeof githubUser.login === "string" ? githubUser.login : "GitHub User";

  return {
    providerAccountId: String(githubUser.id),
    email: String(primaryEmail.email).toLowerCase(),
    name:
      typeof githubUser.name === "string" && githubUser.name.trim()
        ? githubUser.name
        : fallbackLogin,
    avatarUrl:
      typeof githubUser.avatar_url === "string" ? githubUser.avatar_url : null,
    emailVerified: true,
  };
}

export async function loginWithOAuthProvider(
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
) {
  const profile =
    provider === "GOOGLE"
      ? await fetchGoogleProfile(code, redirectUri)
      : await fetchGithubProfile(code, redirectUri);

  const now = new Date();

  const user = await prisma.$transaction(async (tx) => {
    const existingAccount = await tx.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingAccount) {
      return tx.user.update({
        where: {
          id: existingAccount.userId,
        },
        data: {
          name: existingAccount.user.name || profile.name,
          avatarUrl: existingAccount.user.avatarUrl ?? profile.avatarUrl,
          emailVerifiedAt: existingAccount.user.emailVerifiedAt ?? now,
        },
      });
    }

    const existingUser = await tx.user.findUnique({
      where: {
        email: profile.email,
      },
    });

    if (existingUser) {
      await tx.oAuthAccount.create({
        data: {
          provider,
          providerAccountId: profile.providerAccountId,
          userId: existingUser.id,
        },
      });

      return tx.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          avatarUrl: existingUser.avatarUrl ?? profile.avatarUrl,
          emailVerifiedAt: existingUser.emailVerifiedAt ?? now,
        },
      });
    }

    return tx.user.create({
      data: {
        name: profile.name,
        email: profile.email,
        passwordHash: null,
        avatarUrl: profile.avatarUrl,
        emailVerifiedAt: profile.emailVerified ? now : null,
        oauthAccounts: {
          create: {
            provider,
            providerAccountId: profile.providerAccountId,
          },
        },
        wallet: {
          create: {
            balanceUsd: 10000,
          },
        },
      },
    });
  });

  const token = signToken({
    userId: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  return {
    user: sanitizeUser(user),
    token,
    redirectPath: buildOAuthRedirectPath(token),
  };
}
