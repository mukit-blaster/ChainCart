"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, ShoppingCart, Store, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/format";

interface AdminAnalytics {
  totals: { users: number; sellers: number; products: number; orders: number };
  revenue: { day: string; totalCents: number }[];
}

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin.analytics"],
    queryFn: async () => {
      const { data } = await api.get<AdminAnalytics>("/analytics/admin");
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="cc-h1">Platform overview</h1>
        <p className="text-fg2">Aggregate health across all sellers and customers.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Users" value={data?.totals.users ?? 0} icon={<Users size={18} />} color="#2563EB" />
        <Kpi label="Sellers" value={data?.totals.sellers ?? 0} icon={<Store size={18} />} color="#10B981" />
        <Kpi label="Products" value={data?.totals.products ?? 0} icon={<Box size={18} />} color="#8B5CF6" />
        <Kpi label="Orders" value={data?.totals.orders ?? 0} icon={<ShoppingCart size={18} />} color="#F59E0B" />
      </div>

      <Card className="p-6">
        <div className="cc-eyebrow mb-2">Revenue (14 days)</div>
        {isLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <div className="grid grid-cols-7 md:grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5 items-end h-32">
            {(data?.revenue ?? []).map((r, i) => {
              const max = Math.max(1, ...(data?.revenue ?? []).map((x) => x.totalCents));
              const h = (r.totalCents / max) * 100;
              return (
                <div
                  key={i}
                  title={fmtUSD(r.totalCents)}
                  className="rounded-md bg-brand/80 hover:bg-brand transition"
                  style={{ height: `${Math.max(h, 4)}%` }}
                />
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

const Kpi = ({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) => (
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
