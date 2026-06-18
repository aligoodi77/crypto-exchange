import jwt from "jsonwebtoken";

export type AppJwtPayload = {
  userId: string;
  role: "USER" | "ADMIN";
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return secret;
}

export function signToken(payload: AppJwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

function isAppJwtPayload(payload: unknown): payload is AppJwtPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const data = payload as Record<string, unknown>;

  return (
    typeof data.userId === "string" &&
    (data.role === "USER" || data.role === "ADMIN")
  );
}

export function verifyToken(token: string): AppJwtPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (!isAppJwtPayload(decoded)) {
    throw new Error("Invalid token payload");
  }

  return decoded;
}
