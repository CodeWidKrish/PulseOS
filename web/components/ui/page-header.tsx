"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/components/ui/motion";

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The page's single primary action (DESIGN §8: one CTA per screen). */
  action?: React.ReactNode;
  /** Optional secondary controls shown before the action (e.g. a range toggle). */
  controls?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action, controls }: PageHeaderProps) {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: EASE_OUT_EXPO, delay },
        };

  return (
    <header className="relative flex flex-col gap-6 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <motion.p {...rise(0)} className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-teal">
            {eyebrow}
          </motion.p>
        )}
        <motion.h1 {...rise(0.05)} className="text-h1 text-balance-heading text-fg">
          {title}
        </motion.h1>
        {description && (
          <motion.p {...rise(0.12)} className="mt-3 text-[15px] leading-relaxed text-fg-muted text-pretty-body">
            {description}
          </motion.p>
        )}
      </div>
      {(action || controls) && (
        <motion.div {...rise(0.18)} className="flex shrink-0 flex-wrap items-center gap-3">
          {controls}
          {action}
        </motion.div>
      )}
    </header>
  );
}
