"use client";

import React, { useRef, useState } from "react";
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

function subscribeNoop() {
  return () => {};
}

function getIsDebugLayers(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.search.includes("debug=layers");
}

// Reusable magnetic hover wrapper
function MagneticButton({
  children,
  className = "",
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.2;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <Link
      ref={btnRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: offset.x === 0 ? "transform 0.35s ease-out" : "none",
      }}
      className={className}
    >
      {children}
    </Link>
  );
}

export function Hero() {
  const { bpm, soundEnabled } = useHeart();
  const isDebugLayers = React.useSyncExternalStore(
    subscribeNoop,
    getIsDebugLayers,
    () => false
  );

  return (
    <section
      id="hero"
      className="relative z-10 min-h-[100svh] flex flex-col items-center justify-between text-center px-4 sm:px-6 pt-24 sm:pt-28 pb-4 overflow-hidden"
      style={isDebugLayers ? { outline: "2px dashed #FF00FF" } : undefined}
      aria-label="PulseOS Introduction"
    >
      {/* Ambient drifting blood cells behind the heart */}
      <AmbientBloodCells />

      {/* Upper Hero Content: Headline, Subcopy, CTAs, Trust Row */}
      <div
        className="relative z-10 w-full max-w-[1100px] mx-auto flex flex-col items-center pointer-events-auto"
        style={isDebugLayers ? { outline: "2px dashed #00FFFF" } : undefined}
      >
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

        {/* Subcopy and CTA Block with Feathered Radial Scrim */}
        <div
          className="relative mt-8 max-w-[620px] mx-auto pointer-events-auto"
          style={isDebugLayers ? { outline: "2px dashed #FFFF00" } : undefined}
        >
          {/* Feathered radial dark scrim: behind subcopy & CTAs */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220%] h-[260%] pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(ellipse closest-side at center, rgba(7,9,13,0.70) 0%, rgba(7,9,13,0.40) 50%, rgba(7,9,13,0.10) 80%, rgba(7,9,13,0) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Subcopy with Balanced Wrapping */}
          <p className="text-[#A4ACB9] font-light text-base sm:text-lg md:text-xl leading-[1.55] max-w-[46ch] mx-auto px-4 text-pretty-body">
            {MARKETING_CONTENT.hero.subcopy}
          </p>

          {/* Action Row with Magnetic Hover and Soft Glow */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <MagneticButton
              href={MARKETING_CONTENT.hero.ctaPrimary.href}
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm sm:text-base font-semibold rounded-full bg-[#F2F4F7] text-[#07090D] shadow-[0_0_25px_rgba(255,255,255,0.22)] hover:shadow-[0_0_35px_rgba(94,225,210,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] whitespace-nowrap active:scale-[0.98]"
            >
              {MARKETING_CONTENT.hero.ctaPrimary.label}
            </MagneticButton>

            <MagneticButton
              href={MARKETING_CONTENT.hero.ctaSecondary.href}
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm sm:text-base font-medium rounded-full border border-white/20 text-[#F2F4F7] hover:bg-white/[0.08] hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] whitespace-nowrap active:scale-[0.98]"
            >
              {MARKETING_CONTENT.hero.ctaSecondary.label}
            </MagneticButton>
          </div>

          {/* Trust Row of 3 Honest Facts */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#8B93A1]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5EE1D2]" aria-hidden="true" />
              <span>Sample data only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5EE1D2]" aria-hidden="true" />
              <span>Never diagnoses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5EE1D2]" aria-hidden="true" />
              <span>You control your data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Area: BPM indicator, cursor hint and Live ECG Strip */}
      <div
        className="w-full flex flex-col items-center gap-2 mt-auto pt-6 z-10 pointer-events-none"
        style={isDebugLayers ? { outline: "2px dashed #4488FF" } : undefined}
      >
        <span className="text-xs text-[#8B93A1]/80 tracking-wide font-light flex items-center gap-2">
          <span className="font-mono text-[#FF4D5E] font-medium bg-[#FF4D5E]/10 px-2 py-0.5 rounded-full border border-[#FF4D5E]/25 tabular-nums">
            {bpm} BPM
          </span>
          <span>·</span>
          <span>{MARKETING_CONTENT.hero.cursorHint} · Press & hold to charge</span>
          {!soundEnabled && (
            <>
              <span>·</span>
              <span className="text-[#F2F4F7]/80">Tap anywhere to hear the heartbeat</span>
            </>
          )}
        </span>
        <LiveEcgStrip />
      </div>
    </section>
  );
}
