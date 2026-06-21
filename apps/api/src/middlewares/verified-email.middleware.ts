import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

export async function verifiedEmailMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: authenticatedReq.user.userId,
      },
      select: {
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (!user.emailVerifiedAt) {
      res.status(403).json({
        success: false,
        message: "Please verify your email before trading",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
