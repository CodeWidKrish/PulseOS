import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rounded" | "circle" | "pill";
}

export function Skeleton({
  variant = "rounded",
  className = "",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    rounded: "rounded-xl",
    circle: "rounded-full aspect-square",
    pill: "rounded-full",
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`bg-white/[0.07] animate-pulse ${variantStyles} ${className}`}
      {...props}
    />
  );
}
