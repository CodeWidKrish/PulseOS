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

// Lazy-load Background Heart (ElectricLogo) that persists across hero & story
const DynamicScrollHeart = dynamic(
  () => import("./scroll-heart").then((mod) => mod.ScrollHeart),
  { ssr: false }
);

export function MarketingClientShell() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Initialize Lenis smooth scroll for precision mouse wheel on desktop
  useLenis();

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
      {/* Background ElectricLogo Heart (replaces particle heart) */}
      <DynamicScrollHeart />

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
