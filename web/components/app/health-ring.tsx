"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/ui/motion";

/** Animated 0–100 score ring. The arc draws in (stroke length) while the number counts up. */
export function HealthRing({ score, size = 132 }: { score: number | null; size?: number }) {
  const reduce = useReducedMotion();
  const pct = score === null ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const tone = score === null ? "text-fg-muted" : score >= 80 ? "text-teal" : score >= 60 ? "text-amber" : "text-pulse";

  return (
    <div className={`relative ${tone}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-line-strong)" strokeWidth="8" />
        {/* tick marks every 10 points */}
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={i}
            x1="60"
            y1="4"
            x2="60"
            y2={i % 2 === 0 ? 8 : 6}
            stroke="var(--color-line-strong)"
            strokeWidth="1"
            transform={`rotate(${i * 18} 60 60)`}
          />
        ))}
        {score !== null && (
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: reduce ? pct : 0 }}
            animate={{ pathLength: pct }}
            transition={{ duration: reduce ? 0 : 1.4, ease: [0.25, 1, 0.5, 1] }}
            style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score === null ? (
          <span className="text-3xl font-semibold text-fg">—</span>
        ) : (
          <CountUp value={score} className="text-4xl font-semibold tracking-tight text-fg" />
        )}
        <span className="font-mono text-xs text-fg-muted">of 100</span>
      </div>
    </div>
  );
}
