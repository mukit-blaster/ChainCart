"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProductArt } from "@/components/ProductArt";
import { useCartStore } from "@/stores/cart";
import { fmtUSD } from "@/lib/format";

export default function CartPage() {
  const { items, setQuantity, remove, subtotalCents } = useCartStore();
  const subtotal = subtotalCents();
  const tax = Math.round(subtotal * 0.07);
  const shipping = items.length ? 999 : 0;
  const total = subtotal + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="cc-h1 mb-2">Your cart is empty</h1>
        <p className="text-fg2 mb-6">Browse the marketplace to find verified products.</p>
        <Button asChild variant="brand" size="lg" className="rounded-full">
          <Link href="/shop">Go shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-3">
        <h1 className="cc-h1 mb-3">Cart</h1>
        {items.map((it) => (
          <Card key={it.productId} className="p-4 flex gap-3 sm:gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden cc-prod-img flex-shrink-0">
              {it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.imageUrl} alt={it.title} className="w-full h-full object-cover" />
              ) : (
                <ProductArt kind={it.artKind} paletteJson={it.paletteJson} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{it.title}</div>
                  <div className="text-xs text-muted truncate">{it.sellerName}</div>
                </div>
                <div className="font-semibold shrink-0 whitespace-nowrap">
                  {fmtUSD(it.priceCents * it.quantity)}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-surface2"
                  onClick={() => setQuantity(it.productId, Math.max(1, it.quantity - 1))}
                  aria-label="Decrease"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm">{it.quantity}</span>
                <button
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-surface2"
                  onClick={() => setQuantity(it.productId, it.quantity + 1)}
                  aria-label="Increase"
                >
                  <Plus size={12} />
                </button>
                <button
                  className="ml-1 sm:ml-3 text-muted hover:text-danger inline-flex items-center gap-1 text-sm"
                  onClick={() => remove(it.productId)}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5 h-fit sticky top-24">
        <div className="cc-eyebrow mb-3">Summary</div>
        <Row label="Subtotal" value={fmtUSD(subtotal)} />
        <Row label="Tax (7%)" value={fmtUSD(tax)} />
        <Row label="Shipping" value={fmtUSD(shipping)} />
        <div className="border-t border-border my-3" />
        <Row label="Total" value={fmtUSD(total)} bold />
        <Button asChild variant="brand" size="lg" className="rounded-full mt-5 w-full">
          <Link href="/checkout">Checkout</Link>
        </Button>
      </Card>
    </div>
  );
}

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex justify-between py-1 ${bold ? "text-base font-semibold" : "text-sm text-fg2"}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
