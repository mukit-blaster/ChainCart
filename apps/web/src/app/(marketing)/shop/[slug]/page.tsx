"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, MessageSquare, ShieldCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { VerifiedBadge } from "@/components/ui/Badge";
import { ProductArt } from "@/components/ProductArt";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { fmtETH, fmtUSD, shortHash } from "@/lib/format";

interface ProductDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceCents: number;
  discountPct: number;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  isVerified: boolean;
  hasNFTWarranty: boolean;
  blockchainHash: string | null;
  artKind: string | null;
  paletteJson: string | null;
  seller: { id: string; userId: string; displayName: string };
  images: { id: string; url: string; alt: string | null }[];
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const [chatBusy, setChatBusy] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await api.get<ProductDetail>(`/products/${slug}`);
      return data;
    },
  });

  const onSave = async () => {
    if (!product) return;
    if (!user) {
      router.push(`/login?next=/shop/${product.slug}`);
      return;
    }
    try {
      const { data } = await api.post("/wishlist/toggle", { productId: product.id });
      toast.success(data.saved ? "Saved to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  const onMessageSeller = async () => {
    if (!product) return;
    if (!user) {
      router.push(`/login?next=/shop/${product.slug}`);
      return;
    }
    if (user.id === product.seller.userId) {
      toast.error("That's your own product");
      return;
    }
    setChatBusy(true);
    try {
      await api.post("/chat/conversations", {
        sellerId: product.seller.userId,
        productId: product.id,
      });
      router.push("/chat");
    } catch {
      toast.error("Could not start conversation");
    } finally {
      setChatBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-12 grid md:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="cc-card overflow-hidden">
          <div className="aspect-square cc-prod-img">
            {product.images[0]?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <ProductArt kind={product.artKind} paletteJson={product.paletteJson} />
            )}
          </div>
        </div>

        <div>
          <div className="text-sm text-muted">{product.seller.displayName}</div>
          <h1 className="cc-h1 mt-1">{product.title}</h1>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="fill-amber-400 stroke-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-muted">· {product.reviewCount} reviews</span>
            </div>
            {product.isVerified && <VerifiedBadge>Verified on-chain</VerifiedBadge>}
            {product.hasNFTWarranty && <VerifiedBadge>NFT warranty</VerifiedBadge>}
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="cc-h2">{fmtUSD(product.priceCents)}</span>
            <span className="cc-mono text-sm text-muted">{fmtETH(product.priceCents)}</span>
          </div>

          <p className="mt-6 text-fg2 leading-relaxed">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="brand"
              size="lg"
              className="rounded-full"
              onClick={() => {
                add({
                  productId: product.id,
                  title: product.title,
                  priceCents: product.priceCents,
                  discountPct: product.discountPct,
                  quantity: 1,
                  imageUrl: product.images[0]?.url ?? null,
                  artKind: product.artKind,
                  paletteJson: product.paletteJson,
                  sellerName: product.seller.displayName,
                });
                toast.success("Added to cart");
              }}
            >
              Add to cart
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full" onClick={onSave}>
              <Heart size={16} /> Save
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full"
              onClick={onMessageSeller}
              disabled={chatBusy}
            >
              <MessageSquare size={16} /> {chatBusy ? "Opening…" : "Message seller"}
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Card className="p-4 flex gap-3 items-center">
              <Truck size={18} className="text-brand" />
              <div>
                <div className="text-sm font-semibold">Free 3-day shipping</div>
                <div className="text-xs text-muted">Arrives by Tuesday</div>
              </div>
            </Card>
            <Card className="p-4 flex gap-3 items-center">
              <ShieldCheck size={18} className="text-emerald-600" />
              <div>
                <div className="text-sm font-semibold">5-year NFT warranty</div>
                <div className="text-xs text-muted">Transferable on-chain</div>
              </div>
            </Card>
          </div>

          {product.blockchainHash && (
            <Card className="p-4 mt-3">
              <div className="cc-eyebrow mb-1">Authenticity</div>
              <div className="text-sm">SKU: <span className="cc-mono">{product.sku}</span></div>
              <div className="text-sm break-all">
                Hash: <span className="cc-mono text-muted">{shortHash(product.blockchainHash)}</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
