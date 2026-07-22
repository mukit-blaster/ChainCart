import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  walletAddress: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setSession: (data: { user: User; tokens: { accessToken: string; refreshToken: string } }) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setSession: (data) => set({ user: data.user, accessToken: data.tokens.accessToken }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "cc-auth",
      // Only persist the user shell; access token is short-lived and lives in memory.
      // The httpOnly refresh cookie does the actual session continuity.
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
