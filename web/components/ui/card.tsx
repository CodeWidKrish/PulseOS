import React, { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, interactive = false, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-[28px] bg-[#12161D]/90 backdrop-blur-md border-t border-white/10 border-x border-b border-white/5 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)] transition-all duration-300 ${
          interactive
            ? "hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.6)] cursor-pointer"
            : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`p-6 sm:p-7 pb-3 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg sm:text-xl font-semibold text-[#F2F4F7] tracking-tight leading-snug ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", children, ...props }, ref) => (
    <p ref={ref} className={`text-sm text-[#8B93A1] leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`p-6 sm:p-7 pt-2 ${className}`} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 sm:p-7 pt-0 flex items-center justify-between border-t border-white/5 mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";
