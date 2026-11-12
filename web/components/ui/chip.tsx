import React, { forwardRef } from "react";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "normal" | "alert" | "caution" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ children, variant = "normal", size = "md", dot = true, className = "", ...props }, ref) => {
    const variantStyles = {
      normal: { container: "bg-teal-muted text-teal border-teal/25", dot: "bg-teal" },
      alert: { container: "bg-pulse-muted text-pulse border-pulse/25", dot: "bg-pulse" },
      caution: { container: "bg-amber-muted text-amber border-amber/25", dot: "bg-amber" },
      neutral: { container: "bg-hover text-fg-muted border-line", dot: "bg-fg-muted" },
    }[variant];

    // DESIGN.md §5.6: 12px semibold label; never smaller than 11px (anti-pattern 8)
    const sizeStyles = {
      sm: "text-[11px] py-0.5 px-2.5 tracking-wide gap-1.5",
      md: "text-xs py-1 px-3 tracking-wide gap-2",
    }[size];

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full border font-semibold uppercase select-none transition-colors duration-150 ${variantStyles.container} ${sizeStyles} ${className}`}
        {...props}
      >
        {dot && (
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${variantStyles.dot}`}
            aria-hidden="true"
          />
        )}
        <span>{children}</span>
      </span>
    );
  }
);

Chip.displayName = "Chip";
