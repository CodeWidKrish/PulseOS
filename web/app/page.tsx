"use client";

import React from "react";
import dynamic from "next/dynamic";
import { HeartProvider } from "@/lib/heart-context";
import { MarketingClientShell } from "@/components/marketing/client-shell";
import { Hero } from "@/components/marketing/hero";
import { SecuritySection } from "@/components/marketing/security-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { ClosingCTA } from "@/components/marketing/closing-cta";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

const PinnedStory = dynamic(
  () => import("@/components/marketing/story").then((m) => m.PinnedStory)
);

const InteractiveDemo = dynamic(
  () =>
    import("@/components/marketing/interactive-demo").then(
      (m) => m.InteractiveDemo
    )
);

const BentoDashboard = dynamic(
  () =>
    import("@/components/marketing/bento-dashboard").then(
      (m) => m.BentoDashboard
    )
);

export default function MarketingPage() {
  return (
    <HeartProvider>
      <div className="relative min-h-screen text-[#F2F4F7] overflow-x-hidden selection:bg-[#FF4D5E]/30 selection:text-white">
        {/* Layer 0: Fixed cross-fading background layer between #07090D and #F4F5F7 */}
        <div
          id="fixed-page-bg"
          className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500 will-change-[background-color]"
          style={{ backgroundColor: "#07090D" }}
          aria-hidden="true"
        />

        {/* Layer 1: Client Shell with Persistent Background Heart (z-1) & Nav/Palette */}
        <MarketingClientShell />

        {/* Layer 2: Main Marketing Sections (Transparent backgrounds) */}
        <main className="relative z-[2]">
          {/* 1. Hero with MaskedHeading, Dual-Layer Heart, Ambient Cells & Live ECG Strip */}
          <Hero />

          {/* 2. Pinned Scroll Story */}
          <PinnedStory />

          {/* 3. Interactive Report Explainer Demo */}
          <InteractiveDemo />

          {/* 4. Dashboard Preview (Bento Grid) with live BPM readout */}
          <BentoDashboard />

          {/* 5. Security & Trust Section (Server Component) */}
          <SecuritySection />

          {/* 6. Accessible FAQ Accordion (Server Component) */}
          <FAQSection />

          {/* 7. Closing CTA (Server Component) */}
          <ClosingCTA />

          {/* Footer with Medical Disclaimer (Server Component) */}
          <MarketingFooter />
        </main>
      </div>
    </HeartProvider>
  );
}
