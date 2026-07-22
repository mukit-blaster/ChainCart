"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3,
  Box,
  Heart,
  LayoutDashboard,
  Link2,
  LogOut,
  MessageSquare,
  Package,
  PackageSearch,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { useLogout } from "@/lib/auth";
import { useUIStore } from "@/stores/ui";

type Kind = "buyer" | "seller" | "admin";
type Item = { href: string; icon: LucideIcon; label: string };
type Group = { hd: string; items: Item[] };

const buyer: Group[] = [
  {
    hd: "Account",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
      { href: "/dashboard/orders", icon: Package, label: "Orders" },
      { href: "/dashboard/warranties", icon: ShieldCheck, label: "NFT Warranties" },
      { href: "/dashboard/saved", icon: Heart, label: "Saved" },
    ],
  },
  {
    hd: "Web3",
    items: [
      { href: "/wallet", icon: Wallet, label: "Wallet" },
      { href: "/blockchain", icon: Link2, label: "Activity" },
    ],
  },
  {
    hd: "More",
    items: [
      { href: "/chat", icon: MessageSquare, label: "Messages" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
];

const seller: Group[] = [
  {
    hd: "Selling",
    items: [
      { href: "/seller", icon: LayoutDashboard, label: "Overview" },
      { href: "/seller/products", icon: Box, label: "Products" },
      { href: "/seller/orders", icon: ShoppingCart, label: "Orders" },
      { href: "/seller/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    hd: "Customers",
    items: [
      { href: "/chat", icon: MessageSquare, label: "Messages" },
    ],
  },
  {
    hd: "Web3",
    items: [
      { href: "/wallet", icon: Wallet, label: "Payouts" },
      { href: "/blockchain", icon: ShieldCheck, label: "NFT mints" },
    ],
  },
];

const admin: Group[] = [
  {
    hd: "Platform",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Overview" },
      { href: "/admin/users", icon: Users, label: "Users" },
      { href: "/admin/sellers", icon: Store, label: "Sellers" },
      { href: "/admin/moderation", icon: PackageSearch, label: "Moderation" },
    ],
  },
  {
    hd: "Trust & Safety",
    items: [
      { href: "/admin/fraud", icon: ShieldAlert, label: "Fraud monitor" },
      { href: "/blockchain", icon: Link2, label: "Verification logs" },
    ],
  },
];

const groupsFor = (kind: Kind) =>
  kind === "seller" ? seller : kind === "admin" ? admin : buyer;

interface SidebarBodyProps {
  groups: Group[];
  pathname: string | null;
  onItemClick?: () => void;
  onSignOut: () => void;
}

const SidebarBody = ({ groups, pathname, onItemClick, onSignOut }: SidebarBodyProps) => (
  <>
    <div className="px-2 pb-4">
      <Logo />
    </div>
    <div className="flex-1">
      {groups.map((g) => (
        <div key={g.hd} className="mt-3">
          <div className="cc-eyebrow px-2">{g.hd}</div>
          <ul className="mt-1 space-y-0.5">
            {g.items.map((it) => {
              const Icon = it.icon;
              const active = pathname === it.href;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onItemClick}
                    className={cn("cc-side-item", active && "active")}
                  >
                    <Icon size={16} />
                    <span>{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
    <div className="mt-3 pt-3 border-t border-border">
      <button
        onClick={() => {
          onItemClick?.();
          onSignOut();
        }}
        className="cc-side-item w-full text-danger hover:bg-danger/10 hover:text-danger"
      >
        <LogOut size={16} />
        <span>Sign out</span>
      </button>
    </div>
  </>
);

export const Sidebar = ({ kind }: { kind: Kind }) => {
  const pathname = usePathname();
  const groups = groupsFor(kind);
  const logout = useLogout();
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);

  // Close drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  // Lock body scroll while drawer open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[248px] shrink-0 h-[calc(100vh-72px)] sticky top-[72px] border-r border-border bg-surface px-4 py-5 overflow-y-auto flex-col">
        <SidebarBody
          groups={groups}
          pathname={pathname}
          onSignOut={logout}
        />
      </aside>

      {/* Mobile drawer */}
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
            "absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-surface border-r border-border px-4 py-5 overflow-y-auto flex flex-col transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="absolute top-3 right-3 w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-surface2"
          >
            <X size={16} />
          </button>
          <SidebarBody
            groups={groups}
            pathname={pathname}
            onItemClick={() => setOpen(false)}
            onSignOut={logout}
          />
        </aside>
      </div>
    </>
  );
};
