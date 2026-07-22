"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { shortHash } from "@/lib/format";

interface Tx {
  id: string;
  kind: string;
  txHash: string;
  status: string;
  blockNumber: number | null;
  createdAt: string;
}

export default function BlockchainPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["blockchain.tx"],
    queryFn: async () => {
      const { data } = await api.get<{ items: Tx[] }>("/blockchain/transactions/me");
      return data;
    },
  });

  return (
    <div className="space-y-5 max-w-4xl">
      <h1 className="cc-h1">Blockchain activity</h1>
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : data?.items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead className="text-fg2 text-left bg-surface2">
                <tr>
                  <th className="py-3 px-5 font-medium">Hash</th>
                  <th className="font-medium">Kind</th>
                  <th className="font-medium">Block</th>
                  <th className="font-medium">Status</th>
                  <th className="font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="py-3 px-5 cc-mono text-xs">{shortHash(t.txHash)}</td>
                    <td>{t.kind}</td>
                    <td>{t.blockNumber ?? "—"}</td>
                    <td>
                      <span className="cc-chip">{t.status}</span>
                    </td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-fg2 text-sm">
            No on-chain transactions yet. Buy a verified product to mint your first NFT warranty.
          </div>
        )}
      </Card>
    </div>
  );
}
