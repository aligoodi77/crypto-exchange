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
import {
  createAndSendVerificationEmail,
  verifyEmailByToken,
} from "../services/email-verification.service.js";

import { verifyEmailQuerySchema } from "../schemas/auth.schema.js";
import {
  disconnectTokenSockets,
  disconnectUserSockets,
} from "../realtime/socket.server.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

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
    disconnectUserSockets(req.user.userId);

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
    disconnectTokenSockets(req.user.jti);

    res.json({
      success: true,
      message: "Logged out successfully",
      data: result.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = verifyEmailQuerySchema.parse(req.query);

    const result = await verifyEmailByToken(token);

    res.json({
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function resendVerificationEmailController(
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

    const result = await createAndSendVerificationEmail(req.user.userId);

    res.json({
      success: true,
      message: "Verification email sent successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
