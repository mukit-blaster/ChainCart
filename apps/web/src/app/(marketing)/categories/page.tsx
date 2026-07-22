"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<{ items: Category[] }>("/categories");
      return data;
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">
      <h1 className="cc-h1 mb-6">Browse categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : data?.items.map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`}>
                <Card className="p-6 transition hover:-translate-y-0.5 hover:shadow-ccLg">
                  <div className="cc-eyebrow mb-1">Shop</div>
                  <div className="cc-h3">{c.name}</div>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  );
}
