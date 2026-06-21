import type { Request, Response, NextFunction } from "express";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../schemas/auth.schema.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updateMyProfile,
  changeMyPassword,
} from "../services/auth.service.js";
import { revokeToken } from "../services/token.service.js";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    role: "USER" | "ADMIN";
  };
};

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);

    res.json({
      success: true,
      message: "Logged in successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function meController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await getCurrentUser(req.user.userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfileController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }
    const input = updateProfileSchema.parse(req.body);

    const user = await updateMyProfile(req.user.userId, input);
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const input = changePasswordSchema.parse(req.body);

    const user = await changeMyPassword(req.user.userId, input);
    res.json({
      success: true,
      message: "Password updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const result = await revokeToken(req.user);

    res.json({
      success: true,
      message: "Logged out successfully",
      data: result.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}
