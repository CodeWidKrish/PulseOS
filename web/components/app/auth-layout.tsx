"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/** Centered 420px auth card over the obsidian canvas with a slow pulse glow (DESIGN §8.6). */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas px-4 py-12 text-fg">
      <div className="app-aurora" aria-hidden="true" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,77,94,0.16) 0%, rgba(255,77,94,0.04) 45%, transparent 70%)" }}
        animate={reduce ? undefined : { scale: [1, 1.06, 1, 1.03, 1], opacity: [0.8, 1, 0.8, 0.9, 0.8] }}
        transition={{ duration: 60 / 60, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
      />

      <Link href="/" className="relative mb-10 flex items-center gap-2.5" aria-label="PulseOS home">
        <span className="beacon relative h-2.5 w-2.5 rounded-full bg-pulse text-pulse" aria-hidden="true" />
        <span className="text-lg font-semibold tracking-tight">
          Pulse<span className="text-fg-muted">OS</span>
        </span>
      </Link>

      <motion.main
        initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="tile relative w-full max-w-[420px] p-7 shadow-elevation-high sm:p-9"
      >
        <h1 className="text-h3 font-semibold tracking-tight text-fg">{title}</h1>
        <p className="mt-2 text-sm text-fg-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </motion.main>

      <div className="relative mt-8 text-center text-sm text-fg-muted">{footer}</div>
      <p className="relative mt-10 max-w-sm text-center text-xs text-fg-muted">
        Sample data only · PulseOS explains information and does not provide medical advice.
      </p>
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  trailing?: React.ReactNode;
}

/** Labelled input with error text bound via aria-describedby (DESIGN §5.2). */
export function Field({ id, label, error, trailing, className = "", ...rest }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg-muted">
        {label}
      </label>
      <div
        className={`flex h-12 items-center rounded-control border bg-canvas px-4 transition-shadow ${
          error
            ? "border-pulse shadow-[0_0_0_3px_rgba(255,77,94,0.15)]"
            : "border-line focus-within:border-teal focus-within:shadow-[0_0_0_3px_rgba(94,225,210,0.18)]"
        }`}
      >
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-full w-full bg-transparent text-[15px] text-fg outline-none placeholder:text-fg-muted/60 ${className}`}
          {...rest}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-pulse" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
