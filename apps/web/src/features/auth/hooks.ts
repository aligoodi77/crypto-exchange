"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { getCurrentUser, login, registerUser } from "@/features/auth/api";

const authKeys = {
  all: ["auth"] as const,

  me: (token: string) => [...authKeys.all, "me", token] as const,
};

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useCurrentUser(token: string | null) {
  return useQuery({
    queryKey: token ? authKeys.me(token) : [...authKeys.all, "me", "anonymous"],

    queryFn: () => getCurrentUser(token!),

    enabled: Boolean(token),

    retry: false,

    staleTime: 60_000,

    refetchOnWindowFocus: false,
  });
}
