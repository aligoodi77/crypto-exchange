import type { Request, Response, NextFunction } from "express";

import { prisma } from "../lib/prisma.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

export async function adminMiddleware(
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
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Admin access is required",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
