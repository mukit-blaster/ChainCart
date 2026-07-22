"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

export default function SavedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["wishlist.me"],
    queryFn: async () => {
      const { data } = await api.get("/wishlist");
      return data;
    },
  });

  return (
    <div className="space-y-5">
      <h1 className="cc-h1">Saved items</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data?.items?.map((it: { product: import("@/components/ProductCard").ProductCardData }) => (
            <ProductCard key={it.product.id} product={it.product} />
          ))}
        </div>
      )}
    </div>
  );
}
