"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

export function AuthSessionHydrator() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return null;
}
