"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    >
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

      router.replace("/dashboard");
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
    >
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
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-8 space-y-3">
          <Logo />

          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {children}
      </Card>
    </main>
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
