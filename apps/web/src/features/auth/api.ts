import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/lib/api-types";

import type {
  AuthSession,
  AuthUser,
  LoginInput,
  RegisterInput,
  RegisterResult,
} from "@/features/auth/types";

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await apiClient.post<
    ApiSuccessResponse<AuthSession>,
    LoginInput
  >("/api/auth/login", input);

  return response.data;
}

export async function registerUser(
  input: RegisterInput,
): Promise<RegisterResult> {
  const response = await apiClient.post<
    ApiSuccessResponse<RegisterResult>,
    RegisterInput
  >("/api/auth/register", input);

  return response.data;
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await apiClient.get<ApiSuccessResponse<AuthUser>>(
    "/api/auth/me",
    {
      token,
    },
  );

  return response.data;
}
