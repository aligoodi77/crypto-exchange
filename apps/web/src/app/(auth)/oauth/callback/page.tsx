"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/api";
import { isApiError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setError("OAuth sign in did not return a session token.");
      return;
    }

    const sessionToken = token;
    let cancelled = false;

    async function hydrateOAuthSession() {
      try {
        const user = await getCurrentUser(sessionToken);

        if (cancelled) {
          return;
        }

        setSession(sessionToken, user);
        router.replace("/dashboard");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          isApiError(requestError)
            ? requestError.message
            : "OAuth sign in failed. Please try again.",
        );
      }
    }

    void hydrateOAuthSession();

    return () => {
      cancelled = true;
    };
  }, [router, setSession]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#07090f] px-4">
      <Card className="w-full max-w-md p-6 text-center">
        <h1 className="text-lg font-semibold text-white">
          {error ? "Sign in failed" : "Signing you in"}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {error ?? "Please wait while your account session is created."}
        </p>
      </Card>
    </main>
  );
}
