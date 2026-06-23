import bcrypt from "bcrypt";
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

const SALT_ROUNDS = 10;

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: Boolean(user.emailVerifiedAt),
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(input: RegisterInput) {
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
