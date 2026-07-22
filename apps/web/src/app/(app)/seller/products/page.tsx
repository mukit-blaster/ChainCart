"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/format";
import { useAuthStore } from "@/stores/auth";

interface Product {
  id: string;
  title: string;
  priceCents: number;
  stock: number;
  isVerified: boolean;
  reviewCount: number;
  rating: number;
  seller: { id: string };
}

export default function SellerProductsPage() {
  const user = useAuthStore((s) => s.user);
  // Naïve: fetch all and filter client-side. A real seller dashboard would
  // pass ?sellerId= to the API; the route already supports it.
  const { data, isLoading } = useQuery({
    queryKey: ["seller.products"],
    queryFn: async () => {
      const { data } = await api.get<{ items: Product[] }>("/products", {
        params: { pageSize: 60 },
      });
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="cc-h1">Products</h1>
        <Button asChild variant="brand" className="rounded-full">
          <Link href="/seller/products/new">
            <Plus size={16} /> New product
          </Link>
        </Button>
      </div>

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
                  <th className="py-3 px-5 font-medium">Title</th>
                  <th className="font-medium">Price</th>
                  <th className="font-medium">Stock</th>
                  <th className="font-medium">Verified</th>
                  <th className="font-medium">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-surface2/40">
                    <td className="py-3 px-5 font-medium">{p.title}</td>
                    <td>{fmtUSD(p.priceCents)}</td>
                    <td>{p.stock}</td>
                    <td>{p.isVerified ? "✓" : "—"}</td>
                    <td>{p.reviewCount}</td>
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
