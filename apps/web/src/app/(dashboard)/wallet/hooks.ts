"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyWallet } from "./api";

export const walletKeys = {
  all: ["wallet"] as const,

  me: (userId: string | null) =>
    [...walletKeys.all, "me", userId ?? "anonymous"] as const,
};

export function useMyWallet(token: string | null, userId: string | null) {
  return useQuery({
    queryKey: walletKeys.me(userId),

    queryFn: () => getMyWallet(token!),

    enabled: Boolean(token && userId),

    staleTime: 15_000,

    refetchOnWindowFocus: true,
  });
}
