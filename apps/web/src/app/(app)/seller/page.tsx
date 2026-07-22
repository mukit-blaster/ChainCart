"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/format";

interface SellerAnalytics {
  revenue: { day: string; totalCents: number }[];
  totals: { products: number; orders: number; totalCents: number };
}

export default function SellerOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["seller.analytics"],
    queryFn: async () => {
      const { data } = await api.get<SellerAnalytics>("/analytics/seller/me");
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="cc-h1">Storefront overview</h1>
        <p className="text-fg2">Last 14 days · everything you need at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Revenue" value={fmtUSD(data?.totals.totalCents ?? 0)} icon={<DollarSign size={18} />} color="#10B981" />
        <Kpi label="Orders" value={data?.totals.orders ?? 0} icon={<ShoppingCart size={18} />} color="#2563EB" />
        <Kpi label="Active products" value={data?.totals.products ?? 0} icon={<Box size={18} />} color="#8B5CF6" />
        <Kpi label="Conversion" value="3.4%" icon={<TrendingUp size={18} />} color="#F59E0B" />
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="cc-eyebrow">Revenue</div>
            <div className="cc-h2">{fmtUSD(data?.totals.totalCents ?? 0)}</div>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <Sparkline points={(data?.revenue ?? []).map((r) => r.totalCents)} />
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

const Sparkline = ({ points }: { points: number[] }) => {
  if (!points.length) return <div className="text-fg2 text-sm">No data yet.</div>;
  const w = 600;
  const h = 120;
  const max = Math.max(...points, 1);
  const step = w / Math.max(1, points.length - 1);
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (v / max) * (h - 8)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      <defs>
        <linearGradient id="cc-spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2563EB" stopOpacity="0.4" />
          <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#cc-spark)" />
      <path d={path} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
