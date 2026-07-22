"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes hydration: render a stable placeholder on SSR so theme-driven
  // markup doesn't mismatch on first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface2 transition-colors",
        className,
      )}
    >
      <Sun
        size={16}
        className={cn(
          "absolute transition-all duration-300",
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100",
        )}
      />
      <Moon
        size={16}
        className={cn(
          "absolute transition-all duration-300",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50",
        )}
      />
    </button>
  );
};
