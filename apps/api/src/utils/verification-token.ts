import { createHash, randomBytes } from "node:crypto";

export function createRawVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

export function createVerificationCode(): string {
  return randomBytes(4).readUInt32BE(0).toString().padStart(10, "0").slice(0, 6);
}

export function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
