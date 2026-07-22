"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/format";

interface Order {
  id: string;
  number: string;
  status: string;
  totalCents: number;
  createdAt: string;
  items: { id: string; titleSnapshot: string; quantity: number }[];
}

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders.me"],
    queryFn: async () => {
      const { data } = await api.get<{ items: Order[] }>("/orders");
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="cc-h1">Orders</h1>
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-fg2 text-left bg-surface2">
                <tr>
                  <th className="py-3 px-5 font-medium">Order</th>
                  <th className="font-medium">Date</th>
                  <th className="font-medium">Items</th>
                  <th className="font-medium">Status</th>
                  <th className="font-medium text-right pr-5">Total</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-surface2/40">
                    <td className="py-3 px-5">
                      <Link className="cc-mono text-xs text-brand" href={`/dashboard/orders/${o.id}`}>
                        {o.number}
                      </Link>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>{o.items.length}</td>
                    <td>
                      <span className="cc-chip">{o.status}</span>
                    </td>
                    <td className="text-right pr-5 font-medium">{fmtUSD(o.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
