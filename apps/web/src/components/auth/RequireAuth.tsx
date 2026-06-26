"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { isApiError } from "@/lib/api-error";
import { useCurrentUser } from "@/features/auth/hooks";
import type { AuthRole } from "@/features/auth/types";
import { useAuthStore } from "@/store/auth-store";

type RequireAuthProps = {
  children: React.ReactNode;
  requiredRole?: AuthRole;
};

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const currentUserQuery = useCurrentUser(token);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      router.replace("/login");
    }
  }, [isHydrated, router, token]);

  useEffect(() => {
    if (!token || !currentUserQuery.data) {
      return;
    }

    setSession(token, currentUserQuery.data);
  }, [currentUserQuery.data, setSession, token]);

  useEffect(() => {
    if (!currentUserQuery.isError) {
      return;
    }

    const error = currentUserQuery.error;

    const shouldLogout =
      isApiError(error) && (error.status === 401 || error.status === 404);

    if (!shouldLogout) {
      return;
    }

    clearSession();
    queryClient.clear();
    router.replace("/login");
  }, [
    clearSession,
    currentUserQuery.error,
    currentUserQuery.isError,
    queryClient,
    router,
  ]);

  const currentUser = currentUserQuery.data;

  const hasWrongRole =
    requiredRole !== undefined &&
    currentUser !== undefined &&
    currentUser.role !== requiredRole;

  useEffect(() => {
    if (!hasWrongRole) {
      return;
    }

    router.replace("/dashboard");
  }, [hasWrongRole, router]);

  if (!isHydrated || !token || currentUserQuery.isPending) {
    return <AuthLoadingScreen />;
  }

  if (currentUserQuery.isError) {
    const isUnauthorized =
      isApiError(currentUserQuery.error) &&
      (currentUserQuery.error.status === 401 ||
        currentUserQuery.error.status === 404);

    if (isUnauthorized) {
      return <AuthLoadingScreen />;
    }

    return (
      <AuthErrorScreen
        message="Could not verify your session. Please check whether the API server is running."
        onRetry={() => {
          void currentUserQuery.refetch();
        }}
      />
    );
  }

  if (hasWrongRole) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Checking your session...</p>
    </main>
  );
}

function AuthErrorScreen({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border p-6 text-center">
        <h1 className="text-lg font-semibold">Session check failed</h1>

        <p className="text-sm text-muted-foreground">{message}</p>

        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
