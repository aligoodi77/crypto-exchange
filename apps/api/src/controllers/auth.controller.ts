import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "node:crypto";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  verifyEmailCodeSchema,
} from "../schemas/auth.schema.js";
import {
  getCurrentUser,
  loginWithOAuthProvider,
  loginUser,
  registerUser,
  updateMyProfile,
  changeMyPassword,
} from "../services/auth.service.js";
import { revokeToken } from "../services/token.service.js";
import {
  createAndSendVerificationEmail,
  verifyEmailByCode,
  verifyEmailByToken,
} from "../services/email-verification.service.js";

import { verifyEmailQuerySchema } from "../schemas/auth.schema.js";
import {
  disconnectTokenSockets,
  disconnectUserSockets,
} from "../realtime/socket.server.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { env } from "../config/env.js";

type OAuthProviderParam = "google" | "github";

const oauthProviders = ["google", "github"] as const;

function isOAuthProviderParam(value: string): value is OAuthProviderParam {
  return oauthProviders.includes(value as OAuthProviderParam);
}

function toOAuthProvider(value: OAuthProviderParam) {
  return value === "google" ? "GOOGLE" : "GITHUB";
}

function getOAuthCookieName(provider: OAuthProviderParam) {
  return `coinbarrier.oauth.${provider}.state`;
}

function readCookie(req: Request, name: string) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(name.length + 1));
}

function getRequestOrigin(req: Request) {
  return `${req.protocol}://${req.get("host")}`;
}

function getOAuthRedirectUri(req: Request, provider: OAuthProviderParam) {
  return `${getRequestOrigin(req)}/api/auth/oauth/${provider}/callback`;
}

function redirectToLoginWithOAuthError(res: Response, message: string) {
  const redirectUrl = new URL("/login", env.frontendUrl);
  redirectUrl.searchParams.set("oauthError", message);
  res.redirect(redirectUrl.toString());
}

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

export function oauthStartController(req: Request, res: Response) {
  const provider = req.params.provider;

  if (typeof provider !== "string" || !isOAuthProviderParam(provider)) {
    res.status(404).json({
      success: false,
      message: "OAuth provider is not supported",
    });
    return;
  }

  const redirectUri = getOAuthRedirectUri(req, provider);
  const state = randomBytes(24).toString("hex");
  const cookieName = getOAuthCookieName(provider);

  res.cookie(cookieName, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: 10 * 60 * 1000,
    path: `/api/auth/oauth/${provider}/callback`,
  });

  if (provider === "google") {
    if (!env.googleClientId || !env.googleClientSecret) {
      res.status(503).json({
        success: false,
        message: "Google OAuth is not configured",
      });
      return;
    }

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", env.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    res.redirect(url.toString());
    return;
  }

  if (!env.githubClientId || !env.githubClientSecret) {
    res.status(503).json({
      success: false,
      message: "GitHub OAuth is not configured",
    });
    return;
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.githubClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  res.redirect(url.toString());
}

export async function oauthCallbackController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const provider = req.params.provider;

    if (typeof provider !== "string" || !isOAuthProviderParam(provider)) {
      redirectToLoginWithOAuthError(res, "OAuth provider is not supported");
      return;
    }

    const queryCode = req.query.code;
    const queryState = req.query.state;
    const storedState = readCookie(req, getOAuthCookieName(provider));

    res.clearCookie(getOAuthCookieName(provider), {
      path: `/api/auth/oauth/${provider}/callback`,
    });

    if (
      typeof queryCode !== "string" ||
      typeof queryState !== "string" ||
      !storedState ||
      queryState !== storedState
    ) {
      redirectToLoginWithOAuthError(res, "OAuth sign in could not be verified");
      return;
    }

    const result = await loginWithOAuthProvider(
      toOAuthProvider(provider),
      queryCode,
      getOAuthRedirectUri(req, provider),
    );

    res.redirect(new URL(result.redirectPath, env.frontendUrl).toString());
  } catch (error) {
    if (error instanceof Error) {
      redirectToLoginWithOAuthError(res, error.message);
      return;
    }

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

export async function verifyEmailCodeController(
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

    const { code } = verifyEmailCodeSchema.parse(req.body);
    const result = await verifyEmailByCode(req.user.userId, code);

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
