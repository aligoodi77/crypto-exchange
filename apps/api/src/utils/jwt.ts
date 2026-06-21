import { randomUUID } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";

export type TokenClaims = {
  userId: string;
  role: "USER" | "ADMIN";
};

export type AppJwtPayload = TokenClaims & {
  jti: string;
  exp: number;
  iat?: number;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return secret;
}

export function signToken(payload: TokenClaims): string {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: "7d",
    jwtid: randomUUID(),
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

function isAppJwtPayload(payload: unknown): payload is AppJwtPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const data = payload as Record<string, unknown>;

  return (
    typeof data.userId === "string" &&
    (data.role === "USER" || data.role === "ADMIN") &&
    typeof data.jti === "string" &&
    typeof data.exp === "number"
  );
}

export function verifyToken(token: string): AppJwtPayload {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });

  if (!isAppJwtPayload(decoded)) {
    throw new Error("Invalid token payload");
  }

  return decoded;
}
