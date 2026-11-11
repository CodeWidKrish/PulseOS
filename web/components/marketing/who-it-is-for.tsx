"use client";

import React from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export function WhoItIsFor() {
  return (
    <section
      id="who-it-is-for"
      className="py-24 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto"
      aria-label="Who PulseOS is built for"
    >
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-widest text-[#FF4D5E] uppercase mb-3 block">
          Audience
        </span>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#F2F4F7] text-balance-heading">
          Built for patients. Respected by clinicians.
        </h2>
        <p className="mt-4 text-[#8B93A1] text-base sm:text-lg leading-relaxed text-pretty-body mx-auto">
          Health care works best when patients are informed and doctors can focus on care rather than defining acronyms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: For Patients */}
        <SpotlightCard
          className="p-8 sm:p-12 bg-[#12161D]/85 backdrop-blur-md flex flex-col justify-between"
          spotlightColor="rgba(94, 225, 210, 0.12)"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#5EE1D2]/10 text-[#5EE1D2] border border-[#5EE1D2]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5EE1D2]" />
                Primary Companion
              </span>
              <span className="text-xs text-[#8B93A1]">Zero medical jargon</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-semibold text-[#F2F4F7] mb-4">
              For individuals & families
            </h3>
            <p className="text-[#8B93A1] text-base leading-relaxed mb-6 text-pretty-body">
              Never spend sleepless nights googling alarming diagnostic abbreviations again. PulseOS translates your routine checkups, lipid panels, and metabolic screens into calm, clear sentences you can immediately act upon.
            </p>

            <ul className="space-y-3 mb-8 text-sm text-[#C9CFD9]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#5EE1D2] font-bold mt-0.5">✓</span>
                <span>Plain-language biomarker breakdown with reference intervals</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#5EE1D2] font-bold mt-0.5">✓</span>
                <span>Longitudinal vitals tracking across heart rate, BP, glucose, and weight</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#5EE1D2] font-bold mt-0.5">✓</span>
                <span>Curated list of questions to discuss at your upcoming clinic appointment</span>
              </li>
            </ul>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-full text-sm font-semibold text-[#07090D] bg-[#F2F4F7] hover:bg-white transition-all shadow-md hover:scale-[1.01] active:scale-[0.98]"
          >
            Start understanding your health free
          </Link>
        </SpotlightCard>

        {/* Card 2: For Physicians */}
        <SpotlightCard
          className="p-8 sm:p-12 bg-[#12161D]/85 backdrop-blur-md flex flex-col justify-between"
          spotlightColor="rgba(255, 77, 94, 0.12)"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF4D5E]/10 text-[#FF4D5E] border border-[#FF4D5E]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D5E]" />
                Physician Portal
              </span>
              <span className="text-xs text-[#8B93A1]">Conflict-safe booking</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-semibold text-[#F2F4F7] mb-4">
              For doctors & healthcare providers
            </h3>
            <p className="text-[#8B93A1] text-base leading-relaxed mb-6 text-pretty-body">
              When patients walk in knowing their questions beforehand, consultations are drastically more efficient. PulseOS organizes records, manages availability slots, and prevents scheduling conflicts through atomic database constraints.
            </p>

            <ul className="space-y-3 mb-8 text-sm text-[#C9CFD9]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#FF4D5E] font-bold mt-0.5">✓</span>
                <span>Informed patients who arrive with structured questions</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#FF4D5E] font-bold mt-0.5">✓</span>
                <span>Real-time availability slot management with zero double-booking</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#FF4D5E] font-bold mt-0.5">✓</span>
                <span>Strict non-diagnostic boundaries keeping full clinical authority with you</span>
              </li>
            </ul>
          </div>

          <Link
            href="/appointments"
            className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-full text-sm font-semibold text-[#F2F4F7] bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            Explore physician availability & booking
          </Link>
        </SpotlightCard>
      </div>
    </section>
  );
}
