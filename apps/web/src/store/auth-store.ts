"use client";

import { create } from "zustand";

import type { AuthUser } from "@/features/auth/types";

const AUTH_SESSION_STORAGE_KEY = "coinbarrier.auth-session";

type StoredSession = {
  token: string;
  user: AuthUser;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;

  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  hydrateSession: () => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    (typeof value.avatarUrl === "string" || value.avatarUrl === null) &&
    (value.role === "USER" || value.role === "ADMIN") &&
    typeof value.emailVerified === "boolean" &&
    (typeof value.emailVerifiedAt === "string" ||
      value.emailVerifiedAt === null) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession: unknown = JSON.parse(rawSession);

    if (
      !isRecord(parsedSession) ||
      typeof parsedSession.token !== "string" ||
      !isAuthUser(parsedSession.user)
    ) {
      window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);

      return null;
    }

    return {
      token: parsedSession.token,
      user: parsedSession.user,
    };
  } catch {
    window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);

    return null;
  }
}

function saveSession(token: string, user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify({
      token,
      user,
    }),
  );
}

function removeSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  setSession: (token, user) => {
    saveSession(token, user);

    set({
      token,
      user,
      isHydrated: true,
    });
  },

  clearSession: () => {
    removeSession();

    set({
      token: null,
      user: null,
      isHydrated: true,
    });
  },

  hydrateSession: () => {
    const storedSession = readStoredSession();

    set({
      token: storedSession?.token ?? null,
      user: storedSession?.user ?? null,
      isHydrated: true,
    });
  },
}));
