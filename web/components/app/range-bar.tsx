"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RangeBarProps {
  value: number | null;
  low: number | null;
  high: number | null;
  status: "normal" | "low" | "high";
}

/**
 * Shows where a result sits relative to its reference range: the teal band is the
 * normal range and the marker slides to the value. Answers "how far off?" at a glance.
 */
export function RangeBar({ value, low, high, status }: RangeBarProps) {
  const reduce = useReducedMotion();
  if (value === null || low === null || high === null || high <= low) {
    return <div className="h-1.5 w-full rounded-full bg-hover" aria-hidden="true" />;
  }

  const span = high - low;
  const min = Math.min(low - span * 0.6, value - span * 0.1);
  const max = Math.max(high + span * 0.6, value + span * 0.1);
  const pos = (x: number) => ((x - min) / (max - min)) * 100;
  const bandLeft = pos(low);
  const bandWidth = pos(high) - bandLeft;
  const marker = Math.max(1.5, Math.min(98.5, pos(value)));
  const markerTone = status === "normal" ? "bg-teal" : status === "high" ? "bg-pulse" : "bg-amber";

  return (
    <div
      className="relative h-5 w-full"
      role="img"
      aria-label={`${value} against a reference range of ${low} to ${high}: ${status}`}
    >
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-hover" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-teal/35"
        style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
      />
      <motion.div
        className={`absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${markerTone} shadow-[0_0_10px_currentColor]`}
        initial={{ left: reduce ? `${marker}%` : `${bandLeft + bandWidth / 2}%`, opacity: reduce ? 1 : 0 }}
        whileInView={{ left: `${marker}%`, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: reduce ? 0 : 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
