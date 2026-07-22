import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { ProductArt } from "./ProductArt";
import { VerifiedBadge } from "./ui/Badge";
import { fmtETH, fmtUSD } from "@/lib/format";

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  hasNFTWarranty: boolean;
  artKind?: string | null;
  paletteJson?: string | null;
  seller: { displayName: string };
  primaryImage?: { url: string; alt: string | null } | null;
}

export const ProductCard = ({ product }: { product: ProductCardData }) => (
  <Link
    href={`/shop/${product.slug}`}
    className="cc-card group block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-ccLg"
  >
    <div className="aspect-square cc-prod-img">
      {product.primaryImage?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.primaryImage.url}
          alt={product.primaryImage.alt ?? product.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <ProductArt kind={product.artKind} paletteJson={product.paletteJson} />
      )}
      <button
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:scale-105 transition"
        aria-label="Save to wishlist"
        onClick={(e) => e.preventDefault()}
      >
        <Heart size={14} />
      </button>
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{product.seller.displayName}</span>
        {product.hasNFTWarranty && <VerifiedBadge>NFT</VerifiedBadge>}
      </div>
      <div className="font-semibold mt-1 truncate">{product.title}</div>
      <div className="flex items-center gap-1 mt-1 text-xs text-muted">
        <Star size={12} className="fill-amber-400 stroke-amber-400" />
        <span>{product.rating.toFixed(1)}</span>
        <span>· {product.reviewCount}</span>
      </div>
      <div className="flex items-baseline justify-between mt-3">
        <span className="font-semibold">{fmtUSD(product.priceCents)}</span>
        <span className="cc-mono text-[11px] text-muted">{fmtETH(product.priceCents)}</span>
      </div>
    </div>
  </Link>
);
