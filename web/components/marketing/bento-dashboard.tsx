"use client";

import React, { useState, useEffect, useRef } from "react";
import { MARKETING_CONTENT } from "@/lib/content";
import { toast } from "@/components/ui/toast";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function BentoDashboard() {
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
  const [sliderPercent, setSliderPercent] = useState(50);
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
      className="relative z-20 py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-[#F4F5F7] text-[#0B0F15] transition-colors"
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
          <div className="md:col-span-2 bg-white rounded-[28px] p-6 shadow-sm border border-black/5 flex flex-col justify-between">
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
          </div>

          {/* Tile 2: Resting Heart Rate Chart (4 cols) */}
          <div className="md:col-span-4 bg-white rounded-[28px] p-6 shadow-sm border border-black/5 flex flex-col justify-between">
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

            <div className="mt-4">
              <span className="text-3xl font-bold tracking-tight text-[#0B0F15]">
                {heartRateRange === "7"
                  ? MARKETING_CONTENT.dashboard.heartRate.sevenDayAvg
                  : MARKETING_CONTENT.dashboard.heartRate.thirtyDayAvg}
              </span>
              <span className="text-sm text-[#6B7280] ml-2">bpm average</span>
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
          </div>

          {/* Tile 3: Doctor Appointment Booking (3 cols, Obsidian Dark) */}
          <div
            id="book"
            className="md:col-span-3 bg-[#0B0D12] text-[#F2F4F7] rounded-[28px] p-6 sm:p-7 shadow-lg flex flex-col justify-between"
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
          </div>

          {/* Tile 4: Today's Medicines Checklist (3 cols) */}
          <div className="md:col-span-3 bg-white rounded-[28px] p-6 sm:p-7 shadow-sm border border-black/5 flex flex-col justify-between">
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
          </div>

          {/* Tile 5: Before and After Interactive Slider (6 cols, Full Width) */}
          <div className="md:col-span-6 bg-white rounded-[28px] p-6 sm:p-7 shadow-sm border border-black/5">
            <div>
              <h3 className="font-semibold text-lg tracking-tight text-[#0B0F15]">
                {MARKETING_CONTENT.dashboard.beforeAfter.title}
              </h3>
              <p className="text-xs text-[#6B7280]">
                {MARKETING_CONTENT.dashboard.beforeAfter.caption}
              </p>
            </div>

            {/* Slider Container */}
            <div
              className="relative mt-5 rounded-2xl overflow-hidden bg-[#F4F5F7] min-h-[160px] border border-black/10 select-none"
              style={{ ["--slider-percent" as string]: `${sliderPercent}%` }}
            >
              {/* Before View (Dense Lab Format) */}
              <div className="absolute inset-0 p-5 text-xs sm:text-sm font-mono text-[#5A6270] leading-relaxed">
                <span className="text-[10px] uppercase tracking-wider text-[#5A6270] block mb-1 font-sans font-bold">
                  Raw Lab Report
                </span>
                {MARKETING_CONTENT.dashboard.beforeAfter.beforeSnippet
                  .split("\n")
                  .map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
              </div>

              {/* After View (Calm Plain English, Clip-path applied) */}
              <div
                className="absolute inset-0 p-5 text-xs sm:text-sm font-sans bg-[#E8FBF8] text-[#0B3B36] leading-relaxed transition-none"
                style={{
                  clipPath: `inset(0 calc(100% - ${sliderPercent}%) 0 0)`,
                }}
              >
                <span className="text-[10px] uppercase tracking-wider text-[#0B3B36] block mb-1 font-bold">
                  PulseOS Explanation
                </span>
                {MARKETING_CONTENT.dashboard.beforeAfter.afterSnippet
                  .split("\n")
                  .map((line, i) => (
                    <div key={i} className={i === 0 ? "font-bold text-[#082925]" : ""}>
                      {line}
                    </div>
                  ))}
              </div>

              {/* Divider Line Handle */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#0B0D12] pointer-events-none"
                style={{ left: `${sliderPercent}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-black/20 shadow-md flex items-center justify-center text-[10px] text-black">
                  ↔
                </div>
              </div>

              {/* Interactive Range Input overlay */}
              <input
                type="range"
                min="5"
                max="95"
                value={sliderPercent}
                onChange={(e) => setSliderPercent(Number(e.target.value))}
                aria-label="Drag slider to compare raw report with PulseOS"
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize m-0 z-10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
