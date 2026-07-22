"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { shortHash } from "@/lib/format";

interface Warranty {
  id: string;
  tokenId: string;
  txHash: string | null;
  validUntil: string | null;
  product: { title: string; slug: string };
}

export default function WarrantiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["warranties.me"],
    queryFn: async () => {
      const { data } = await api.get<{ items: Warranty[] }>("/blockchain/warranties/me");
      return data;
    },
  });

  return (
    <div className="space-y-5">
      <h1 className="cc-h1">NFT warranties</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : data?.items.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.items.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl p-5 text-white"
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, rgba(139,92,246,.35), transparent 50%),radial-gradient(circle at 100% 100%, rgba(37,99,235,.45), transparent 50%),linear-gradient(135deg, #0b1325, #131c33)",
              }}
            >
              <div className="text-[10px] opacity-60 uppercase tracking-widest">NFT Warranty</div>
              <div className="cc-mono text-sm mt-1">#{w.tokenId}</div>
              <div
                className="h-24 my-4 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}
              >
                <ShieldCheck size={36} />
              </div>
              <div className="text-sm font-medium">{w.product.title}</div>
              {w.validUntil && (
                <div className="text-[11px] opacity-70 mt-1">
                  Valid through {new Date(w.validUntil).getFullYear()}
                </div>
              )}
              {w.txHash && (
                <div className="cc-mono text-[10px] opacity-60 mt-2">{shortHash(w.txHash)}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center text-fg2">
          <ShieldCheck className="mx-auto mb-3 text-emerald-500" size={32} />
          <div className="font-semibold">No warranties yet</div>
          <div className="text-sm mt-1">Warranties are minted automatically once your order ships.</div>
        </Card>
      )}
    </div>
  );
}
