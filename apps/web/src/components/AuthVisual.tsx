"use client";

import { motion } from "framer-motion";
import { BadgeCheck, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { ProductArt } from "./ProductArt";

interface Props {
  eyebrow: string;
  headline: string;
  body: string;
  testimonial?: { name: string; role: string; quote: string };
}

const ease = [0.22, 1, 0.36, 1] as const;

export const AuthVisual = ({ eyebrow, headline, body, testimonial }: Props) => (
  <div
    className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white"
    style={{
      background:
        "radial-gradient(circle at 0% 0%, rgba(139,92,246,.45), transparent 50%),radial-gradient(circle at 100% 100%, rgba(37,99,235,.55), transparent 50%),radial-gradient(circle at 50% 50%, rgba(16,185,129,.25), transparent 60%),linear-gradient(135deg, #0b1325, #131c33)",
    }}
  >
    {/* Drifting blobs */}
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      <div
        className="cc-aurora-blob"
        style={{
          top: "10%",
          left: "-10%",
          width: 420,
          height: 420,
          background: "radial-gradient(circle,#2563EB 0%, transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div
        className="cc-aurora-blob"
        style={{
          bottom: "-15%",
          right: "-5%",
          width: 460,
          height: 460,
          background: "radial-gradient(circle,#10B981 0%, transparent 70%)",
          animationDelay: "-6s",
          opacity: 0.4,
        }}
      />
    </div>

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="relative z-10 max-w-md"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 mb-6 text-xs font-medium">
        <Sparkles size={12} /> {eyebrow}
      </div>
      <h2 className="text-4xl font-semibold tracking-tight leading-tight mb-4">
        {headline}
      </h2>
      <p className="text-white/70 leading-relaxed">{body}</p>
    </motion.div>

    {/* Floating cards */}
    <div className="relative h-[280px] my-8">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="cc-card-lg absolute top-0 right-8 w-60 p-3 text-fg [color-scheme:light]"
      >
        <div className="rounded-[12px] overflow-hidden aspect-square bg-surface2">
          <ProductArt kind="watch" paletteJson='["#dbeafe","#c7d2fe","#2563EB"]' />
        </div>
        <div className="flex justify-between items-center mt-2.5">
          <div>
            <div className="text-xs font-semibold">Nomad Chrono 38</div>
            <div className="text-[11px] text-muted">Helix Atelier</div>
          </div>
          <span className="cc-badge-verified">
            <ShieldCheck size={10} /> NFT
          </span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: -2 }}
        className="absolute bottom-0 left-0 w-64 rounded-2xl p-3.5 bg-white/10 backdrop-blur border border-white/10"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
            <BadgeCheck size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold">Authenticity verified</div>
            <div className="text-[11px] opacity-70">On-chain · 14s ago</div>
          </div>
        </div>
        <div className="cc-mono text-[10px] opacity-70 bg-black/30 p-1.5 rounded-md break-all">
          0x9a3f8b…7f6a
        </div>
      </motion.div>
    </div>

    {/* Testimonial */}
    {testimonial && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.3 }}
        className="relative z-10 max-w-md"
      >
        <div className="flex gap-0.5 mb-3 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} fill="currentColor" stroke="currentColor" />
          ))}
        </div>
        <p className="text-sm leading-relaxed text-white/85 mb-4">"{testimonial.quote}"</p>
        <div className="flex items-center gap-2.5">
          <Avatar name={testimonial.name} size={32} />
          <div>
            <div className="text-xs font-semibold">{testimonial.name}</div>
            <div className="text-[11px] opacity-70">{testimonial.role}</div>
          </div>
        </div>
      </motion.div>
    )}
  </div>
);
