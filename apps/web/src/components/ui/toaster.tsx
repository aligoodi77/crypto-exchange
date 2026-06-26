"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useToastStore, type ToastTone } from "@/store/toast-store";

const toneClasses: Record<ToastTone, string> = {
  success: "border-emerald-400/30 bg-emerald-500/12 text-emerald-100",
  error: "border-red-400/30 bg-red-500/12 text-red-100",
  info: "border-violet-400/30 bg-violet-500/12 text-violet-100",
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 shadow-2xl backdrop-blur",
            toneClasses[toast.tone],
          )}
          key={toast.id}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>

              {toast.description ? (
                <p className="mt-1 text-xs opacity-85">{toast.description}</p>
              ) : null}
            </div>

            <button
              aria-label="Dismiss notification"
              className="shrink-0 rounded-lg p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
              onClick={() => dismissToast(toast.id)}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
