"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface RowItem {
  id: string;
  minHeightClass: string;
  before: {
    text: string;
    ref?: string;
    flag?: string;
  };
  after: {
    text: string;
    chip: {
      label: string;
      variant: "normal" | "amber" | "doctor";
    };
  };
}

const ROWS: RowItem[] = [
  {
    id: "hba1c",
    minHeightClass: "min-h-[100px] sm:min-h-[88px]",
    before: {
      text: "HBA1C (NGSP)  5.4 %",
      ref: "REF 4.0-5.6",
    },
    after: {
      text: "Your 3-month average blood sugar is 5.4%. That is healthy.",
      chip: {
        label: "Normal",
        variant: "normal",
      },
    },
  },
  {
    id: "glucose",
    minHeightClass: "min-h-[144px] sm:min-h-[88px]",
    before: {
      text: "FBS  108 mg/dL",
      ref: "REF 70-100",
      flag: "H",
    },
    after: {
      text: "Your fasting sugar is slightly above the usual range. Worth mentioning to your doctor.",
      chip: {
        label: "Slightly high",
        variant: "amber",
      },
    },
  },
  {
    id: "thyroid",
    minHeightClass: "min-h-[88px]",
    before: {
      text: "TSH  2.1 mIU/L",
      ref: "REF 0.4-4.0",
    },
    after: {
      text: "Your thyroid hormone is in range.",
      chip: {
        label: "Normal",
        variant: "normal",
      },
    },
  },
  {
    id: "next-step",
    minHeightClass: "min-h-[122px] sm:min-h-[88px]",
    before: {
      text: "INTERP: NON-DIABETIC RANGE / CORRELATE CLINICALLY",
    },
    after: {
      text: "Ask your doctor: should I retest fasting glucose in three months?",
      chip: {
        label: "Ask your doctor",
        variant: "doctor",
      },
    },
  },
];

