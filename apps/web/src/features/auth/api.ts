import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/lib/api-types";

import type {
  AuthSession,
  AuthUser,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  RegisterResult,
  ResendVerificationResult,
  UpdateProfileInput,
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

export async function updateProfile(
  token: string,
  input: UpdateProfileInput,
): Promise<AuthUser> {
  const response = await apiClient.patch<
    ApiSuccessResponse<AuthUser>,
    UpdateProfileInput
  >("/api/auth/me", input, {
    token,
  });

  return response.data;
}

export async function changePassword(
  token: string,
  input: ChangePasswordInput,
): Promise<AuthUser> {
  const response = await apiClient.patch<
    ApiSuccessResponse<AuthUser>,
    ChangePasswordInput
  >("/api/auth/me/password", input, {
    token,
  });

  return response.data;
}

export async function resendVerificationEmail(
  token: string,
): Promise<ResendVerificationResult> {
  const response = await apiClient.post<
    ApiSuccessResponse<ResendVerificationResult>,
    Record<string, never>
  >("/api/auth/resend-verification-email", {}, {
    token,
  });

  return response.data;
}

export async function logout(token: string): Promise<string> {
  const response = await apiClient.post<
    ApiSuccessResponse<string>,
    Record<string, never>
  >("/api/auth/logout", {}, {
    token,
  });

  return response.data;
}
