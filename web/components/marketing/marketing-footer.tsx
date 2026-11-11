"use client";

import React from "react";
import Link from "next/link";
import { MARKETING_CONTENT } from "@/lib/content";

export function MarketingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="relative z-20 pt-16 pb-12 px-4 sm:px-8 lg:px-12 bg-[#07090D] border-t border-white/8 text-xs text-[#8B93A1]"
      aria-label="Site Footer"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid: Brand + 4 Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-14 border-b border-white/8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-base font-semibold text-[#F2F4F7]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D5E] shadow-[0_0_10px_#FF4D5E]" />
              Pulse<span className="text-[#8B93A1]">OS</span>
            </Link>
            <p className="text-xs text-[#8B93A1] max-w-sm leading-relaxed text-pretty-body">
              Turning medical lab reports and vital trends into calm, plain-language explanations with actionable next steps.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://github.com/CodeWidKrish/PulseOS"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#F2F4F7] border border-white/10 transition-colors"
                aria-label="View PulseOS on GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>

              <span className="text-[11px] font-mono text-[#5EE1D2] bg-[#5EE1D2]/10 border border-[#5EE1D2]/25 px-2.5 py-1 rounded-full">
                Open Source Demo
              </span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <p className="font-semibold text-[#F2F4F7] uppercase tracking-wider text-[11px]">
              Platform
            </p>
            <ul className="space-y-2 list-none p-0">
              <li>
                <Link href="#demo" className="hover:text-[#F2F4F7] transition-colors">
                  Report Explainer
                </Link>
              </li>
              <li>
                <Link href="/vitals" className="hover:text-[#F2F4F7] transition-colors">
                  Vitals Tracker
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="hover:text-[#F2F4F7] transition-colors">
                  Doctor Appointments
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#F2F4F7] transition-colors">
                  Patient Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Clinical Safety */}
          <div className="space-y-3">
            <p className="font-semibold text-[#F2F4F7] uppercase tracking-wider text-[11px]">
              Safety & Ethics
            </p>
            <ul className="space-y-2 list-none p-0">
              <li>
                <Link href="#security" className="hover:text-[#F2F4F7] transition-colors">
                  Non-Diagnostic Policy
                </Link>
              </li>
              <li>
                <Link href="#security" className="hover:text-[#F2F4F7] transition-colors">
                  Synthetic Test Data
                </Link>
              </li>
              <li>
                <Link href="#security" className="hover:text-[#F2F4F7] transition-colors">
                  Data Privacy Standard
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-[#F2F4F7] transition-colors">
                  Clinical FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <p className="font-semibold text-[#F2F4F7] uppercase tracking-wider text-[11px]">
              Resources
            </p>
            <ul className="space-y-2 list-none p-0">
              <li>
                <Link href="/design" className="hover:text-[#F2F4F7] transition-colors">
                  Design System
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#F2F4F7] transition-colors">
                  Patient Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#F2F4F7] transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/6 text-center">
          <p className="max-w-4xl mx-auto leading-relaxed text-[#8B93A1] text-xs">
            <strong className="text-[#FF4D5E] font-medium">Medical Notice:</strong>{" "}
            {MARKETING_CONTENT.footer.disclaimer}
          </p>
        </div>

        {/* Bottom Bar: Copyright + Back to Top */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B93A1]">
          <p>{MARKETING_CONTENT.footer.copyright} · Sample data only.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#F2F4F7] border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
            aria-label="Back to top of page"
          >
            <span>Back to top</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
