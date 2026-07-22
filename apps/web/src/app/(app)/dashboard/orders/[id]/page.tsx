"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/format";

interface OrderDetail {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  trackingNumber: string | null;
  createdAt: string;
  items: { id: string; titleSnapshot: string; quantity: number; unitPriceCents: number; totalCents: number }[];
  warranties: { id: string; tokenId: string; txHash: string | null }[];
}

const STAGES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get<OrderDetail>(`/orders/${id}`);
      return data;
    },
  });

  if (isLoading) return <Skeleton className="h-96" />;
  if (!data) return null;

  const stageIdx = STAGES.indexOf(data.status as (typeof STAGES)[number]);

  return (
    <div className="space-y-5">
      <div>
        <div className="cc-eyebrow">Order</div>
        <h1 className="cc-h1 cc-mono">{data.number}</h1>
        <div className="text-fg2 text-sm">Placed {new Date(data.createdAt).toLocaleString()}</div>
      </div>

      <Card className="p-6">
        <div className="cc-eyebrow mb-4">Tracking</div>
        <div className="flex items-center">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  i <= stageIdx ? "bg-brand text-white" : "bg-surface2 text-fg2"
                }`}
              >
                {i + 1}
              </div>
              {i < STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < stageIdx ? "bg-brand" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-3">
          {STAGES.map((s, i) => (
            <span
              key={s}
              className={`text-[10px] sm:text-xs truncate ${i <= stageIdx ? "text-fg" : "text-muted"}`}
            >
              {s}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="cc-eyebrow mb-4">Items</div>
        <table className="w-full text-sm">
          <tbody>
            {data.items.map((it) => (
              <tr key={it.id} className="border-t border-border first:border-t-0">
                <td className="py-3">
                  <div className="font-medium">{it.titleSnapshot}</div>
                  <div className="text-xs text-muted">Qty {it.quantity}</div>
                </td>
                <td className="text-right font-medium">{fmtUSD(it.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-6">
        <div className="cc-eyebrow mb-3">Summary</div>
        <Row label="Subtotal" value={fmtUSD(data.subtotalCents)} />
        <Row label="Shipping" value={fmtUSD(data.shippingCents)} />
        <Row label="Tax" value={fmtUSD(data.taxCents)} />
        <div className="border-t border-border my-3" />
        <Row label="Total" value={fmtUSD(data.totalCents)} bold />
        <div className="text-xs text-muted mt-3">
          Paid via {data.paymentMethod} · {data.paymentStatus}
        </div>
      </Card>
    </div>
  );
}

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex justify-between py-1 ${bold ? "text-base font-semibold" : "text-sm text-fg2"}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
