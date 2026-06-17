"use client";

import { useMutation } from "@tanstack/react-query";
import { login } from "@/features/auth/api";

export function useLogin() {
  return useMutation({ mutationFn: login });
}
