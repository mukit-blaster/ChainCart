"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  MessageSquare,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProductArt } from "@/components/ProductArt";
import { fmtUSD } from "@/lib/format";

// Tunable spring used across all entry animations so motion feels coherent.
const ease = [0.22, 1, 0.36, 1] as const;
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease, delay },
});

export default function Page() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ProductMarquee />
      <HowItWorks />
      <FeatureGrid />
      <Stats />
      <Testimonials />
      <FinalCTA />
    </>
  );
}

const Hero = () => (
  <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-6">
    {/* Aurora layer */}
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      <div
        className="cc-aurora-blob"
        style={{
          top: "-10%",
          left: "10%",
          width: 520,
          height: 520,
          background: "radial-gradient(circle, #2563EB 0%, transparent 70%)",
        }}
      />
      <div
        className="cc-aurora-blob"
        style={{
          top: "20%",
          right: "-5%",
          width: 480,
          height: 480,
          background: "radial-gradient(circle, #10B981 0%, transparent 70%)",
          animationDelay: "-5s",
        }}
      />
      <div
        className="cc-aurora-blob"
        style={{
          bottom: "-15%",
          left: "30%",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
          animationDelay: "-10s",
        }}
      />
    </div>

    <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div>
        <motion.div {...fade(0)} className="inline-flex items-center gap-2 cc-glass rounded-full px-3 py-1.5 mb-6">
          <span className="cc-pulse-dot inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-fg2">
            Live on chain · 243 verifications today
          </span>
        </motion.div>

        <motion.h1 {...fade(0.05)} className="cc-display">
          Commerce, but{" "}
          <span className="cc-grad-text cc-glow sm:whitespace-nowrap">provably real</span>.
        </motion.h1>

        <motion.p {...fade(0.15)} className="mt-6 text-fg2 text-lg leading-relaxed max-w-xl">
          ChainCart pairs a beautifully fast shopping experience with on-chain product
          verification and NFT warranties — so what you buy stays provably yours.
        </motion.p>

        <motion.div {...fade(0.25)} className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="brand" size="lg" className="rounded-full">
            <Link href="/shop">
              Start shopping <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="rounded-full">
            <Link href="/register?role=seller">Sell on ChainCart</Link>
          </Button>
        </motion.div>

        <motion.div {...fade(0.35)} className="mt-10 md:mt-12 grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
          <HeroStat value="50k+" label="Verified products" />
          <HeroStat value="12k" label="NFT warranties" />
          <HeroStat value="98%" label="Satisfaction" />
        </motion.div>
      </div>

      <FloatingShowcase />
    </div>
  </section>
);

const HeroStat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="text-2xl sm:text-3xl font-semibold tracking-tight">{value}</div>
    <div className="text-xs text-muted mt-1">{label}</div>
  </div>
);

const FloatingShowcase = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease }}
    className="relative h-[520px] hidden md:block"
  >
    {/* Hero product card */}
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="cc-card-lg cc-conic-border absolute top-12 right-0 w-[300px] p-4 shadow-ccLg z-20"
    >
      <div className="rounded-[14px] overflow-hidden aspect-square bg-surface2">
        <ProductArt kind="watch" paletteJson='["#dbeafe","#c7d2fe","#2563EB"]' />
      </div>
      <div className="flex justify-between items-center mt-3">
        <div>
          <div className="text-sm font-semibold">Nomad Chrono 38</div>
          <div className="text-xs text-muted">Helix Atelier</div>
        </div>
        <span className="cc-badge-verified">
          <ShieldCheck size={11} /> NFT
        </span>
      </div>
      <div className="flex justify-between items-baseline mt-2">
        <span className="text-lg font-semibold">{fmtUSD(184900)}</span>
        <span className="cc-mono text-[11px] text-muted">0.71 ETH</span>
      </div>
    </motion.div>

    {/* Verification toast */}
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: -2 }}
      className="cc-card absolute bottom-24 left-0 w-64 p-3.5 shadow-ccLg z-30"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-9 h-9 rounded-[10px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <BadgeCheck size={18} />
        </div>
        <div>
          <div className="text-xs font-semibold">Authenticity verified</div>
          <div className="text-[11px] text-muted">On-chain · 14s ago</div>
        </div>
      </div>
      <div className="cc-mono text-[10px] text-muted bg-surface2 p-2 rounded-lg break-all">
        0x9a3f8b…7f6a
      </div>
    </motion.div>

    {/* NFT warranty card */}
    <motion.div
      animate={{ y: [0, -6, 0], rotate: [0, 1, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: -4 }}
      className="absolute top-52 right-56 w-52 rounded-2xl p-3 text-white z-10"
      style={{
        background: "linear-gradient(135deg, #0b1325, #1e1b4b)",
        boxShadow: "0 24px 60px -12px rgba(37,99,235,.4)",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <div className="text-[10px] opacity-60 tracking-widest uppercase">NFT Warranty</div>
      <div className="text-sm font-semibold mt-1">#001829</div>
      <div
        className="h-20 mt-2 rounded-xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #2563EB, #10B981)" }}
      >
        <ShieldCheck size={32} className="text-white" />
      </div>
      <div className="text-[10px] mt-2 opacity-70">Valid through 2031</div>
    </motion.div>

    {/* Order shipped chip */}
    <motion.div
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: -1 }}
      className="cc-card absolute bottom-2 right-12 w-56 p-3 shadow-ccLg z-20"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
          <Package size={16} />
        </div>
        <div>
          <div className="text-xs font-semibold">Shipped</div>
          <div className="text-[11px] text-muted">Order CC-9TX0 · 2 items</div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const TrustStrip = () => (
  <section className="relative py-8 px-6 border-y border-border bg-surface/40">
    <motion.div {...fade(0)} className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-80">
      {["Helix", "FORMA", "Halcyon", "Atelier Mira", "Studio Pelago", "Sona", "Lumen"].map((n) => (
        <span key={n} className="text-base text-muted tracking-wide" style={{ fontFamily: "serif" }}>
          {n}
        </span>
      ))}
    </motion.div>
  </section>
);

