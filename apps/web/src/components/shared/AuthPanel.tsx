"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, Lock, Mail, Tag, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/Logo";
import { loginSchema, registerSchema } from "@/features/auth/schema";

type AuthMode = "login" | "register";

export function AuthPanel({ mode }: { mode: AuthMode }) {
  const isLogin = mode === "login";
  const schema = isLogin ? loginSchema : registerSchema;
  const { register } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <main className="coin-surface grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-6xl">
        <div className="mb-7 flex items-center justify-between">
          <Logo />
          <Link className="text-sm text-violet-300" href={isLogin ? "/register" : "/login"}>{isLogin ? "Create account" : "Sign in"}</Link>
        </div>
        <Card className="grid overflow-hidden md:grid-cols-[.85fr_1.15fr]">
          <form className="p-7 md:p-12">
            <h1 className="text-4xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-3 max-w-sm text-zinc-400">{isLogin ? "Sign in to your account and manage your crypto portfolio with confidence." : "Join CoinBarrier and start your crypto journey today."}</p>
            <div className="mt-8 space-y-5">
              {!isLogin && <Field icon={<User />} label="Full Name" placeholder="Enter your full name" bind={register("fullName" as never)} />}
              <Field icon={<Mail />} label="Email address" placeholder="Enter your email" bind={register("email" as never)} />
              <Field icon={<Lock />} label="Password" placeholder={isLogin ? "Enter your password" : "Create a strong password"} type="password" bind={register("password" as never)} trailing={<Eye className="size-4" />} />
              {!isLogin && <Field icon={<Lock />} label="Confirm Password" placeholder="Confirm your password" type="password" bind={register("confirmPassword" as never)} trailing={<Eye className="size-4" />} />}
              {!isLogin && <Field icon={<Tag />} label="Referral Code (Optional)" placeholder="Enter referral code" bind={register("referralCode" as never)} />}
            </div>
            <div className="mt-6 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-300"><input type="checkbox" className="size-4 accent-violet-500" /> {isLogin ? "Remember me" : "I agree to the Terms and Privacy Policy"}</label>
              {isLogin && <Link className="text-violet-300" href="#">Forgot password?</Link>}
            </div>
            <Button className="mt-7 w-full">{isLogin ? "Sign In" : "Create Account"} {!isLogin && <ArrowRight className="size-4" />}</Button>
            <div className="my-6 flex items-center gap-3 text-xs text-zinc-500 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">or continue with</div>
            <Button type="button" variant="outline" className="w-full">Continue with Google</Button>
            <p className="mt-7 text-center text-sm text-zinc-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"} <Link className="text-violet-300" href={isLogin ? "/register" : "/login"}>{isLogin ? "Create account" : "Sign in"}</Link>
            </p>
          </form>
          <section className="relative hidden min-h-[640px] overflow-hidden border-l border-white/10 p-12 md:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(139,92,246,.38),transparent_19rem)]" />
            <div className="relative grid h-full place-items-center">
              <div className="relative grid size-72 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10 shadow-[0_0_80px_rgba(139,92,246,.45)]">
                <div className="grid size-44 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-violet-900 text-7xl font-black shadow-[0_0_80px_rgba(139,92,246,.75)]">cb</div>
              </div>
            </div>
            <div className="absolute bottom-10 left-10 right-10 grid grid-cols-3 gap-5 text-sm text-zinc-300">
              {["Bank-grade security", "Real-time portfolio", "Trusted by thousands"].map((item) => <div key={item} className="rounded-xl bg-white/5 p-4">{item}</div>)}
            </div>
          </section>
        </Card>
      </div>
    </main>
  );
}

function Field({ icon, label, trailing, bind, ...props }: { icon: React.ReactNode; label: string; trailing?: React.ReactNode; bind: object } & React.ComponentProps<typeof Input>) {
  return (
    <label className="block text-sm text-zinc-300">
      {label}
      <span className="relative mt-2 block">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 [&>svg]:size-4">{icon}</span>
        <Input className="pl-11 pr-10" {...props} {...bind} />
        {trailing && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">{trailing}</span>}
      </span>
    </label>
  );
}
