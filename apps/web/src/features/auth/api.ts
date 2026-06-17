import type { AuthUser } from "@/features/auth/types";

export async function login(): Promise<AuthUser> {
  return { id: "mock-user", fullName: "Ali Goudarzi", email: "ali@example.com" };
}
