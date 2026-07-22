"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, Wallet } from "lucide-react";
import { Button } from "./ui/Button";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useWalletStore } from "@/stores/wallet";
import { useUIStore } from "@/stores/ui";
import { walletLogin } from "@/lib/wallet";
import { shortAddress } from "@/lib/format";
import { toast } from "sonner";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Marketplace" },
  { href: "/categories", label: "Categories" },
  { href: "/verify", label: "Authenticity" },
];

export const TopNav = () => {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.count());
  const user = useAuthStore((s) => s.user);
  const wallet = useWalletStore((s) => s.address);
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);

  const onConnect = async () => {
    try {
      await walletLogin();
      toast.success("Wallet connected");
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to connect wallet");
    }
  };

  return (
    <div className="sticky top-2 md:top-4 z-30 px-3 md:px-6 mt-2 md:mt-4">
      <div className="cc-glass flex items-center gap-2 md:gap-4 rounded-full pl-3 md:pl-6 pr-2 md:pr-3.5 py-2 md:py-2.5">
        <button
          type="button"
          aria-label="Open menu"
          onClick={toggleMobileNav}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface2"
        >
          <Menu size={18} />
        </button>

        <Link href="/" className="flex items-center" aria-label="Home">
          <Logo size={28} />
        </Link>

        <nav className="hidden md:flex flex-1 justify-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  active ? "text-fg" : "text-fg2 hover:text-fg"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer that only appears on mobile, where the center nav is hidden */}
        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-1.5 md:gap-2">
          <ThemeToggle />
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-2 rounded-full text-sm font-medium border border-border hover:bg-surface2"
            aria-label="Cart"
          >
            <ShoppingBag size={16} />
            <span>{cartCount}</span>
          </Link>
          {user ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border border-transparent hover:bg-surface2"
            >
              Sign in
            </Link>
          )}
          <Button
            variant="brand"
            size="pill"
            onClick={onConnect}
            className="hidden sm:inline-flex rounded-full"
          >
            {wallet ? (
              <>
                <span className="cc-pulse-dot inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="cc-mono text-xs">{shortAddress(wallet)}</span>
              </>
            ) : (
              <>
                <Wallet size={14} />
                <span className="hidden lg:inline">Connect Wallet</span>
                <span className="lg:hidden">Wallet</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
