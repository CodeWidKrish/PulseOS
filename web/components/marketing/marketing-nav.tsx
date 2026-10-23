"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { MARKETING_CONTENT } from "@/lib/content";
import { useLenis } from "@/lib/use-lenis";

interface MarketingNavProps {
  onOpenCommandPalette: () => void;
}

function subscribeNoop() {
  return () => {};
}

function getIsMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

export function MarketingNav({ onOpenCommandPalette }: MarketingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMac = useSyncExternalStore(subscribeNoop, getIsMac, () => false);
  const { scrollTo } = useLenis();

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollTo(href, -70);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3 bg-[#07090D]/60 backdrop-blur-xl border-b border-white/6 transition-all duration-200"
      aria-label="Main Navigation"
    >


      {/* Desktop Anchor Links */}
      <ul className="hidden md:flex items-center gap-7 list-none p-0 text-sm text-[#8B93A1]">
        {MARKETING_CONTENT.nav.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="hover:text-[#F2F4F7] transition-colors focus-visible:outline-none focus-visible:text-[#F2F4F7] focus-visible:ring-2 focus-visible:ring-[#5EE1D2] rounded-md px-1 py-0.5"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right Action Cluster: Command Palette + CTA */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#8B93A1] hover:text-[#F2F4F7] bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
          aria-label="Open command palette"
        >
          <span>
            {isMac
              ? MARKETING_CONTENT.nav.commandKeyMac
              : MARKETING_CONTENT.nav.commandKeyLabel}
          </span>
        </button>

        {/* Primary CTA */}
        <Link
          href={MARKETING_CONTENT.nav.cta.href}
          onClick={(e) => handleLinkClick(e, MARKETING_CONTENT.nav.cta.href)}
          className="inline-flex items-center justify-center px-4 py-1.5 text-xs sm:text-sm font-medium text-[#07090D] bg-[#F2F4F7] hover:bg-white rounded-full transition-transform hover:scale-[1.03] active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
        >
          {MARKETING_CONTENT.nav.cta.label}
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-[#8B93A1] hover:text-[#F2F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] rounded-lg"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#07090D]/95 backdrop-blur-2xl border-b border-white/10 p-5 space-y-3 md:hidden shadow-2xl">
          <ul className="space-y-2 list-none p-0">
            {MARKETING_CONTENT.nav.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="block text-sm font-medium text-[#C9CFD9] hover:text-white py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCommandPalette();
              }}
              className="w-full text-center py-2 px-4 text-xs text-[#8B93A1] bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
            >
              Open Command Menu ({isMac ? "⌘K" : "Ctrl+K"})
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