const PRODUCTS = [
  { kind: "watch", palette: '["#dbeafe","#c7d2fe","#2563EB"]', title: "Nomad Chrono 38", price: 184900 },
  { kind: "sneaker", palette: '["#dcfce7","#a7f3d0","#10B981"]', title: "Aero Runner v3", price: 21900 },
  { kind: "phone", palette: '["#fef3c7","#fde68a","#F59E0B"]', title: "Halcyon Phone Pro", price: 129900 },
  { kind: "bag", palette: '["#fee2e2","#fecaca","#EF4444"]', title: "Mira Tote · Caramel", price: 69500 },
  { kind: "art", palette: '["#ede9fe","#ddd6fe","#8B5CF6"]', title: "Edition №14 — Drift", price: 38000 },
  { kind: "headphones", palette: '["#cffafe","#a5f3fc","#06b6d4"]', title: "Sona Studio Headphones", price: 29900 },
  { kind: "camera", palette: '["#e0e7ff","#c7d2fe","#6366f1"]', title: "Lumen M2 Mirrorless", price: 209900 },
  { kind: "chair", palette: '["#fce7f3","#fbcfe8","#ec4899"]', title: "Perch Lounge Chair", price: 89000 },
];

const ProductMarquee = () => (
  <section className="relative py-16 overflow-hidden">
    <div className="text-center mb-10 px-6">
      <div className="cc-eyebrow mb-2">Featured</div>
      <h2 className="cc-h2">A taste of the marketplace</h2>
    </div>
    <div className="cc-marquee-pause overflow-hidden">
      <div className="cc-marquee gap-5">
        {[...PRODUCTS, ...PRODUCTS].map((p, i) => (
          <div key={i} className="cc-card w-56 shrink-0 overflow-hidden">
            <div className="aspect-square cc-prod-img">
              <ProductArt kind={p.kind} paletteJson={p.palette} />
            </div>
            <div className="p-3.5">
              <div className="text-sm font-semibold truncate">{p.title}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium">{fmtUSD(p.price)}</span>
                <span className="cc-badge-verified">
                  <ShieldCheck size={10} /> NFT
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const STEPS = [
  {
    icon: <ShieldCheck size={20} />,
    title: "Pick a verified product",
    body: "Every listing carries a hash on-chain. Tap the badge to see who registered it.",
  },
  {
    icon: <Wallet size={20} />,
    title: "Pay your way",
    body: "Card, ETH, or stablecoin — checkout in under 30 seconds.",
  },
  {
    icon: <BadgeCheck size={20} />,
    title: "Own the proof",
    body: "An NFT warranty lands in your wallet. Resell with full provenance.",
  },
];

const HowItWorks = () => (
  <section className="relative py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div {...fade(0)} className="text-center mb-12">
        <div className="cc-eyebrow mb-2">How it works</div>
        <h2 className="cc-h2">Three steps from cart to chain</h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-5 relative">
        {STEPS.map((s, i) => (
          <motion.div key={i} {...fade(i * 0.1)} className="relative">
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                  style={{ background: "linear-gradient(135deg,#2563EB,#10B981)" }}
                >
                  {s.icon}
                </div>
                <div className="text-lg sm:text-2xl font-semibold tracking-tight text-muted">
                  0{i + 1}
                </div>
              </div>
              <div className="cc-h3 mb-1">{s.title}</div>
              <div className="text-fg2 text-sm leading-relaxed">{s.body}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FEATURES = [
  { icon: <ShieldCheck size={22} />, color: "#2563EB", title: "Verified authenticity", body: "Every product is fingerprinted on-chain and verifiable in seconds — no fakes, no guesswork." },
  { icon: <BadgeCheck size={22} />, color: "#10B981", title: "NFT warranties", body: "A transferable, on-chain proof of ownership. Resell with full provenance." },
  { icon: <Wallet size={22} />, color: "#8B5CF6", title: "Wallet-native", body: "Pay with card or crypto. Connect your wallet for one-tap login and instant rewards." },
  { icon: <Globe2 size={22} />, color: "#F59E0B", title: "Global, by default", body: "Multi-currency pricing, regional shipping, and fraud-resistant escrow." },
  { icon: <MessageSquare size={22} />, color: "#EF4444", title: "Realtime support", body: "Chat directly with sellers. Typing, presence, and image sharing baked in." },
  { icon: <TrendingUp size={22} />, color: "#06b6d4", title: "Made for sellers", body: "Beautiful storefronts, instant payouts, and analytics that actually help you grow." },
];

const FeatureGrid = () => (
  <section className="relative py-20 px-6 overflow-hidden">
    <div aria-hidden className="absolute inset-0 cc-dot-grid opacity-30 pointer-events-none" />
    <div className="relative max-w-7xl mx-auto">
      <motion.div {...fade(0)} className="text-center mb-12">
        <div className="cc-eyebrow mb-2">Platform</div>
        <h2 className="cc-h2">Built for the next era of commerce</h2>
        <p className="text-fg2 max-w-2xl mx-auto mt-3">
          Three primitives — verification, ownership, and trust — composed into a single experience.
        </p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div key={i} {...fade(i * 0.05)}>
            <Card className="p-6 h-full transition hover:-translate-y-1 hover:shadow-ccLg group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition group-hover:scale-110"
                style={{ background: `${f.color}1a`, color: f.color }}
              >
                {f.icon}
              </div>
              <div className="cc-h3 mb-1.5">{f.title}</div>
              <div className="text-fg2 text-sm leading-relaxed">{f.body}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const STAT_CARDS = [
  { value: "50,420", label: "Verified products", color: "#2563EB" },
  { value: "$2.1M", label: "Volume on-chain", color: "#10B981" },
  { value: "98.4%", label: "Buyer satisfaction", color: "#8B5CF6" },
  { value: "12,200+", label: "NFT warranties minted", color: "#F59E0B" },
];

const Stats = () => (
  <section className="relative py-16 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
      {STAT_CARDS.map((s, i) => (
        <motion.div key={i} {...fade(i * 0.05)}>
          <Card className="p-5 sm:p-6 text-center">
            <div className="text-2xl sm:text-4xl font-semibold tracking-tight" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-muted mt-2 uppercase tracking-wider">{s.label}</div>
          </Card>
        </motion.div>
      ))}
    </div>
  </section>
);

const TESTIMONIALS = [
  { name: "Maya Lin", role: "Watch collector", body: "I bought a vintage piece on ChainCart and the NFT warranty made the resale ironclad. Authenticity proof is a game-changer." },
  { name: "Daniel Park", role: "Independent seller", body: "Listing on ChainCart took an afternoon. Payouts are instant and the realtime chat closes more sales than email ever did." },
  { name: "Priya Verma", role: "Operations · Helix", body: "Verified product fingerprints cut counterfeit reports to nearly zero. Our customers see the difference immediately." },
];

const Testimonials = () => (
  <section className="relative py-20 px-6">
    <div className="max-w-7xl mx-auto">
      <motion.div {...fade(0)} className="text-center mb-10">
        <div className="cc-eyebrow mb-2">Loved by</div>
        <h2 className="cc-h2">Buyers and sellers, together</h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={t.name} {...fade(i * 0.1)}>
            <Card className="p-6 h-full">
              <div className="flex gap-0.5 text-[#F59E0B] mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} fill="#F59E0B" stroke="#F59E0B" />
                ))}
              </div>
              <p className="text-[15px] leading-relaxed mb-5">"{t.body}"</p>
              <div className="flex items-center gap-3">
                <Avatar name={t.name} />
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="py-20 px-6">
    <motion.div
      {...fade(0)}
      className="relative max-w-5xl mx-auto rounded-[var(--cc-radius-lg)] p-6 sm:p-10 md:p-16 text-center text-white overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(139,92,246,.45), transparent 50%),radial-gradient(circle at 100% 100%, rgba(37,99,235,.55), transparent 50%),radial-gradient(circle at 50% 50%, rgba(16,185,129,.25), transparent 60%),linear-gradient(135deg, #0b1325, #131c33)",
      }}
    >
      <div className="absolute inset-0 cc-dot-grid opacity-10 pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 mb-6 text-xs font-medium">
          <Sparkles size={12} /> Open onboarding · 5-minute setup
        </div>
        <h2 className="cc-h1 mb-4">Open a verified storefront in minutes</h2>
        <p className="opacity-80 max-w-xl mx-auto mb-8">
          Provable authenticity, NFT warranties, instant payouts. Everything your customers expect from a modern marketplace.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="brand" size="lg" className="rounded-full">
            <Link href="/register?role=seller">Become a seller</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="rounded-full text-white border-white/20 hover:bg-white/10">
            <Link href="/shop">Explore marketplace</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  </section>
);
