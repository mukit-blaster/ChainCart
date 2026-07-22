"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, leftIcon, rightSlot, className, type = "text", id, ...rest }, ref) => {
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === "password";
    const effectiveType = isPassword && revealed ? "text" : type;
    const fieldId = id ?? rest.name;

    return (
      <label htmlFor={fieldId} className="block">
        <span className="text-xs font-medium mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {hint && <span className="text-muted font-normal">{hint}</span>}
        </span>
        <span
          className={cn(
            "relative flex items-center rounded-[12px] border bg-surface transition-shadow",
            error
              ? "border-danger/60 focus-within:shadow-[0_0_0_4px_rgba(239,68,68,.12)]"
              : "border-border focus-within:border-brand focus-within:shadow-[0_0_0_4px_rgba(37,99,235,.12)]",
          )}
        >
          {leftIcon && (
            <span className="pl-3.5 text-muted flex-shrink-0">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={fieldId}
            type={effectiveType}
            className={cn(
              "flex-1 bg-transparent outline-none px-3.5 py-3 text-sm placeholder:text-muted",
              leftIcon && "pl-2",
              (isPassword || rightSlot) && "pr-2",
              className,
            )}
            {...rest}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="pr-3 text-muted hover:text-fg2"
              aria-label={revealed ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : rightSlot ? (
            <span className="pr-3">{rightSlot}</span>
          ) : null}
        </span>
        {error && <span className="text-[11px] text-danger mt-1.5 block">{error}</span>}
      </label>
    );
  },
);
Field.displayName = "Field";
