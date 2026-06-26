"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastState = {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
};

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (toast) => {
    const id = createToastId();

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }].slice(-4),
    }));

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((item) => item.id !== id),
      }));
    }, 4_500);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
