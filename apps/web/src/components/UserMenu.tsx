"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Store,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "./ui/Avatar";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/lib/auth";

const HOME_BY_ROLE = {
  ADMIN: "/admin",
  SELLER: "/seller",
  CUSTOMER: "/dashboard",
} as const;

export const UserMenu = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  if (!user) return null;
  const home = HOME_BY_ROLE[user.role] ?? "/dashboard";
  const display = user.name ?? user.email;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:bg-surface2 transition"
          aria-label="Open user menu"
        >
          <Avatar name={display} size={28} />
          <span className="text-sm font-medium max-w-[120px] truncate hidden sm:block">
            {display.split(" ")[0]}
          </span>
          <ChevronDown size={14} className="text-muted" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="cc-card-lg p-1.5 min-w-[240px] z-50 origin-top-right data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {/* Identity row */}
          <div className="flex items-center gap-3 px-2.5 py-2.5">
            <Avatar name={display} size={36} />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{display}</div>
              <div className="text-[11px] text-muted truncate">{user.email}</div>
            </div>
          </div>
          <DropdownMenu.Separator className="h-px bg-border my-1" />

          <Item href={home} icon={<LayoutDashboard size={15} />}>
            {user.role === "SELLER"
              ? "Seller dashboard"
              : user.role === "ADMIN"
                ? "Admin"
                : "Dashboard"}
          </Item>
          {user.role === "CUSTOMER" && (
            <>
              <Item href="/dashboard/orders" icon={<Package size={15} />}>
                Orders
              </Item>
              <Item href="/dashboard/warranties" icon={<ShieldCheck size={15} />}>
                NFT warranties
              </Item>
            </>
          )}
          {user.role === "SELLER" && (
            <Item href="/seller/products" icon={<Store size={15} />}>
              Products
            </Item>
          )}
          <Item href="/dashboard/settings" icon={<Settings size={15} />}>
            Settings
          </Item>

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          <DropdownMenu.Item
            onSelect={(e) => {
              e.preventDefault();
              void logout();
            }}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-danger cursor-pointer outline-none data-[highlighted]:bg-danger/10"
          >
            <LogOut size={15} />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const Item = ({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <DropdownMenu.Item asChild>
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm cursor-pointer outline-none data-[highlighted]:bg-surface2"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  </DropdownMenu.Item>
);

// Fallback used by mobile bottom nav and other compact spots.
export const SignOutPill = () => {
  const logout = useLogout();
  return (
    <button
      onClick={logout}
      className="inline-flex items-center gap-2 text-sm text-danger hover:underline"
    >
      <UserIcon size={14} /> Sign out
    </button>
  );
};
