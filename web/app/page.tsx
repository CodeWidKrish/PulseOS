"use client";

import React from "react";
import dynamic from "next/dynamic";
import { HeartProvider } from "@/lib/heart-context";
import { MarketingClientShell } from "@/components/marketing/client-shell";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { NumbersBand } from "@/components/marketing/numbers-band";
import { WhoItIsFor } from "@/components/marketing/who-it-is-for";
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
    <HeartProvider startOnFirstInteraction>
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

        {/* Layer 2: Main Marketing Sections */}
        <main className="relative z-[2]">
          {/* 1. Hero with MaskedHeading, Heart, CTAs, Trust Row, and Live ECG Strip */}
          <Hero />

          {/* 2. How It Works 3-Step Strip */}
          <HowItWorks />

          {/* 3. Pinned Scroll Story */}
          <PinnedStory />

          {/* 4. Interactive Report Explainer Demo */}
          <InteractiveDemo />

          {/* 5. Dashboard Preview (Bento Grid) with live BPM readout and Before/After */}
          <BentoDashboard />

          {/* 6. Numbers Band (Count-up Sample Stats) */}
          <NumbersBand />

          {/* 7. Who It Is For (Patients and Doctors) */}
          <WhoItIsFor />

          {/* 8. Security & Trust Architecture */}
          <SecuritySection />

          {/* 9. Accessible Clinical FAQ Accordion */}
          <FAQSection />

          {/* 10. Closing Call to Action */}
          <ClosingCTA />

          {/* 11. Multi-Column Footer with Medical Disclaimer & Back to Top */}
          <MarketingFooter />
        </main>
      </div>
    </HeartProvider>
  );
}
