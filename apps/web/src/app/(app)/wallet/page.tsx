"use client";

import { Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useWalletStore } from "@/stores/wallet";
import { walletLogin } from "@/lib/wallet";
import { shortAddress } from "@/lib/format";

export default function WalletPage() {
  const wallet = useWalletStore((s) => s.address);
  const chainId = useWalletStore((s) => s.chainId);

  const onConnect = async () => {
    try {
      await walletLogin();
      toast.success("Wallet connected");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="cc-h1">Wallet</h1>

      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(139,92,246,.35), transparent 50%),radial-gradient(circle at 100% 100%, rgba(37,99,235,.45), transparent 50%),linear-gradient(135deg, #0b1325, #131c33)",
        }}
      >
        <div className="cc-eyebrow opacity-70">Primary wallet</div>
        {wallet ? (
          <>
            <div className="cc-mono text-base sm:text-lg mt-2 break-all">{shortAddress(wallet)}</div>
            <div className="text-xs opacity-70 mt-1">Chain ID: {chainId ?? "—"}</div>
            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl sm:text-3xl font-semibold">2.4831 ETH</span>
              <span className="text-sm opacity-70">≈ $6,455.06</span>
            </div>
          </>
        ) : (
          <div className="mt-6">
            <p className="opacity-80 mb-4 text-sm max-w-md">
              Connect MetaMask to see balances, sign in with your wallet, and pay with crypto.
            </p>
            <Button variant="brand" size="lg" onClick={onConnect}>
              <WalletIcon size={16} /> Connect MetaMask
            </Button>
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="cc-eyebrow mb-3">Recent activity</div>
        <div className="text-fg2 text-sm">No on-chain activity yet.</div>
      </Card>
    </div>
  );
}
