import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  verifyEmailQuerySchema,
} from "../schemas/auth.schema.js";

import { buyCoinSchema, sellCoinSchema } from "../schemas/trade.schema.js";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description:
    "Paste only the JWT token here. Do not write the word Bearer manually.",
});

const ErrorResponseSchema = registry.register(
  "ErrorResponse",
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
);

const ValidationErrorResponseSchema = registry.register(
  "ValidationErrorResponse",
  z.object({
    success: z.literal(false),
    message: z.literal("Validation failed"),
    errors: z.array(
      z.object({
        path: z.string(),
        message: z.string(),
      }),
    ),
  }),
);

const PublicUserSchema = registry.register(
  "PublicUser",
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["USER", "ADMIN"]),
    emailVerified: z.boolean(),
    emailVerifiedAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

const WalletSchema = registry.register(
  "Wallet",
  z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    balanceUsd: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

const CurrentUserSchema = registry.register(
  "CurrentUser",
  PublicUserSchema.extend({
    wallet: WalletSchema,
  }),
);

const AuthSessionSchema = registry.register(
  "AuthSession",
  z.object({
    user: PublicUserSchema,
    token: z.string(),
    emailVerificationRequired: z.boolean().optional(),
    verificationEmailSent: z.boolean().optional(),
  }),
);

const CoinSnapshotSchema = registry.register(
  "CoinSnapshot",
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    symbol: z.string(),
    image: z.string().nullable(),
    price: z.string(),
  }),
);

const WalletAssetSnapshotSchema = registry.register(
  "WalletAssetSnapshot",
  z.object({
    id: z.string().uuid(),
    amount: z.string(),
    averageBuyPrice: z.string(),
    coin: CoinSnapshotSchema,
  }),
);

const TradeTransactionSchema = registry.register(
  "TradeTransaction",
  z.object({
    id: z.string().uuid(),
    type: z.enum(["BUY", "SELL"]),
    amount: z.string(),
    price: z.string(),
    grossTotal: z.string(),
    fee: z.string(),
    chargedUsd: z.string().optional(),
    receivedUsd: z.string().optional(),
    feePercent: z.string(),
    status: z.string(),
    coin: CoinSnapshotSchema.nullable(),
    createdAt: z.string().datetime(),
  }),
);

const TradeResultSchema = registry.register(
  "TradeResult",
  z.object({
    wallet: z.object({
      id: z.string().uuid(),
      balanceUsd: z.string(),
    }),
    asset: WalletAssetSnapshotSchema.nullable(),
    transaction: TradeTransactionSchema,
  }),
);

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["System"],
  summary: "Check API status",
  responses: {
    200: {
      description: "API is healthy",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("API is running"),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  description:
    "Creates a user, creates a wallet with demo USD balance, and attempts to send an email verification link.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema,
          example: {
            name: "Ali Goudarzi",
            email: "ali@example.com",
            password: "strong-password-123",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("User registered successfully"),
            data: AuthSessionSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: ValidationErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Email is already registered",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Log in",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema,
          example: {
            email: "ali@example.com",
            password: "strong-password-123",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Logged in successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("Logged in successfully"),
            data: AuthSessionSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: ValidationErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Invalid email or password",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  tags: ["Auth"],
  summary: "Get current user profile",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current authenticated user",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: CurrentUserSchema,
          }),
        },
      },
    },
    401: {
      description: "Missing, invalid, revoked, or expired token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/auth/me",
  tags: ["Auth"],
  summary: "Update current user profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateProfileSchema,
          example: {
            name: "Ali Goudarzi",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Profile updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("Profile updated successfully"),
            data: PublicUserSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid request body",
      content: {
        "application/json": {
          schema: ValidationErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/auth/me/password",
  tags: ["Auth"],
  summary: "Change password and invalidate old sessions",
  description:
    "After a successful password change, previously issued tokens become invalid.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: changePasswordSchema,
          example: {
            currentPassword: "strong-password-123",
            newPassword: "new-strong-password-456",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Password updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("Password updated successfully"),
            data: PublicUserSchema,
          }),
        },
      },
    },
    400: {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: ValidationErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized or current password is incorrect",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: ["Auth"],
  summary: "Log out current session",
  description: "Revokes the current JWT. The same token cannot be used again.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Logged out successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("Logged out successfully"),
            data: z.string().datetime(),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/verify-email",
  tags: ["Auth"],
  summary: "Verify email address",
  request: {
    query: verifyEmailQuerySchema,
  },
  responses: {
    200: {
      description: "Email verified successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("Email verified successfully"),
            data: z.object({
              email: z.string().email(),
              emailVerifiedAt: z.string().datetime(),
            }),
          }),
        },
      },
    },
    400: {
      description: "Invalid, expired, or already-used verification token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/resend-verification-email",
  tags: ["Auth"],
  summary: "Resend verification email",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Verification email sent successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("Verification email sent successfully"),
            data: z.object({
              expiresAt: z.string().datetime(),
            }),
          }),
        },
      },
    },
    400: {
      description: "Email is already verified",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/trades/buy",
  tags: ["Trades"],
  summary: "Buy a cryptocurrency",
  description:
    "Requires a valid JWT and a verified email address. Trading fee is calculated server-side.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: buyCoinSchema,
          example: {
            symbol: "BTC",
            usdAmount: 100,
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Coin bought successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("Coin bought successfully"),
            data: TradeResultSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid request, insufficient balance, or unavailable coin",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Email verification required",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    429: {
      description: "Trade rate limit reached",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/trades/sell",
  tags: ["Trades"],
  summary: "Sell a cryptocurrency",
  description:
    "Requires a valid JWT and a verified email address. Trading fee is calculated server-side.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: sellCoinSchema,
          example: {
            symbol: "BTC",
            coinAmount: 0.001,
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Coin sold successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.literal("Coin sold successfully"),
            data: TradeResultSchema,
          }),
        },
      },
    },
    400: {
      description:
        "Invalid request, insufficient coin balance, or unavailable coin",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Email verification required",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    429: {
      description: "Trade rate limit reached",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const generator = new OpenApiGeneratorV31(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.1.0",
  info: {
    title: "Crypto Exchange API",
    version: "1.0.0",
    description:
      "Portfolio crypto exchange simulator API. No real payments, withdrawals, or on-chain transfers are processed.",
  },
  servers: [
    {
      url: "/",
      description: "Current API server",
    },
  ],
});
