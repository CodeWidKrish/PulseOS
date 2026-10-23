"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MARKETING_CONTENT } from "@/lib/content";
import { LiveEcgStrip } from "./live-ecg-strip";
import { AmbientBloodCells } from "./ambient-blood-cells";

import { useHeart } from "@/lib/heart-context";

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
  const { bpm } = useHeart();
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

        {/* Subcopy and CTA Block with Feathered Radial Scrim (no visible card/borders) */}
        <div className="relative mt-8 max-w-[620px] mx-auto pointer-events-auto">
          {/* Feathered radial dark scrim: behind subcopy & CTAs (140% w/h) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(7,9,13,0.75) 0%, rgba(7,9,13,0.55) 45%, rgba(7,9,13,0) 75%)",
            }}
            aria-hidden="true"
          />

          {/* Subcopy */}
          <p className="text-[#A4ACB9] font-light text-base sm:text-lg md:text-xl leading-[1.55] max-w-[46ch] mx-auto px-4">
            {MARKETING_CONTENT.hero.subcopy}
          </p>

          {/* Action Row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href={MARKETING_CONTENT.hero.ctaPrimary.href}
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-medium rounded-full bg-[#F2F4F7] text-[#07090D] hover:scale-[1.04] transition-transform duration-200 shadow-lg shadow-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
            >
              {MARKETING_CONTENT.hero.ctaPrimary.label}
            </Link>
            <Link
              href={MARKETING_CONTENT.hero.ctaSecondary.href}
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-medium rounded-full border border-white/20 text-[#F2F4F7] hover:bg-white/[0.08] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
            >
              {MARKETING_CONTENT.hero.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Area: Cursor interaction hint and Live ECG Strip */}
      <div className="w-full flex flex-col items-center gap-2 mt-auto pt-6 z-10 pointer-events-none">
        <span className="text-xs text-[#8B93A1]/80 tracking-wide font-light flex items-center gap-2">
          <span className="font-mono text-[#FF4D5E] font-medium bg-[#FF4D5E]/10 px-2 py-0.5 rounded-full border border-[#FF4D5E]/25">
            {bpm} BPM
          </span>
          <span>·</span>
          <span>{MARKETING_CONTENT.hero.cursorHint} · Press & hold to charge</span>
        </span>
        <LiveEcgStrip />
      </div>
    </section>
  );
}
