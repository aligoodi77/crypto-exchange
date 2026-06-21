import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";
import {
  createRawVerificationToken,
  hashVerificationToken,
} from "../utils/verification-token.js";
import { sendVerificationEmail } from "./email.service.js";

function getTokenExpiryDate() {
  const rawMinutes = process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES || "60";

  const minutes = Number(rawMinutes);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error(
      "EMAIL_VERIFICATION_TOKEN_TTL_MINUTES must be a positive number",
    );
  }

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + minutes);

  return expiresAt;
}

export async function createAndSendVerificationEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.emailVerifiedAt) {
    throw new AppError("Email is already verified", 400);
  }

  const rawToken = createRawVerificationToken();
  const tokenHash = hashVerificationToken(rawToken);
  const expiresAt = getTokenExpiryDate();

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: "EMAIL_VERIFICATION",
      },
    });

    await tx.verificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });
  });

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationToken: rawToken,
  });

  return {
    expiresAt,
  };
}

export async function verifyEmailByToken(rawToken: string) {
  const tokenHash = hashVerificationToken(rawToken);

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!verificationToken) {
    throw new AppError("Invalid or expired verification token", 400);
  }

  if (verificationToken.type !== "EMAIL_VERIFICATION") {
    throw new AppError("Invalid verification token type", 400);
  }

  if (verificationToken.expiresAt.getTime() < Date.now()) {
    await prisma.verificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });

    throw new AppError("Verification token has expired", 400);
  }

  const verifiedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerifiedAt: verifiedAt,
      },
    });

    await tx.verificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });
  });

  return {
    email: verificationToken.user.email,
    emailVerifiedAt: verifiedAt,
  };
}
