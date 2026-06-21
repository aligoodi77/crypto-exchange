import type { Request, Response, NextFunction } from "express";
import { isTokenRevoked } from "../services/token.service.js";
import { verifyToken, type AppJwtPayload } from "../utils/jwt.js";

export type AuthenticatedRequest = Request & {
  user?: AppJwtPayload;
};

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authorization token is missing",
    });
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authorization token is missing",
    });
    return;
  }

  let payload: AppJwtPayload;

  try {
    payload = verifyToken(token);
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }

  try {
    const revoked = await isTokenRevoked(payload.jti);

    if (revoked) {
      res.status(401).json({
        success: false,
        message: "Token has been revoked. Please log in again.",
      });
      return;
    }

    (req as AuthenticatedRequest).user = payload;

    next();
  } catch (error) {
    next(error);
  }
}
