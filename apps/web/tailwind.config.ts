import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mirror the prototype tokens from styles.css. Variants stay accessible
        // via Tailwind utilities while CSS vars handle theme switching.
        brand: {
          DEFAULT: "#2563EB",
          600: "#1d4ed8",
          50: "#eff6ff",
        },
        accent: {
          DEFAULT: "#10B981",
          600: "#059669",
        },
        violet: { DEFAULT: "#8B5CF6" },
        danger: "#EF4444",
        warning: "#F59E0B",
        // Theme-aware tokens — bind to CSS vars set in globals.css.
        bg: "rgb(var(--cc-bg) / <alpha-value>)",
        surface: "rgb(var(--cc-surface) / <alpha-value>)",
        surface2: "rgb(var(--cc-surface-2) / <alpha-value>)",
        border: "rgb(var(--cc-border) / <alpha-value>)",
        muted: "rgb(var(--cc-muted) / <alpha-value>)",
        fg: "rgb(var(--cc-text) / <alpha-value>)",
        fg2: "rgb(var(--cc-text-2) / <alpha-value>)",
      },
      borderRadius: {
        sm: "12px",
        DEFAULT: "18px",
        lg: "24px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular"],
      },
      boxShadow: {
        cc: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px -8px rgba(15,23,42,.08)",
        ccLg: "0 4px 12px rgba(15,23,42,.04), 0 24px 48px -12px rgba(15,23,42,.16)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "50%": { transform: "translateY(-8px) rotate(.5deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        fadeUp: "fadeUp .4s cubic-bezier(.2,.7,.3,1) both",
      },
    },
  },
  plugins: [animate],
};

export default config;
