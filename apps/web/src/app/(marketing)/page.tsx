import Link from "next/link";
import { ArrowRight, CandlestickChart, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { MarketTable } from "@/components/dashboard/MarketTable";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#07090f] px-4 py-6 text-white md:px-10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo />
        <div className="flex gap-3">
          <Button asChild variant="ghost">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-7xl items-center gap-10 py-10 lg:grid-cols-[.82fr_1.18fr]">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
            <span className="size-2 rounded-full bg-emerald-300" />
            Live crypto exchange dashboard
          </div>
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            CoinBarrier
          </h1>
          <p className="mt-5 text-lg leading-8 text-zinc-300">
            Buy, sell, monitor markets, and manage a simulated wallet with
            verified account access and a clean trading workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/dashboard">
                Open dashboard <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/markets">Explore markets</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              [ShieldCheck, "Verified access"],
              [CandlestickChart, "Spot trading"],
              [Wallet, "Wallet tracking"],
            ].map(([Icon, label]) => {
              const ItemIcon = Icon as typeof ShieldCheck;
              return (
                <div
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.045] px-3 py-3 text-sm text-zinc-200"
                  key={label as string}
                >
                  <ItemIcon className="size-4 text-emerald-300" />
                  {label as string}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-[#111217]/90 p-4 shadow-2xl shadow-black/30">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-zinc-400">Market overview</p>
              <h2 className="text-xl font-semibold">Top pairs</h2>
            </div>
            <div className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-300">
              +8.24%
            </div>
          </div>
          <MarketTable compact />
        </div>
      </section>
    </main>
  );
}
