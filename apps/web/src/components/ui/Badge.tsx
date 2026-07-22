import { ShieldCheck } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Chip = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("cc-chip", className)} {...props} />
);

export const VerifiedBadge = ({ children = "On-chain" }: { children?: React.ReactNode }) => (
  <span className="cc-badge-verified">
    <ShieldCheck size={11} /> {children}
  </span>
);
