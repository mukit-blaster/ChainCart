"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

const CATEGORIES = ["All", "Watches", "Sneakers", "Electronics", "Bags", "Art", "Audio", "Cameras", "Home"];
const SORTS = [
  { id: "new", label: "Newest" },
  { id: "popular", label: "Popular" },
  { id: "priceAsc", label: "Price ↑" },
  { id: "priceDesc", label: "Price ↓" },
] as const;

export default function ShopPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("new");

  const { data, isLoading } = useQuery({
    queryKey: ["products", { q, category, sort }],
    queryFn: async () => {
      const { data } = await api.get<{ items: ProductCardData[]; total: number }>("/products", {
        params: {
          q: q || undefined,
          category: category !== "All" ? category.toLowerCase() : undefined,
          sort,
        },
      });
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
      <div className="cc-eyebrow mb-2">Marketplace</div>
      <h1 className="cc-h1 mb-6">Verified picks from independent sellers</h1>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, sellers, SKUs"
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl border border-border bg-surface">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium",
                sort === s.id ? "bg-surface2 text-fg" : "text-fg2 hover:text-fg",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}>
            <Chip
              className={cn(
                "cursor-pointer transition",
                category === c && "bg-fg text-bg border-fg",
              )}
            >
              {c}
            </Chip>
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="cc-card overflow-hidden">
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {data.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="cc-card py-20 text-center text-fg2">
          <div className="text-lg font-semibold">No products found</div>
          <div className="text-sm mt-1">Try a different search or category.</div>
        </div>
      )}
    </div>
  );
}
