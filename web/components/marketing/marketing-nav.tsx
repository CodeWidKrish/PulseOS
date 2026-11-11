"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { MARKETING_CONTENT } from "@/lib/content";
import { useLenis } from "@/lib/use-lenis";
import { useHeart } from "@/lib/heart-context";
import { useTheme } from "@/lib/theme-context";

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("");
  const isMac = useSyncExternalStore(subscribeNoop, getIsMac, () => false);
  const { scrollTo } = useLenis();
  const { soundEnabled, toggleSound, volume, setVolume } = useHeart();
  const { theme, toggleTheme } = useTheme();

  // Scroll Progress Hairline & Active Section Tracking
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Check active sections
      const sections = ["hero", "story", "demo", "bento-dashboard", "before-after", "security", "faq"];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(`#${sectionId}`);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3 glass-nav transition-all duration-200"
        aria-label="Main Navigation"
      >
        {/* Brand Wordmark with Crimson Pulse Dot */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] rounded-lg px-1.5 py-1"
          aria-label="PulseOS Homepage"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D5E] shadow-[0_0_12px_rgba(255,77,94,0.7)] group-hover:scale-110 transition-transform duration-200" />
          <span className="font-semibold text-lg tracking-tight text-white dark:text-[#F2F4F7] light:text-[#0B0F15]">
            Pulse<span className="text-[#8B93A1]">OS</span>
          </span>
        </Link>

        {/* Desktop Anchor Links with Active Section Highlight */}
        <ul className="hidden md:flex items-center gap-7 list-none p-0 text-sm font-medium">
          {MARKETING_CONTENT.nav.links.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`transition-colors py-1 px-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] ${
                    isActive
                      ? "text-[#5EE1D2] font-semibold"
                      : "text-[#8B93A1] hover:text-[#F2F4F7]"
                  }`}
                >
                  {link.label}
                </Link>
                {isActive && (
                  <span
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#5EE1D2] rounded-full shadow-[0_0_6px_#5EE1D2]"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* Right Action Cluster: Sound Toggle, Theme Toggle, Command Palette, App CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Heartbeat Sound Control */}
          <div className="relative flex items-center group/sound">
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] ${
                soundEnabled
                  ? "bg-[#FF4D5E]/15 border-[#FF4D5E]/40 text-[#FF4D5E] shadow-[0_0_10px_rgba(255,77,94,0.25)]"
                  : "bg-white/[0.04] border-white/15 text-[#8B93A1] hover:text-[#F2F4F7]"
              }`}
              aria-label="Heartbeat sound, on/off"
              aria-pressed={soundEnabled}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {soundEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H2v-6h3.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l4-4m0 0l-4-4m4 4H13" />
                )}
              </svg>
            </button>

            {/* Volume Slider on hover */}
            <div className="w-0 group-hover/sound:w-16 sm:group-hover/sound:w-20 group-focus-within/sound:w-16 sm:group-focus-within/sound:w-20 opacity-0 group-hover/sound:opacity-100 group-focus-within/sound:opacity-100 overflow-hidden transition-all duration-200 ml-1 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                aria-label="Heartbeat volume"
                className="w-14 sm:w-18 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#5EE1D2] focus:outline-none focus:ring-1 focus:ring-[#5EE1D2]"
              />
            </div>

            <div
              role="tooltip"
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] font-medium text-[#C9CFD9] bg-[#12161D]/95 border border-white/10 rounded-md shadow-xl backdrop-blur-md opacity-0 group-hover/sound:opacity-100 group-focus-within/sound:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50"
            >
              Best with headphones or speakers
            </div>
          </div>

          {/* Dark / Light Theme Toggle with Smooth Cross-Fade */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="p-2 rounded-full border border-white/15 bg-white/[0.04] text-[#8B93A1] hover:text-[#F2F4F7] transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4 text-[#FFB86B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#5EE1D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden min-[1100px]:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#8B93A1] hover:text-[#F2F4F7] bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
            aria-label="Open command palette"
          >
            <span>
              {isMac
                ? MARKETING_CONTENT.nav.commandKeyMac
                : MARKETING_CONTENT.nav.commandKeyLabel}
            </span>
          </button>

          {/* Sign In Link */}
          <Link
            href="/login"
            className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-[#8B93A1] hover:text-[#F2F4F7] px-2.5 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
          >
            Sign in
          </Link>

          {/* Primary CTA */}
          <Link
            href={MARKETING_CONTENT.nav.cta.href}
            onClick={(e) => handleLinkClick(e, MARKETING_CONTENT.nav.cta.href)}
            className="inline-flex items-center justify-center px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#07090D] bg-[#F2F4F7] hover:bg-white rounded-full transition-all hover:scale-[1.03] active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] whitespace-nowrap"
          >
            {MARKETING_CONTENT.nav.cta.label}
          </Link>

          {/* Mobile menu hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#8B93A1] hover:text-[#F2F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] rounded-lg"
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

        {/* Scroll Progress Hairline along bottom edge */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#5EE1D2] via-[#FFB86B] to-[#FF4D5E] transition-all duration-75 ease-out shadow-[0_0_8px_rgba(94,225,210,0.5)]"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden="true"
        />
      </nav>

      {/* Full-Screen Mobile Sheet with Staggered Links */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[56px] z-50 bg-[#07090D]/95 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between md:hidden animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5EE1D2]">
              Navigation
            </p>
            <ul className="space-y-4 list-none p-0">
              {MARKETING_CONTENT.nav.links.map((link, idx) => (
                <li
                  key={link.href}
                  className="transition-all duration-200"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="block text-2xl font-semibold text-[#F2F4F7] hover:text-[#5EE1D2] transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-3 text-center text-sm font-medium text-[#F2F4F7] bg-white/[0.06] hover:bg-white/[0.1] rounded-full border border-white/10 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-3 text-center text-sm font-semibold text-[#07090D] bg-[#5EE1D2] hover:bg-[#5EE1D2]/90 rounded-full transition-transform active:scale-98 shadow-lg shadow-[#5EE1D2]/20"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