export function BeforeAfter() {
  const [percent, setPercent] = useState<number>(50);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const hasSweptRef = useRef<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  const reducedMotion = useReducedMotion();

  // Position updater based on clientX relative to the stage
  const updatePosition = useCallback((clientX: number) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(rect.width, x));
    const nextPercent = Math.round((clamped / rect.width) * 100);
    setPercent(nextPercent);
    setHasInteracted(true);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore fallback
    }
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      updatePosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Keyboard navigation for accessible range slider
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setPercent((prev) => Math.max(0, prev - 2));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setPercent((prev) => Math.min(100, prev + 2));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPercent(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPercent(100);
    }
  };

  // Clicking a row jumps the divider to reveal up to that row
  const handleRowClick = (index: number) => {
    setHasInteracted(true);
    const target = Math.min(100, Math.round(((index + 1) / 4) * 100));
    setActiveHighlight(index);
    setTimeout(() => setActiveHighlight(null), 250);

    const sweepObj = { p: percent };
    gsap.to(sweepObj, {
      p: target,
      duration: 0.35,
      ease: "power2.out",
      onUpdate: () => {
        setPercent(Math.round(sweepObj.p));
      },
    });
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      setHasInteracted(true);
      if (diff > 0) {
        // Swiped right -> reveal more Before (or slide towards 0)
        setPercent(0);
      } else {
        // Swiped left -> reveal After (slide towards 100)
        setPercent(100);
      }
    }
    touchStartXRef.current = null;
  };

  // GSAP viewport sweep: 50 -> 85 -> 15 -> 50 over 1.8s (power2.inOut)
  useEffect(() => {
    if (reducedMotion || hasSweptRef.current || typeof window === "undefined") return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasSweptRef.current) {
          hasSweptRef.current = true;
          const sweepObj = { p: 50 };
          gsap
            .timeline({
              defaults: { ease: "power2.inOut" },
              onUpdate: () => {
                setPercent(Math.round(sweepObj.p));
              },
            })
            .to(sweepObj, { p: 85, duration: 0.55 })
            .to(sweepObj, { p: 15, duration: 0.7 })
            .to(sweepObj, { p: 50, duration: 0.55 });
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#12161D] rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 sm:p-7 md:p-8"
      role="region"
      aria-label="Interactive before and after comparison"
    >
      {/* Card Header: Title, Subtitle, and Mobile Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F7]">
            Before and after
          </h3>
          <p className="text-sm text-[#8B93A1] mt-1 font-light">
            Drag to turn lab jargon into plain language
          </p>
        </div>

        {/* Mobile Segmented Control (< 640px) */}
        <div
          className="sm:hidden flex items-center p-1 bg-black/40 rounded-full border border-white/10 self-start"
          role="group"
          aria-label="View selection"
        >
          <button
            type="button"
            onClick={() => {
              setHasInteracted(true);
              setPercent(0);
            }}
            className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              percent < 50
                ? "bg-[#FF4D5E]/20 text-[#FF8591] border border-[#FF4D5E]/40 shadow-sm"
                : "text-[#8B93A1] hover:text-[#F2F4F7]"
            }`}
            aria-pressed={percent < 50}
          >
            Before (Raw)
          </button>
          <button
            type="button"
            onClick={() => {
              setHasInteracted(true);
              setPercent(100);
            }}
            className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              percent >= 50
                ? "bg-[#5EE1D2]/20 text-[#5EE1D2] border border-[#5EE1D2]/40 shadow-sm"
                : "text-[#8B93A1] hover:text-[#F2F4F7]"
            }`}
            aria-pressed={percent >= 50}
          >
            After (PulseOS)
          </button>
        </div>
      </div>

      {/* Interactive Transformation Stage */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: "pan-y",
          ["--p" as string]: `${percent}%`,
        }}
        className="relative w-full rounded-[18px] overflow-hidden select-none cursor-ew-resize border border-white/10 shadow-inner"
      >
        {/* ============================================================== */}
        {/* 1. BEFORE LAYER (BASE, RED PALETTE)                           */}
        {/* ============================================================== */}
        <div
          id="before-layer"
          className="w-full h-full p-4 sm:p-6 text-[#FFB3BC]"
          style={{
            background: "linear-gradient(135deg, #2A0B10, #3B0F17)",
          }}
        >
          {/* Header Strip: Red Dot + RAW REPORT */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-2 h-2 rounded-full bg-[#FF4D5E] shadow-[0_0_8px_#FF4D5E]"
              aria-hidden="true"
            />
            <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-[#FF4D5E] uppercase">
              RAW REPORT
            </span>
          </div>

          {/* 4 Identical CSS Grid Rows */}
          <div
            className="grid gap-3 sm:gap-3.5"
            style={{
              gridTemplateRows: "repeat(4, auto)",
            }}
          >
            {ROWS.map((row, index) => (
              <div
                key={`before-${row.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(index);
                }}
                className={`w-full ${row.minHeightClass} rounded-[14px] p-4 sm:p-5 flex items-center justify-between gap-3 border transition-all duration-200 cursor-pointer ${
                  activeHighlight === index
                    ? "bg-[rgba(255,77,94,0.18)] border-[#FF4D5E] shadow-[0_0_15px_rgba(255,77,94,0.3)]"
                    : "bg-[rgba(255,77,94,0.08)] border-[rgba(255,77,94,0.25)] hover:border-[rgba(255,77,94,0.45)]"
                }`}
              >
                <div className="min-w-0">
                  <span className="font-mono text-[13px] sm:text-sm text-[#FFB3BC] font-medium tracking-wide block">
                    {row.before.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {row.before.ref && (
                    <span className="font-mono text-xs sm:text-[13px] text-[#FF8591] tracking-wide">
                      {row.before.ref}
                    </span>
                  )}
                  {row.before.flag && (
                    <span className="bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40 px-2 py-0.5 rounded-full text-xs font-mono font-bold shadow-[0_0_8px_rgba(255,77,94,0.25)]">
                      {row.before.flag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. AFTER LAYER (TOP REVEALED VIA CLIP-PATH, GREEN PALETTE)     */}
        {/* ============================================================== */}
        <div
          id="after-layer"
          className="absolute inset-0 w-full h-full p-4 sm:p-6 text-[#D9FFF6] pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #062B24, #0A3B31)",
            clipPath: `inset(0 calc(100% - var(--p, ${percent}%)) 0 0)`,
          }}
        >
          {/* Header Strip: Green Dot + PULSEOS EXPLANATION */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-2 h-2 rounded-full bg-[#5EE1D2] shadow-[0_0_8px_#5EE1D2]"
              aria-hidden="true"
            />
            <span className="font-sans text-[11px] font-bold tracking-[0.12em] text-[#5EE1D2] uppercase">
              PULSEOS EXPLANATION
            </span>
          </div>

          {/* 4 Identical CSS Grid Rows (Matches BEFORE grid perfectly) */}
          <div
            className="grid gap-3 sm:gap-3.5"
            style={{
              gridTemplateRows: "repeat(4, auto)",
            }}
          >
            {ROWS.map((row, index) => {
              const isPassed = percent >= (index + 0.35) * 25;
              return (
                <div
                  key={`after-${row.id}`}
                  className={`w-full ${row.minHeightClass} rounded-[14px] p-4 sm:p-5 flex items-center justify-between gap-3 border transition-all duration-200 ${
                    activeHighlight === index || isPassed
                      ? "bg-[rgba(94,225,210,0.14)] border-[#5EE1D2]/60 shadow-[0_0_12px_rgba(94,225,210,0.25)]"
                      : "bg-[rgba(94,225,210,0.09)] border-[rgba(94,225,210,0.28)]"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-sans text-[13px] sm:text-[14px] text-[#D9FFF6] font-normal leading-relaxed">
                      {row.after.text}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {row.after.chip.variant === "normal" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#5EE1D2]/20 text-[#5EE1D2] border border-[#5EE1D2]/40 shadow-[0_0_8px_rgba(94,225,210,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5EE1D2]" />
                        {row.after.chip.label}
                      </span>
                    )}

                    {row.after.chip.variant === "amber" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFB86B]/20 text-[#FFB86B] border border-[#FFB86B]/40 shadow-[0_0_8px_rgba(255,184,107,0.2)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB86B]" />
                        {row.after.chip.label}
                      </span>
                    )}

                    {row.after.chip.variant === "doctor" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-[#5EE1D2]/60 text-[#5EE1D2] bg-[#5EE1D2]/10 shadow-[0_0_8px_rgba(94,225,210,0.15)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5EE1D2]" />
                        {row.after.chip.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. DIVIDER LINE & 40PX CIRCULAR HANDLE                         */}
        {/* ============================================================== */}
        <div
          className="absolute top-0 bottom-0 w-[2px] pointer-events-none z-20 transition-[box-shadow] duration-200"
          style={{
            left: `var(--p, ${percent}%)`,
            background: "linear-gradient(to bottom, #5EE1D2 0%, #FF4D5E 100%)",
            boxShadow:
              percent >= 50
                ? "0 0 12px rgba(255, 77, 94, 0.7)"
                : "0 0 12px rgba(94, 225, 210, 0.7)",
          }}
        >
          {/* 40px Circular Grab Handle with Left/Right Chevrons */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#12161D] border-2 border-white/40 shadow-[0_4px_18px_rgba(0,0,0,0.6)] flex items-center justify-center select-none transition-transform hover:scale-105 ${
              !hasInteracted ? "animate-pulse" : ""
            }`}
            aria-hidden="true"
          >
            <svg
              className="w-3.5 h-3.5 text-[#5EE1D2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <svg
              className="w-3.5 h-3.5 text-[#FF4D5E] -ml-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 15 6" />
            </svg>
          </div>
        </div>

        {/* Accessible Range Input */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={percent}
          onChange={(e) => {
            setHasInteracted(true);
            setPercent(Number(e.target.value));
          }}
          onKeyDown={handleKeyDown}
          aria-label="Compare raw report and PulseOS explanation"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="sr-only"
        />
      </div>

      {/* Footer Disclaimer */}
      <p className="mt-4 text-xs text-[#8B93A1] text-center font-light">
        Sample data. PulseOS explains information and does not provide medical advice.
      </p>
    </div>
  );
}

export default BeforeAfter;
