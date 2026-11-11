"use client";

import React, { useState, useEffect, useRef } from "react";
import { MARKETING_CONTENT } from "@/lib/content";
import { toast } from "@/components/ui/toast";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useHeart } from "@/lib/heart-context";
import { BeforeAfter } from "./before-after";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export function BentoDashboard() {
  const { bpm } = useHeart();
  const containerRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [heartRateRange, setHeartRateRange] = useState<"7" | "30">("7");
  const [selectedDoctor, setSelectedDoctor] = useState(
    MARKETING_CONTENT.dashboard.doctors[0].name
  );
  const [selectedSlot, setSelectedSlot] = useState(
    MARKETING_CONTENT.dashboard.doctors[0].slots[1]
  );
  const [medicines, setMedicines] = useState(
    MARKETING_CONTENT.dashboard.medicines
  );
  const [animatedScore, setAnimatedScore] = useState(0);
  const reducedMotion = useReducedMotion();

  // Native IntersectionObserver to trigger animations smoothly on scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined" || reducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // Smooth counter animation from 0 to 86
  useEffect(() => {
    if (!isInView || reducedMotion) return;

    const target = 86;
    const duration = 1400;
    const start = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedScore(Math.round(ease * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, reducedMotion]);

  const displayScore = reducedMotion ? 86 : animatedScore;
  const isAnimated = reducedMotion || isInView;

  // Handle heart rate range toggle
  const handleRangeChange = (range: "7" | "30") => {
    setHeartRateRange(range);
  };

  const handleBooking = () => {
    const docShortName = selectedDoctor.split(" · ")[0];
    toast.success(`Booked with ${docShortName}, ${selectedSlot} (sample)`);
  };

  const toggleMedicine = (id: string) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, defaultChecked: !m.defaultChecked } : m
      )
    );
  };

  return (
    <section
      ref={containerRef}
      id="app"
      className="relative z-20 py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-transparent text-[#0B0F15] transition-colors"
      aria-label="Dashboard Preview"
    >
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-semibold tracking-[-0.035em] text-3xl sm:text-4xl md:text-5xl text-[#0B0F15]">
          {MARKETING_CONTENT.dashboard.heading}
        </h2>
        <p className="mt-4 text-[#5A6270] font-light text-base sm:text-lg leading-[1.55] max-w-[46ch]">
          {MARKETING_CONTENT.dashboard.subcopy}
        </p>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3.5 mt-10">
          {/* Tile 1: Health Score (2 cols) */}
          <SpotlightCard
            className="md:col-span-2 bg-white rounded-[28px] p-6 shadow-sm border border-black/5 flex flex-col justify-between"
            spotlightColor="rgba(94, 225, 210, 0.15)"
          >
            <div>
              <h3 className="font-semibold text-lg tracking-tight text-[#0B0F15]">
                {MARKETING_CONTENT.dashboard.healthScore.label}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {MARKETING_CONTENT.dashboard.healthScore.caption}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <svg
                viewBox="0 0 120 120"
                className="w-28 h-28 flex-none"
                role="img"
                aria-label={`Health score ${animatedScore} out of 100`}
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#ECEDF0"
                  strokeWidth="12"
                />
                <circle
                  id="score-ring-circle"
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#0B0D12"
                  strokeWidth="12"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={isAnimated ? 14 : 100}
                  transform="rotate(-90 60 60)"
                  className="transition-[stroke-dashoffset] duration-1000 ease-out"
                />
              </svg>
              <div>
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0B0F15]">
                  {displayScore}
                </span>
                <span className="text-sm text-[#6B7280]"> / 100</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Tile 2: Resting Heart Rate Chart (4 cols) */}
          <SpotlightCard
            className="md:col-span-4 bg-white rounded-[28px] p-6 shadow-sm border border-black/5 flex flex-col justify-between"
            spotlightColor="rgba(255, 77, 94, 0.15)"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-lg tracking-tight text-[#0B0F15]">
                  {MARKETING_CONTENT.dashboard.heartRate.label}
                </h3>
              </div>
              {/* Range Toggle */}
              <div
                className="inline-flex bg-[#EDEEF1] p-1 rounded-full text-xs font-medium"
                role="group"
                aria-label="Time range"
              >
                <button
                  type="button"
                  onClick={() => handleRangeChange("7")}
                  aria-pressed={heartRateRange === "7"}
                  className={`px-3 py-1 rounded-full transition-all ${
                    heartRateRange === "7"
                      ? "bg-white text-[#0B0D12] shadow-sm font-semibold"
                      : "text-[#5B6270] hover:text-[#0B0D12]"
                  }`}
                >
                  7 days
                </button>
                <button
                  type="button"
                  onClick={() => handleRangeChange("30")}
                  aria-pressed={heartRateRange === "30"}
                  className={`px-3 py-1 rounded-full transition-all ${
                    heartRateRange === "30"
                      ? "bg-white text-[#0B0D12] shadow-sm font-semibold"
                      : "text-[#5B6270] hover:text-[#0B0D12]"
                  }`}
                >
                  30 days
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#0B0F15] tabular-nums">
                {bpm}
              </span>
              <span className="text-sm text-[#6B7280]">
                bpm live · {heartRateRange === "7" ? "7d avg 71" : "30d avg 69"}
              </span>
            </div>

            {/* SVG Line Graph */}
            <div className="mt-2 w-full">
              <svg viewBox="0 0 600 150" className="w-full h-auto overflow-visible">
                <defs>
                  <linearGradient id="hr-gradient" x1="0" x2="1">
                    <stop offset="0%" stopColor="#FF4D5E" />
                    <stop offset="100%" stopColor="#FFB86B" />
                  </linearGradient>
                </defs>
                <path
                  id="hr-line-path"
                  d={
                    heartRateRange === "7"
                      ? MARKETING_CONTENT.dashboard.heartRate.path7Day
                      : MARKETING_CONTENT.dashboard.heartRate.path30Day
                  }
                  fill="none"
                  stroke="url(#hr-gradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={isAnimated ? 0 : 1}
                  className="transition-[stroke-dashoffset,d] duration-1000 ease-out"
                />
              </svg>
            </div>
          </SpotlightCard>

          {/* Tile 3: Doctor Appointment Booking (3 cols, Obsidian Dark) */}
          <SpotlightCard
            id="book"
            className="md:col-span-3 bg-[#0B0D12] text-[#F2F4F7] rounded-[28px] p-6 sm:p-7 shadow-lg flex flex-col justify-between"
            spotlightColor="rgba(94, 225, 210, 0.2)"
            borderColor="rgba(255, 255, 255, 0.12)"
          >
            <div>
              <h3 className="font-semibold text-lg tracking-tight text-white">
                Book a doctor
              </h3>
              <p className="text-xs text-[#9AA2B0]">Sample physicians</p>

              {/* Doctor Selection Buttons */}
              <div className="flex flex-wrap gap-2 mt-4" role="radiogroup" aria-label="Select doctor">
                {MARKETING_CONTENT.dashboard.doctors.map((doc) => {
                  const isSelected = selectedDoctor === doc.name;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(doc.name);
                        setSelectedSlot(doc.slots[0]);
                      }}
                      aria-pressed={isSelected}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        isSelected
                          ? "bg-white text-[#0B0D12] border-white font-medium"
                          : "border-white/20 text-[#C9CFD9] hover:bg-white/10"
                      }`}
                    >
                      {doc.name} · {doc.specialty}
                    </button>
                  );
                })}
              </div>

              {/* Available Slot Buttons */}
              <div className="flex flex-wrap gap-2 mt-3" role="radiogroup" aria-label="Select slot">
                {MARKETING_CONTENT.dashboard.doctors
                  .find((d) => d.name === selectedDoctor)
                  ?.slots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        aria-pressed={isSelected}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                          isSelected
                            ? "bg-white text-[#0B0D12] border-white font-medium"
                            : "border-white/20 text-[#C9CFD9] hover:bg-white/10"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleBooking}
                className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-medium text-[#07090D] bg-[#F2F4F7] hover:bg-white rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
              >
                Confirm booking
              </button>
            </div>
          </SpotlightCard>

          {/* Tile 4: Today's Medicines Checklist (3 cols) */}
          <SpotlightCard
            className="md:col-span-3 bg-white rounded-[28px] p-6 sm:p-7 shadow-sm border border-black/5 flex flex-col justify-between"
            spotlightColor="rgba(255, 184, 107, 0.15)"
          >
            <div>
              <h3 className="font-semibold text-lg tracking-tight text-[#0B0F15]">
                Today&rsquo;s medicines
              </h3>
              <p className="text-xs text-[#6B7280]">Sample reminders</p>

              <div className="mt-4 space-y-2">
                {medicines.map((med) => (
                  <label
                    key={med.id}
                    className="flex items-center gap-3 py-2 border-b border-black/5 last:border-0 cursor-pointer group text-sm select-none"
                  >
                    <input
                      type="checkbox"
                      checked={med.defaultChecked}
                      onChange={() => toggleMedicine(med.id)}
                      className="w-4 h-4 rounded text-[#0B0D12] accent-[#0B0D12] cursor-pointer"
                    />
                    <span
                      className={`transition-colors ${
                        med.defaultChecked
                          ? "line-through text-[#5A6270]"
                          : "text-[#0B0F15] group-hover:text-black font-medium"
                      }`}
                    >
                      {med.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </SpotlightCard>

          {/* Tile 5: Before and After Interactive Transformation (6 cols, Full Width) */}
          <div className="md:col-span-6">
            <BeforeAfter />
          </div>
        </div>
      </div>
    </section>
  );
}
