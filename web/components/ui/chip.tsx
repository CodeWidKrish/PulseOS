import React, { forwardRef } from "react";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "normal" | "alert" | "caution" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ children, variant = "normal", size = "md", dot = true, className = "", ...props }, ref) => {
    const variantStyles = {
      normal: {
        container: "bg-[rgba(94,225,210,0.10)] text-[#5EE1D2] border-[#5EE1D2]/25",
        dot: "bg-[#5EE1D2]",
      },
      alert: {
        container: "bg-[rgba(255,77,94,0.10)] text-[#FF4D5E] border-[#FF4D5E]/25",
        dot: "bg-[#FF4D5E] shadow-[0_0_8px_rgba(255,77,94,0.5)]",
      },
      caution: {
        container: "bg-[rgba(255,184,107,0.10)] text-[#FFB86B] border-[#FFB86B]/25",
        dot: "bg-[#FFB86B]",
      },
      neutral: {
        container: "bg-white/5 text-[#8B93A1] border-white/10",
        dot: "bg-[#8B93A1]",
      },
    }[variant];

    const sizeStyles = {
      sm: "text-[10px] py-0.5 px-2.5 tracking-wider gap-1.5",
      md: "text-xs py-1 px-3 tracking-wider gap-2",
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
