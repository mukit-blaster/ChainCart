"use client";

import { useState } from "react";
import { ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

interface VerifyResp {
  verified: boolean;
  reason?: string;
  hash?: string;
  product?: { title: string; seller: string; category: string | null };
  contract?: string | null;
  network?: string;
}

export default function VerifyPage() {
  const [hash, setHash] = useState("");
  const [resp, setResp] = useState<VerifyResp | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<VerifyResp>("/blockchain/verify", { hash });
      setResp(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pt-16 pb-20">
      <div className="cc-eyebrow mb-2">Authenticity</div>
      <h1 className="cc-h1 mb-3">Verify a ChainCart product</h1>
      <p className="text-fg2 mb-8">
        Paste the on-chain product fingerprint to confirm it was minted by a verified seller.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="0x9a3f8b2e7c4d1a0f6e9b8c7d5a4f3e2b…"
          className="cc-mono"
        />
        <Button type="submit" variant="brand" size="lg" className="rounded-full sm:w-auto w-full" disabled={loading}>
          {loading ? "Verifying…" : "Verify"}
        </Button>
      </form>

      {resp && (
        <Card className="p-6 mt-6">
          {resp.verified ? (
            <>
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck size={22} />
                <span className="font-semibold">Verified on-chain</span>
              </div>
              {resp.product && (
                <div className="mt-4 space-y-1">
                  <div className="text-sm">
                    <span className="text-muted">Product:</span> {resp.product.title}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Seller:</span> {resp.product.seller}
                  </div>
                  {resp.product.category && (
                    <div className="text-sm">
                      <span className="text-muted">Category:</span> {resp.product.category}
                    </div>
                  )}
                  <div className="text-sm break-all">
                    <span className="text-muted">Hash:</span>{" "}
                    <span className="cc-mono text-xs">{resp.hash}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-danger">
              <ShieldX size={22} />
              <span className="font-semibold">Not registered on-chain</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
