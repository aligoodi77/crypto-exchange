import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3 font-bold text-white", className)}>
      <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-700 text-3xl shadow-[0_0_28px_rgba(139,92,246,.45)]">
        cb
      </span>
      {!compact && <span className="text-xl">CoinBarrier</span>}
    </Link>
  );
}
