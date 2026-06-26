"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cloneElement,
  useEffect,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Chrome,
  Eye,
  EyeOff,
  Github,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
      description="Sign in to your account and manage your crypto portfolio with confidence."
      mode="login"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Email address" error={errors.email?.message}>
          <FieldInput icon={<Mail className="size-4" />}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              {...register("email")}
            />
          </FieldInput>
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <FieldInput
            icon={<Lock className="size-4" />}
            action={
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-zinc-500 transition hover:text-white"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          >
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
            />
          </FieldInput>
        </FormField>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-zinc-300">
            <input
              className="size-4 rounded border-white/20 bg-transparent accent-violet-500"
              type="checkbox"
              defaultChecked
            />
            Remember me
          </label>
          <a className="font-medium text-violet-300 hover:text-violet-200" href="mailto:support@coinbarrier.local">
            Forgot password?
          </a>
        </div>

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

        <Divider />
        <OAuthButtons action="Continue" />

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      description="Join CoinBarrier and start your crypto journey today."
      mode="register"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Full name" error={errors.name?.message}>
          <FieldInput icon={<User className="size-4" />}>
            <Input
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              {...register("name")}
            />
          </FieldInput>
        </FormField>

        <FormField label="Email address" error={errors.email?.message}>
          <FieldInput icon={<Mail className="size-4" />}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              {...register("email")}
            />
          </FieldInput>
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <FieldInput
            icon={<Lock className="size-4" />}
            action={
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-zinc-500 transition hover:text-white"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          >
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              {...register("password")}
            />
          </FieldInput>
          <span className="block text-xs text-zinc-500">
            Minimum 8 characters with lowercase, uppercase, and a symbol.
          </span>
        </FormField>

        <FormField
          label="Confirm password"
          error={errors.confirmPassword?.message}
        >
          <FieldInput
            icon={<Lock className="size-4" />}
            action={
              <button
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="text-zinc-500 transition hover:text-white"
                onClick={() => setShowConfirmPassword((current) => !current)}
                type="button"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          >
            <Input
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
            />
          </FieldInput>
        </FormField>

        <label className="flex items-start gap-2 text-sm text-zinc-400">
          <input
            className="mt-0.5 size-4 rounded border-white/20 bg-transparent accent-violet-500"
            required
            type="checkbox"
          />
          <span>
            I agree to the{" "}
            <a className="text-violet-300 hover:text-violet-200" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="text-violet-300 hover:text-violet-200" href="#">
              Privacy Policy
            </a>
          </span>
        </label>

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
          {!registerMutation.isPending ? <ArrowRight className="size-4" /> : null}
        </Button>

        <Divider />
        <OAuthButtons action="Sign up" />

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
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,.18),transparent_34rem),#07090f] px-4 py-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1320px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080d17]/90 shadow-2xl shadow-black/40 lg:grid-cols-[minmax(420px,1fr)_minmax(420px,520px)]">
        <section className={mode === "register" ? "hidden p-8 lg:block" : "hidden p-8 lg:block lg:order-2"}>
          <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(8,11,20,.74),rgba(37,20,74,.35))] p-10">
            <Logo />
            <div className="flex flex-1 flex-col justify-center">
              <h1 className="max-w-lg text-4xl font-bold leading-tight text-white xl:text-5xl">
                {mode === "login" ? "Welcome back to secure digital assets" : "Your gateway to the future of digital assets"}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-zinc-300">
                {mode === "login"
                  ? "Manage your portfolio, review live markets, and trade from a protected CoinBarrier account."
                  : "Create your account and start trading, investing, and growing your portfolio with confidence."}
              </p>
              <BrandingArtwork mode={mode} />
              <div className="grid gap-4 xl:grid-cols-3">
                {[
                  ["Bank-grade security", "Protected account access"],
                  ["Real-time portfolio", "Live market movements"],
                  ["Trusted by traders", "Fast demo trading"],
                ].map(([label, detail]) => (
                  <div className="rounded-2xl border border-white/10 bg-white/[.045] p-4" key={label}>
                    <ShieldCheck className="mb-3 size-5 text-violet-300" />
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-400">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={mode === "register" ? "flex items-center justify-center p-5 sm:p-8" : "flex items-center justify-center p-5 sm:p-8 lg:order-1"}>
          <Card className="w-full max-w-[460px] rounded-3xl p-6 sm:p-8">
            <div className="mb-8 space-y-3 text-left">
              <div className="mb-8 lg:hidden">
                <Logo />
              </div>

              <h1 className="text-3xl font-semibold tracking-normal text-white">{title}</h1>

              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>

            {children}
          </Card>
        </section>
      </div>
    </main>
  );
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(
    /\/$/,
    "",
  );
}

function OAuthButtons({ action }: { action: "Continue" | "Sign up" }) {
  const apiBaseUrl = getApiBaseUrl();

  return (
    <div className="grid gap-3">
      <Button asChild className="w-full" variant="outline">
        <a href={`${apiBaseUrl}/api/auth/oauth/google`}>
          <Chrome className="size-4" />
          {action} with Google
        </a>
      </Button>

      <Button asChild className="w-full" variant="outline">
        <a href={`${apiBaseUrl}/api/auth/oauth/github`}>
          <Github className="size-4" />
          {action} with GitHub
        </a>
      </Button>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-white/10" />
      <span>or continue with</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function FieldInput({
  icon,
  action,
  children,
}: {
  icon: ReactNode;
  action?: ReactNode;
  children: ReactElement<ComponentProps<typeof Input>>;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-500">
        {icon}
      </span>
      {cloneElement(children, {
        className: "pl-11 pr-11",
      })}
      {action ? (
        <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
          {action}
        </span>
      ) : null}
    </div>
  );
}

function BrandingArtwork({ mode }: { mode: AuthMode }) {
  return (
    <div className="relative my-10 flex h-72 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_42%,rgba(139,92,246,.42),transparent_12rem),linear-gradient(180deg,rgba(7,10,18,.4),rgba(7,10,18,.92))]">
      <div className="absolute inset-x-20 bottom-14 h-16 rounded-[100%] border border-violet-400/30 bg-violet-500/10 shadow-[0_0_60px_rgba(139,92,246,.45)]" />
      <div className="relative grid size-32 place-items-center rounded-full border border-violet-300/50 bg-[linear-gradient(145deg,#a855f7,#4c1d95)] text-6xl font-bold text-white shadow-[0_0_70px_rgba(168,85,247,.7)]">
        cb
      </div>
      <div className="absolute left-[18%] top-24 grid size-16 place-items-center rounded-full border border-amber-300/30 bg-amber-400/15 text-2xl font-bold text-amber-300">
        ₿
      </div>
      <div className="absolute bottom-20 right-[17%] grid size-16 place-items-center rounded-full border border-sky-300/30 bg-sky-400/15 text-2xl font-bold text-sky-200">
        Ξ
      </div>
      <div className="absolute bottom-12 left-[31%] grid size-16 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/15">
        <Lock className="size-8 text-violet-200" />
      </div>
      <span className="sr-only">
        {mode === "login" ? "CoinBarrier secure login artwork" : "CoinBarrier registration artwork"}
      </span>
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
  children: ReactNode;
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
