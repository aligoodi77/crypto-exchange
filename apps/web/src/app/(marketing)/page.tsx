import Link from "next/link";
import { ArrowRight, Shield, Wallet } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketTable } from "@/components/dashboard/MarketTable";

export default function HomePage() {
  return (
    <main className="coin-surface min-h-screen px-4 py-6 md:px-10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo />
        <div className="flex gap-3"><Button asChild variant="ghost"><Link href="/login">Sign in</Link></Button><Button asChild><Link href="/register">Create account</Link></Button></div>
      </nav>
      <section className="mx-auto grid max-w-7xl items-center gap-8 py-12 md:grid-cols-[.8fr_1.2fr]">
        <div>
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">CoinBarrier</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-300">A polished crypto exchange interface for portfolio tracking, markets, trading, wallet activity, and admin operations.</p>
          <div className="mt-8 flex gap-4"><Button asChild><Link href="/dashboard">Open dashboard <ArrowRight className="size-4" /></Link></Button><Button asChild variant="outline"><Link href="/markets">Explore markets</Link></Button></div>
        </div>
        <Card className="p-5"><MarketTable compact /></Card>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {[[Shield, "Bank-grade UI"], [Wallet, "Wallet flows"], [ArrowRight, "Trading mock"]].map(([Icon, label]) => {
          const I = Icon as typeof Shield;
          return <Card key={label as string} className="p-5"><I className="mb-4 size-8 text-violet-300" /><h2 className="font-semibold">{label as string}</h2></Card>;
        })}
      </section>
    </main>
  );
}
