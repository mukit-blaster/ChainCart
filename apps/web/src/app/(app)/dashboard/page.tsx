"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart, Package, ShieldCheck, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { fmtUSD } from "@/lib/format";

interface OrderItem { id: string; titleSnapshot: string; quantity: number }
interface Order { id: string; number: string; status: string; totalCents: number; createdAt: string; items: OrderItem[] }

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ["orders.me"],
    queryFn: async () => {
      const { data } = await api.get<{ items: Order[] }>("/orders");
      return data;
    },
  });
  const { data: wishlist } = useQuery({
    queryKey: ["wishlist.me"],
    queryFn: async () => {
      const { data } = await api.get<{ items: unknown[] }>("/wishlist");
      return data;
    },
  });
  const { data: warranties } = useQuery({
    queryKey: ["warranties.me"],
    queryFn: async () => {
      const { data } = await api.get<{ items: unknown[] }>("/blockchain/warranties/me");
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="cc-h1">Hi {user?.name?.split(" ")[0] ?? "there"}</h1>
        <p className="text-fg2">Here's what's happening with your account.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Orders" value={data?.items.length ?? 0} icon={<Package size={18} />} color="#2563EB" />
        <KpiCard label="Saved items" value={wishlist?.items.length ?? 0} icon={<Heart size={18} />} color="#EF4444" />
        <KpiCard label="NFT warranties" value={warranties?.items.length ?? 0} icon={<ShieldCheck size={18} />} color="#10B981" />
        <KpiCard label="Wallet" value={user?.walletAddress ? "Linked" : "—"} icon={<Wallet size={18} />} color="#8B5CF6" />
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="cc-h3">Recent orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-brand">View all</Link>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="text-fg2 text-left">
                <tr>
                  <th className="py-2 font-medium">Order</th>
                  <th className="font-medium">Items</th>
                  <th className="font-medium">Status</th>
                  <th className="font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="py-3 cc-mono text-xs">{o.number}</td>
                    <td>{o.items.length}</td>
                    <td>
                      <span className="cc-chip">{o.status}</span>
                    </td>
                    <td className="text-right font-medium">{fmtUSD(o.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-fg2 text-sm">No orders yet.</div>
        )}
      </Card>
    </div>
  );
}

const KpiCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <span className="cc-eyebrow">{label}</span>
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}1a`, color }}>
        {icon}
      </span>
    </div>
    <div className="cc-h2 mt-2">{value}</div>
  </Card>
);
