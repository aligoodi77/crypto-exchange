"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chrome, Github } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/Logo";

import { isApiError } from "@/lib/api-error";

import { useLogin, useRegister } from "@/features/auth/hooks";

import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from "@/features/auth/schema";

import { useAuthStore } from "@/store/auth-store";

type AuthMode = "login" | "register";

export function AuthPanel({ mode }: { mode: AuthMode }) {
  if (mode === "login") {
    return <LoginForm />;
  }

  return <RegisterForm />;
}

function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [apiError, setApiError] = useState<string | null>(null);

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauthError");

    if (oauthError) {
      setApiError(oauthError);
    }
  }, []);

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);

    try {
      const session = await loginMutation.mutateAsync(values);

      setSession(session.token, session.user);

      router.replace("/dashboard");
    } catch (error) {
      if (isApiError(error)) {
        for (const fieldError of error.errors) {
          if (fieldError.path === "email" || fieldError.path === "password") {
            setError(fieldError.path, {
              type: "server",
              message: fieldError.message,
            });
          }
        }

        setApiError(error.message);
        return;
      }

      setApiError(
        "Something went wrong. Please check your connection and try again.",
      );
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage your crypto portfolio."
      mode="login"
    >
      <OAuthButtons />
      <Divider />
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Email address" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            {...register("email")}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register("password")}
          />
        </FormField>

        {apiError ? (
          <p className="text-sm text-destructive">{apiError}</p>
        ) : null}

        <Button
          className="w-full"
          type="submit"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            href="/register"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [apiError, setApiError] = useState<string | null>(null);

  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setApiError(null);

    try {
      const result = await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      setSession(result.token, result.user);

      router.replace("/profile");
    } catch (error) {
      if (isApiError(error)) {
        for (const fieldError of error.errors) {
          if (
            fieldError.path === "name" ||
            fieldError.path === "email" ||
            fieldError.path === "password"
          ) {
            setError(fieldError.path, {
              type: "server",
              message: fieldError.message,
            });
          }
        }

        setApiError(error.message);
        return;
      }

      setApiError(
        "Something went wrong. Please check your connection and try again.",
      );
    }
  }

  return (
    <AuthCard
      title="Create your account"
      description="Start building your crypto portfolio today."
      mode="register"
    >
      <OAuthButtons />
      <Divider />
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Full name" error={errors.name?.message}>
          <Input
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            {...register("name")}
          />
        </FormField>

        <FormField label="Email address" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            {...register("email")}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            {...register("password")}
          />
        </FormField>

        <FormField
          label="Confirm password"
          error={errors.confirmPassword?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            {...register("confirmPassword")}
          />
        </FormField>

        {apiError ? (
          <p className="text-sm text-destructive">{apiError}</p>
        ) : null}

        <Button
          className="w-full"
          type="submit"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending
            ? "Creating account..."
            : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

function AuthCard({
  title,
  description,
  mode,
  children,
}: {
  title: string;
  description: string;
  mode: AuthMode;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[#07090f] px-4 py-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:px-8">
      <section className="hidden min-h-[calc(100vh-4rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,197,94,.18),rgba(59,130,246,.12)_48%,rgba(236,72,153,.16))] p-8 lg:block">
        <div className="flex h-full flex-col justify-between">
          <Logo />
          <div>
            <div className="mb-8 grid max-w-xl grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                <p className="text-sm text-zinc-300">Portfolio</p>
                <p className="mt-2 text-3xl font-bold">$24,901.45</p>
                <p className="mt-1 text-sm text-emerald-300">+12.8%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                <p className="text-sm text-zinc-300">BTC/USD</p>
                <p className="mt-2 text-3xl font-bold">$68,240</p>
                <p className="mt-1 text-sm text-sky-300">Live market</p>
              </div>
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-tight text-white">
              {mode === "login"
                ? "Trade with a clear view."
                : "Open your exchange account."}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-300">
              Secure account access, verified email trading, live markets, and
              wallet tracking in one dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center lg:justify-end">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <div className="mb-8 space-y-3">
            <div className="lg:hidden">
              <Logo />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {children}
        </Card>
      </section>
    </main>
  );
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(
    /\/$/,
    "",
  );
}

function OAuthButtons() {
  const apiBaseUrl = getApiBaseUrl();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button asChild className="w-full" variant="outline">
        <a href={`${apiBaseUrl}/api/auth/oauth/google`}>
          <Chrome className="size-4" />
          Google
        </a>
      </Button>

      <Button asChild className="w-full" variant="outline">
        <a href={`${apiBaseUrl}/api/auth/oauth/github`}>
          <Github className="size-4" />
          GitHub
        </a>
      </Button>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase text-muted-foreground">
      <span className="h-px flex-1 bg-white/10" />
      <span>Email</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>

      {children}

      {error ? (
        <span className="block text-sm text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
