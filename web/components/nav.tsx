"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] rounded-lg px-1.5 py-1"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D5E] shadow-[0_0_12px_rgba(255,77,94,0.7)] group-hover:scale-110 transition-transform duration-200" />
          <span className="font-semibold text-lg tracking-tight text-[#F2F4F7]">
            Pulse<span className="text-[#8B93A1]">OS</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8B93A1]" aria-label="Main Navigation">
          <Link
            href="/"
            className="hover:text-[#F2F4F7] transition-colors focus-visible:outline-none focus-visible:text-[#F2F4F7]"
          >
            Overview
          </Link>
          <Link
            href="/design"
            className="hover:text-[#F2F4F7] transition-colors focus-visible:outline-none focus-visible:text-[#F2F4F7]"
          >
            Design System
          </Link>
          <Link
            href="#features"
            className="hover:text-[#F2F4F7] transition-colors focus-visible:outline-none focus-visible:text-[#F2F4F7]"
          >
            Lab Explainer
          </Link>
          <Link
            href="#vitals"
            className="hover:text-[#F2F4F7] transition-colors focus-visible:outline-none focus-visible:text-[#F2F4F7]"
          >
            Vitals
          </Link>
          <Link
            href="#doctors"
            className="hover:text-[#F2F4F7] transition-colors focus-visible:outline-none focus-visible:text-[#F2F4F7]"
          >
            Physicians
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#8B93A1] hover:text-[#F2F4F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] rounded-lg"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-x-0 border-b border-t-0 p-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#F2F4F7] py-2 px-3 rounded-lg hover:bg-white/5"
          >
            Overview
          </Link>
          <Link
            href="/design"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#F2F4F7] py-2 px-3 rounded-lg hover:bg-white/5"
          >
            Design System
          </Link>
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#8B93A1] hover:text-[#F2F4F7] py-2 px-3 rounded-lg hover:bg-white/5"
          >
            Lab Explainer
          </Link>
          <div className="pt-3 border-t border-white/5 flex gap-2">
            <Link href="/auth/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="sm" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
