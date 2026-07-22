"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCartStore } from "@/stores/cart";

function CheckoutSuccessInner() {
  const search = useSearchParams();
  const orderId = search.get("orderId");
  const status = search.get("redirect_status");
  const clear = useCartStore((s) => s.clear);

  // Stripe lands here after confirmPayment. The webhook flips the order to
  // PAID server-side; the cart is cleared on the client.
  useEffect(() => {
    if (status === "succeeded") clear();
  }, [status, clear]);

  const ok = status === "succeeded";

  return (
    <div className="max-w-xl mx-auto px-6 pt-20 pb-32 text-center">
      <div
        className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
          ok ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
        }`}
      >
        <CheckCircle2 size={32} />
      </div>
      <h1 className="cc-h1 mb-2">
        {ok ? "Payment received" : "Payment processing"}
      </h1>
      <p className="text-fg2 mb-8">
        {ok
          ? "Thanks — your order is on its way. Your NFT warranty is being minted to your wallet."
          : "Hang tight while your bank confirms the charge. We'll update your order as soon as it clears."}
      </p>
      <Card className="p-5 text-left mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-emerald-600 mt-0.5" size={18} />
          <div className="text-sm">
            <div className="font-medium">Authenticity locked in</div>
            <div className="text-muted text-xs mt-0.5">
              The product fingerprint has been registered on-chain and your warranty
              token will arrive shortly.
            </div>
          </div>
        </div>
      </Card>
      <div className="flex justify-center gap-3">
        {orderId && (
          <Button asChild variant="brand" size="lg" className="rounded-full">
            <Link href={`/dashboard/orders/${orderId}`}>View order</Link>
          </Button>
        )}
        <Button asChild variant="ghost" size="lg" className="rounded-full">
          <Link href="/shop">Keep shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}
