"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MarketingNav } from "./marketing-nav";
import { useLenis } from "@/lib/use-lenis";

// Lazy-load Command Palette on demand
const DynamicCommandPalette = dynamic(
  () =>
    import("./command-palette").then(
      (mod) => mod.CommandPalette
    ),
  { ssr: false }
);

// Lazy-load ToastContainer on demand
const DynamicToastContainer = dynamic(
  () => import("@/components/ui/toast").then((m) => m.ToastContainer),
  { ssr: false }
);

// Lazy-load WebGL particle canvas on desktop idle
const DynamicParticleCanvas = dynamic(
  () =>
    import("./particle-canvas").then(
      (mod) => mod.ParticleCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(255,77,94,0.14),transparent_65%)]"
        aria-hidden="true"
      />
    ),
  }
);

export function MarketingClientShell() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [canRenderCanvas, setCanRenderCanvas] = useState(false);

  // Initialize Lenis smooth scroll for precision mouse wheel on desktop
  useLenis();

  // Desktop idle deferral for heavy 3D WebGL; mobile uses ambient CSS glow
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || isReduced) return;

    if ("requestIdleCallback" in window) {
      const handle = (
        window as unknown as {
          requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number;
        }
      ).requestIdleCallback(() => setCanRenderCanvas(true), { timeout: 2500 });

      return () => {
        if ("cancelIdleCallback" in window) {
          (
            window as unknown as {
              cancelIdleCallback: (id: number) => void;
            }
          ).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(() => setCanRenderCanvas(true), 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* 3D WebGL Particle Heart Canvas on Desktop / Static Gradient Fallback on Mobile & Low-Power */}
      {canRenderCanvas ? (
        <DynamicParticleCanvas />
      ) : (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(255,77,94,0.14),transparent_65%)]"
          aria-hidden="true"
        />
      )}

      {/* Floating Translucent Navigation */}
      <MarketingNav onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      {/* Accessible Command Palette Dialog */}
      <DynamicCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Lazy Toast Notifications */}
      <DynamicToastContainer />
    </>
  );
}
