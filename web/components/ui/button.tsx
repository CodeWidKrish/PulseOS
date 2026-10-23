import React, { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "dark-primary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      className = "",
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    // Size classes (Min height 44px on md/lg for strict WCAG touch target)
    const sizeClasses = {
      sm: "h-9 px-4 text-xs tracking-tight",
      md: "h-11 px-5 text-sm tracking-tight",
      lg: "h-13 px-7 text-base tracking-tight font-medium",
    }[size];

    // Variant classes according to DESIGN.md
    const variantClasses = {
      primary:
        "bg-[#FF4D5E] text-white hover:bg-[#ff3b4e] hover:shadow-[0_0_30px_-5px_rgba(255,77,94,0.35)] active:scale-[0.98] transition-all duration-200 border border-transparent shadow-[0_0_20px_-8px_rgba(255,77,94,0.3)]",
      outline:
        "bg-transparent text-[#F2F4F7] border border-white/15 hover:border-white/30 hover:bg-white/5 active:scale-[0.98] transition-all duration-200",
      ghost:
        "bg-transparent text-[#8B93A1] hover:text-[#F2F4F7] hover:bg-white/5 active:scale-[0.98] transition-all duration-200 border border-transparent",
      "dark-primary":
        "bg-[#0B0F15] text-[#F4F5F7] hover:bg-[#1a212b] active:scale-[0.98] transition-all duration-200 border border-black/10 shadow-sm",
    }[variant];

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-medium select-none cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090D]
          ${isDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "hover:scale-[1.015] active:scale-[0.98]"}
          ${sizeClasses}
          ${variantClasses}
          ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-1 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
