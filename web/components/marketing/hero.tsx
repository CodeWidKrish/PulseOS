"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MARKETING_CONTENT } from "@/lib/content";
import { LiveEcgStrip } from "./live-ecg-strip";
import { AmbientBloodCells } from "./ambient-blood-cells";

// Dynamically load MaskedHeading with ssr: false so it doesn't block first paint
const DynamicMaskedHeading = dynamic(
  () => import("@/components/ui/MaskedHeading"),
  {
    ssr: false,
    loading: () => (
      <h1 className="font-bold tracking-[-0.045em] leading-[1.02] text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-center text-[#F2F4F7]">
        Your health, in plain language.
      </h1>
    ),
  }
);

export function Hero() {
  return (
    <section
      id="hero"
      className="relative z-10 min-h-[100svh] flex flex-col items-center justify-between text-center px-4 sm:px-6 pt-24 sm:pt-28 pb-4 overflow-hidden"
      aria-label="PulseOS Introduction"
    >
      {/* Ambient drifting blood cells behind the heart */}
      <AmbientBloodCells />

      {/* Upper Hero Content: Headline, Subcopy, and CTAs (max-w 1100px) */}
      <div className="relative z-10 w-full max-w-[1100px] mx-auto flex flex-col items-center pointer-events-auto">
        <DynamicMaskedHeading
          text="Your health, in plain language."
          tag="h1"
          mediaType="video"
          src="/media/blood-flow.mp4"
          poster="/media/blood-flow-poster.jpg"
          reveal="rise"
          trigger="mount"
          duration={1.2}
          stagger={0.08}
          fillScale={1.3}
          parallax={30}
          drift={16}
          hoverZoom={0.06}
          brightness={1.15}
          saturation={1.2}
          spotlight
          spotlightRadius={200}
          outline
          outlineColor="rgba(255,255,255,0.35)"
          outlineWidth={1}
          weight={700}
          tracking={-0.045}
          lineHeight={1.02}
          textScale={0.1}
          align="center"
        />

        {/* Soft radial dark scrim (ink #07090D at ~72% opacity, feathered) for 4.5:1 text contrast */}
        <div className="mt-6 px-6 sm:px-8 py-5 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(7,9,13,0.76)_0%,rgba(7,9,13,0.52)_65%,transparent_100%)] backdrop-blur-[2px] max-w-[580px] mx-auto pointer-events-auto">
          {/* Subcopy */}
          <p className="text-[#8B93A1] font-light text-base sm:text-lg md:text-xl leading-[1.55] max-w-[46ch] mx-auto">
            {MARKETING_CONTENT.hero.subcopy}
          </p>

          {/* Action Row */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href={MARKETING_CONTENT.hero.ctaPrimary.href}
              className="inline-flex items-center justify-center px-6 py-3 text-sm sm:text-base font-medium rounded-full bg-[#F2F4F7] text-[#07090D] hover:scale-[1.04] transition-transform duration-200 shadow-lg shadow-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
            >
              {MARKETING_CONTENT.hero.ctaPrimary.label}
            </Link>
            <Link
              href={MARKETING_CONTENT.hero.ctaSecondary.href}
              className="inline-flex items-center justify-center px-6 py-3 text-sm sm:text-base font-medium rounded-full border border-white/20 text-[#F2F4F7] hover:bg-white/[0.08] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
            >
              {MARKETING_CONTENT.hero.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Area: Cursor interaction hint and Live ECG Strip */}
      <div className="w-full flex flex-col items-center gap-2 mt-auto pt-6 z-10 pointer-events-none">
        <span className="text-xs text-[#8B93A1]/70 tracking-wide font-light">
          {MARKETING_CONTENT.hero.cursorHint} · Press & hold to charge
        </span>
        <LiveEcgStrip />
      </div>
    </section>
  );
}
