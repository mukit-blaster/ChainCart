import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-[12px] font-medium whitespace-nowrap select-none transition-[transform,box-shadow,background] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-fg text-bg hover:-translate-y-px hover:shadow-cc dark:bg-white dark:text-[#0F172A]",
        brand:
          "text-white shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_8px_20px_-6px_rgba(37,99,235,.55)] hover:-translate-y-px hover:shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_12px_28px_-6px_rgba(37,99,235,.65)] [background:linear-gradient(180deg,#2f70eb,#1d4ed8)]",
        ghost:
          "bg-transparent text-fg border border-border hover:bg-surface2",
        outline:
          "bg-transparent text-fg border border-border hover:border-fg",
        danger: "bg-danger text-white hover:opacity-90",
        link: "text-brand underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-[18px] text-sm",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-9 w-9 p-0",
        pill: "h-10 px-5 rounded-full text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(button({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
