import React from "react";
import Link from "next/link";
import { MARKETING_CONTENT } from "@/lib/content";

export function ClosingCTA() {

  return (
    <section
      id="cta"
      className="relative z-10 min-h-[85svh] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-24"
      aria-label="Get Started"
    >
      <h2 className="font-semibold tracking-[-0.04em] leading-[1.05] text-4xl sm:text-6xl md:text-7xl lg:text-8xl max-w-[13ch] mx-auto text-[#F2F4F7]">
        {MARKETING_CONTENT.closingCta.heading}
      </h2>

      <p className="mt-5 text-[#8B93A1] font-light text-base sm:text-lg md:text-xl leading-[1.55] max-w-[42ch] mx-auto">
        {MARKETING_CONTENT.closingCta.subcopy}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
        <Link
          href={MARKETING_CONTENT.closingCta.ctaPrimary.href}
          className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-medium rounded-full bg-[#F2F4F7] text-[#07090D] hover:scale-[1.04] transition-transform duration-200 shadow-lg shadow-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
        >
          {MARKETING_CONTENT.closingCta.ctaPrimary.label}
        </Link>
        <a
          href={MARKETING_CONTENT.closingCta.ctaSecondary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-medium rounded-full border border-white/20 text-[#F2F4F7] hover:bg-white/[0.08] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
        >
          {MARKETING_CONTENT.closingCta.ctaSecondary.label}
        </a>
      </div>
    </section>
  );
}
