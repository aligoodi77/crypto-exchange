import { prisma } from "../lib/prisma.js";
import type { AppJwtPayload } from "../utils/jwt.js";

export async function revokeToken(payload: AppJwtPayload) {
  const now = new Date();
  const expiresAt = new Date(payload.exp * 1000);

  await prisma.$transaction(async (tx) => {
    // Token haye expired dige arzesh check kardan ندارن.
    await tx.revokedToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // upsert yani age logout dobar seda zade shod error nadim.
    await tx.revokedToken.upsert({
      where: {
        tokenId: payload.jti,
      },

      update: {
        expiresAt,
      },

      create: {
        tokenId: payload.jti,
        userId: payload.userId,
        expiresAt,
      },
    });
  });

  return {
    expiresAt,
  };
}

export async function isTokenRevoked(tokenId: string) {
  const revokedToken = await prisma.revokedToken.findUnique({
    where: {
      tokenId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(revokedToken);
}
