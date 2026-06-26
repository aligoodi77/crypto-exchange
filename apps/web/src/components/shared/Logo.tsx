import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3 font-bold text-white", className)}>
      <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(135deg,#a855f7,#6d28d9_52%,#4c1d95)] shadow-[0_0_32px_rgba(139,92,246,.42)]">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,.32),transparent_34%)]" />
        <LogoMark className="relative size-8 text-white drop-shadow-[0_3px_10px_rgba(255,255,255,.24)]" />
      </span>
      {!compact && (
        <span className="whitespace-nowrap text-xl tracking-normal">
          Coin<span className="text-violet-300">Barrier</span>
        </span>
      )}
    </Link>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 6v36M15 12h18c5 0 8 3 8 8s-3 8-8 8H15c-5 0-8-3-8-8s3-8 8-8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path
        d="M33 20H15c-5 0-8 3-8 8s3 8 8 8h18c5 0 8-3 8-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
    </svg>
  );
}
