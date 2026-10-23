import React from "react";
import Link from "next/link";
import { MARKETING_CONTENT } from "@/lib/content";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-16"
      aria-label="PulseOS Introduction"
    >
      {/* Cinematic Headline with overflow-masked CSS compositor word reveal */}
      <h1 className="font-semibold tracking-[-0.04em] leading-[1.03] text-4xl sm:text-6xl md:text-7xl lg:text-8xl max-w-[13ch] mx-auto text-[#F2F4F7]">
        {MARKETING_CONTENT.hero.headlineWords.map((word, index) => (
          <span
            key={index}
            className="inline-block overflow-hidden align-top pb-[0.08em] mr-[0.25em] last:mr-0"
          >
            <span
              className="word-reveal-anim inline-block"
              style={{ animationDelay: `${100 + index * 60}ms` }}
            >
              {word}
            </span>
          </span>
        ))}
      </h1>

      {/* Subcopy */}
      <p className="mt-6 text-[#8B93A1] font-light text-base sm:text-lg md:text-xl leading-[1.55] max-w-[46ch] mx-auto">
        {MARKETING_CONTENT.hero.subcopy}
      </p>

      {/* Action Row */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
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

      {/* Cursor interaction hint */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <span className="text-xs text-[#8B93A1]/70 tracking-wide font-light">
          {MARKETING_CONTENT.hero.cursorHint}
        </span>
      </div>
    </section>
  );
}
