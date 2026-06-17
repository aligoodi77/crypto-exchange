import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-lg bg-violet-500/18 px-2.5 py-1 text-xs font-medium text-violet-200", className)}
      {...props}
    />
  );
}
