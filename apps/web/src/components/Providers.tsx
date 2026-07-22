"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  const setSession = useAuthStore((s) => s.setSession);

  // On hard refresh, attempt a silent refresh so the user stays signed in via
  // the httpOnly cookie. Failures are silent — we just stay signed out.
  //
  // accessToken is never persisted, so it's guaranteed null when this fires.
  // If an explicit login/register completes first and sets it while this
  // request is still in flight, skip applying our (now stale) result —
  // otherwise a slow refresh response can clobber a fresher session.
  useEffect(() => {
    api
      .post("/auth/refresh")
      .then(({ data }) => {
        if (!useAuthStore.getState().accessToken) setSession(data);
      })
      .catch(() => {});
  }, [setSession]);

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
};
