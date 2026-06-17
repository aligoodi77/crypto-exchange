import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-xl border border-white/10 bg-white/[.035] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/20",
        className,
      )}
      {...props}
    />
  );
}
