"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "./api";
import { disconnectSocket } from "./socket";
import { useAuthStore } from "@/stores/auth";

// Logs the user out across the app: revokes the refresh token server-side,
// clears local store, drops any open socket, and routes home.
export const useLogout = () => {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  return async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Network failure or already-revoked token shouldn't block the client
      // from forgetting its session.
    }
    disconnectSocket();
    clear();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };
};
