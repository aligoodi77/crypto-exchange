import { create } from "zustand";

type AuthState = {
  user: { name: string; email: string } | null;
  setUser: (user: AuthState["user"]) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: { name: "Ali Goudarzi", email: "ali@example.com" },
  setUser: (user) => set({ user }),
}));
