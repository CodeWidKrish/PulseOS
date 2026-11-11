"use client";

import React from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const STEPS = [
  {
    step: "01",
    title: "Upload lab report",
    description:
      "Drop in any bloodwork or metabolic panel in PDF or image format. PulseOS extracts every biomarker and reference interval locally.",
    tag: "Instant parsing",
  },
  {
    step: "02",
    title: "Plain-language explainer",
    description:
      "Streaming explanations break down out-of-range figures without panic or medical jargon, translating raw numbers into everyday context.",
    tag: "8th-grade reading level",
  },
  {
    step: "03",
    title: "Physician-ready next steps",
    description:
      "Get 3 to 5 targeted, sensible questions prepared for your doctor so your next consultation is focused, productive, and reassuring.",
    tag: "Actionable prep",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto"
      aria-label="How PulseOS Works"
    >
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-widest text-[#5EE1D2] uppercase mb-3 block">
          Process
        </span>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#F2F4F7] text-balance-heading">
          From complex lab slip to calm clarity in three steps
        </h2>
        <p className="mt-4 text-[#8B93A1] text-base sm:text-lg leading-relaxed text-pretty-body mx-auto">
          No medical degrees required. PulseOS does the heavy translation so you can understand your body.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {STEPS.map((item) => (
          <SpotlightCard
            key={item.step}
            className="p-8 sm:p-10 bg-[#12161D]/80 backdrop-blur-md flex flex-col justify-between"
            spotlightColor="rgba(94, 225, 210, 0.15)"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-3xl sm:text-4xl font-bold text-[#5EE1D2]/80 tabular-nums">
                  {item.step}
                </span>
                <span className="text-xs font-mono font-medium text-[#8B93A1] bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#F2F4F7] mb-3">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-[#8B93A1] leading-relaxed text-pretty-body">
                {item.description}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-[#5EE1D2]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5EE1D2]" aria-hidden="true" />
              <span>Step complete in seconds</span>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
