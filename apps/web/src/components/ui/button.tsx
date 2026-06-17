import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-violet-500 text-white shadow-[0_0_24px_rgba(139,92,246,.28)] hover:bg-violet-400",
        secondary: "bg-white/8 text-white hover:bg-white/12",
        outline: "border border-white/12 bg-transparent text-white hover:bg-white/8",
        green: "bg-emerald-500 text-white hover:bg-emerald-400",
        red: "bg-red-500 text-white hover:bg-red-400",
        ghost: "text-white hover:bg-white/8",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-lg px-3",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
