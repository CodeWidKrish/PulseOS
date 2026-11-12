"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
}

/** Segmented control with a sliding selection pill (layout animation, transform-only). */
export function Segmented<T extends string>({ value, options, onChange, label, size = "md" }: SegmentedProps<T>) {
  const layoutId = useId();
  const pad = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-[13px]";
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line bg-hover p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-full font-medium transition-colors duration-200 ${pad} ${
              active ? "text-ink" : "text-fg-muted hover:text-fg"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-teal"
                transition={{ type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden="true"
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
