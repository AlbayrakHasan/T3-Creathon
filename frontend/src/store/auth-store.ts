import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/roles";

export interface AuthState {
  role: Role | null;
  setRole: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      logout: () => set({ role: null }),
    }),
    {
      name: "aes-auth-storage",
    },
  ),
);
