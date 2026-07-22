import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("cc-card", className)} {...props} />
);

export const CardLg = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("cc-card-lg", className)} {...props} />
);
