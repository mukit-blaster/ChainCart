"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { LogIn, Wallet, X } from "lucide-react";
import { Logo } from "./Logo";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useWalletStore } from "@/stores/wallet";
import { walletLogin } from "@/lib/wallet";
import { shortAddress } from "@/lib/format";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Marketplace" },
  { href: "/categories", label: "Categories" },
  { href: "/verify", label: "Authenticity" },
];

export const MobileNav = () => {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const wallet = useWalletStore((s) => s.address);

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onConnect = async () => {
    try {
      await walletLogin();
      toast.success("Wallet connected");
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to connect wallet");
    }
  };

  return (
    <div
      className={cn(
        "md:hidden fixed inset-0 z-40 transition-opacity",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <aside
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-surface border-r border-border px-5 py-5 overflow-y-auto flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          <Logo size={28} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-surface2"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-base font-medium",
                  active ? "bg-surface2 text-fg" : "text-fg2 hover:text-fg hover:bg-surface2",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {!user && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium border border-border hover:bg-surface2"
            >
              <LogIn size={16} /> Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={onConnect}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium bg-brand text-white hover:bg-brand/90"
          >
            <Wallet size={16} />
            {wallet ? (
              <span className="cc-mono text-sm">{shortAddress(wallet)}</span>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};
