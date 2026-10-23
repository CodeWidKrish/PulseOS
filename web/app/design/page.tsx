"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/ui/toast";

export default function DesignPage() {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2">
          <Chip variant="normal">Design Authority</Chip>
          <span className="text-xs text-[#8B93A1]">DESIGN.md Traceable</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#F2F4F7]">
          Design System & Foundation Components
        </h1>
        <p className="text-base sm:text-lg text-[#8B93A1] max-w-2xl leading-relaxed">
          The canonical UI baseline for PulseOS. Built with radical visual restraint, 
          Apple-caliber spaciousness, clinical contrast compliance, and full keyboard accessibility.
        </p>
      </div>

      {/* 1. Design Tokens & Color Swatches */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F7] border-b border-white/10 pb-3">
          1. Color Tokens & Contrast Hierarchy
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="p-4 rounded-2xl bg-[#07090D] border border-white/15 space-y-2">
            <div className="h-10 rounded-lg bg-[#07090D] border border-white/20" />
            <p className="text-xs font-semibold text-[#F2F4F7]">Ink</p>
            <p className="text-[11px] font-mono text-[#8B93A1]">#07090D</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#12161D] border border-white/15 space-y-2">
            <div className="h-10 rounded-lg bg-[#12161D] border border-white/20" />
            <p className="text-xs font-semibold text-[#F2F4F7]">Graphite</p>
            <p className="text-[11px] font-mono text-[#8B93A1]">#12161D</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#12161D] border border-white/10 space-y-2">
            <div className="h-10 rounded-lg bg-[#F4F5F7] text-[#07090D] flex items-center justify-center font-bold text-xs" />
            <p className="text-xs font-semibold text-[#F2F4F7]">Mist</p>
            <p className="text-[11px] font-mono text-[#8B93A1]">#F4F5F7</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#12161D] border border-white/10 space-y-2">
            <div className="h-10 rounded-lg bg-[#FF4D5E] shadow-[0_0_15px_rgba(255,77,94,0.4)]" />
            <p className="text-xs font-semibold text-[#FF4D5E]">Pulse Red</p>
            <p className="text-[11px] font-mono text-[#8B93A1]">#FF4D5E</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#12161D] border border-white/10 space-y-2">
            <div className="h-10 rounded-lg bg-[#5EE1D2] shadow-[0_0_15px_rgba(94,225,210,0.4)]" />
            <p className="text-xs font-semibold text-[#5EE1D2]">Teal Normal</p>
            <p className="text-[11px] font-mono text-[#8B93A1]">#5EE1D2</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#12161D] border border-white/10 space-y-2">
            <div className="h-10 rounded-lg bg-[#FFB86B]" />
            <p className="text-xs font-semibold text-[#FFB86B]">Amber Caution</p>
            <p className="text-[11px] font-mono text-[#8B93A1]">#FFB86B</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#12161D] border border-white/10 space-y-2">
            <div className="h-10 rounded-lg bg-white/5 border border-white/10" />
            <p className="text-xs font-semibold text-[#8B93A1]">Text Muted</p>
            <p className="text-[11px] font-mono text-[#8B93A1]">#8B93A1</p>
          </div>
        </div>
      </section>

      {/* 2. Button Component Matrix */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F7]">
            2. Button Matrix (All Variants & States)
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBtnLoading(!btnLoading)}
          >
            Toggle Loading State ({btnLoading ? "ON" : "OFF"})
          </Button>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#8B93A1] uppercase tracking-wider">
            Variants & Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg" isLoading={btnLoading}>
              Primary Large
            </Button>
            <Button variant="primary" size="md" isLoading={btnLoading}>
              Primary Medium
            </Button>
            <Button variant="primary" size="sm" isLoading={btnLoading}>
              Primary Small
            </Button>
            <Button variant="outline" size="md" isLoading={btnLoading}>
              Outline Medium
            </Button>
            <Button variant="ghost" size="md" isLoading={btnLoading}>
              Ghost Button
            </Button>
            <Button variant="dark-primary" size="md" isLoading={btnLoading}>
              Dark Primary
            </Button>
          </div>
        </div>

        {/* States: Disabled, Focus, Icons */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[#8B93A1] uppercase tracking-wider">
            States: Disabled, Keyboard Focusable, Icons
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" disabled>
              Primary Disabled
            </Button>
            <Button variant="outline" disabled>
              Outline Disabled
            </Button>
            <Button
              variant="primary"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              With Icon
            </Button>
            <Button
              variant="outline"
              rightIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Continue
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Status Chip / Pill */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F7] border-b border-white/10 pb-3">
          3. Status Chips (Clinical Indicators)
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Chip variant="normal" size="md">Normal (70-99 mg/dL)</Chip>
          <Chip variant="alert" size="md">High (148 mg/dL)</Chip>
          <Chip variant="caution" size="md">Borderline (105 mg/dL)</Chip>
          <Chip variant="neutral" size="md">Unverified</Chip>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Chip variant="normal" size="sm">Normal</Chip>
          <Chip variant="alert" size="sm">Critical</Chip>
          <Chip variant="caution" size="sm">Elevated</Chip>
          <Chip variant="neutral" size="sm" dot={false}>Static Pill</Chip>
        </div>
      </section>

      {/* 4. Form Input Matrix */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F7] border-b border-white/10 pb-3">
          4. Input Fields (States & A11y)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Resting Heart Rate"
            placeholder="e.g. 72"
            unit="bpm"
            value={inputValue}
            error={inputError}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (Number(e.target.value) > 200) {
                setInputError("Heart rate cannot exceed 200 bpm");
              } else {
                setInputError("");
              }
            }}
            helperText="Standard range: 60 - 100 bpm"
          />

          <Input
            label="Fasting Glucose"
            placeholder="e.g. 92"
            unit="mg/dL"
            defaultValue="145"
            error="Flagged: Glucose value exceeds 99 mg/dL baseline"
          />

          <Input
            label="Disabled Input"
            placeholder="Cannot be edited"
            disabled
            defaultValue="Locked System Parameter"
          />
        </div>
      </section>

      {/* 5. Card Component Showcase */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F7] border-b border-white/10 pb-3">
          5. Bento Cards (28px Radius & Tactile Surfaces)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card interactive>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Chip variant="normal">Normal</Chip>
                <span className="text-xs text-[#8B93A1] font-mono">Today, 08:30</span>
              </div>
              <CardTitle className="mt-2">Blood Pressure</CardTitle>
              <CardDescription>Measured with home monitor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold font-mono tracking-tight text-[#F2F4F7] tabular-nums">
                120 <span className="text-lg font-normal text-[#8B93A1]">/ 78</span>
              </div>
              <p className="text-xs text-[#8B93A1] mt-1">Optimal baseline cardiovascular range</p>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-[#5EE1D2]">Trend: Stable (+0.5%)</span>
              <span className="text-xs text-[#8B93A1]">Hover for depth</span>
            </CardFooter>
          </Card>

          <Card interactive>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Chip variant="alert">Flagged</Chip>
                <span className="text-xs text-[#8B93A1] font-mono">Yesterday</span>
              </div>
              <CardTitle className="mt-2">Fasting Glucose</CardTitle>
              <CardDescription>Comprehensive Metabolic Panel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold font-mono tracking-tight text-[#FF4D5E] tabular-nums">
                118 <span className="text-lg font-normal text-[#8B93A1]">mg/dL</span>
              </div>
              <p className="text-xs text-[#8B93A1] mt-1">Standard normal range: 70 - 99 mg/dL</p>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-[#FF4D5E]">Elevated above threshold</span>
              <Button size="sm" variant="ghost">Details</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Chip variant="caution">Consultation</Chip>
              <CardTitle className="mt-2">Dr. Marcus Vance, MD</CardTitle>
              <CardDescription>Cardiology & Preventative Health</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#8B93A1] leading-relaxed">
                Next available consultation slot: Tomorrow at 09:00 AM UTC.
              </p>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-[#8B93A1]">Conflict-Safe Booking</span>
              <Button size="sm" variant="primary">Book Slot</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 6. Toast Notifications */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F7] border-b border-white/10 pb-3">
          6. Toast Feedback (Floating Glass Pills)
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            onClick={() => showToast.success("Lab report analyzed successfully with 8 biomarkers identified.")}
          >
            Trigger Success Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => showToast.error("Slot was just booked by another user. Please pick another slot.")}
          >
            Trigger Conflict / Error Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => showToast.info("Pre-consultation summary prepared for Dr. Marcus Vance.")}
          >
            Trigger Info Toast
          </Button>
        </div>
      </section>

      {/* 7. Skeleton Loaders */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F2F4F7] border-b border-white/10 pb-3">
          7. Skeleton Loaders (Calm Placeholders)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-16 h-6" variant="pill" />
              <Skeleton className="w-20 h-4" />
            </div>
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-full h-16" />
            <div className="flex justify-between pt-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-8" variant="pill" />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10" variant="circle" />
              <div className="space-y-2 flex-1">
                <Skeleton className="w-1/2 h-4" />
                <Skeleton className="w-1/3 h-3" />
              </div>
            </div>
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-2/3 h-4" />
          </Card>

          <Card className="p-6 space-y-3">
            <Skeleton className="w-1/3 h-5" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-4/5 h-4" />
            <Skeleton className="w-1/2 h-4" />
          </Card>
        </div>
      </section>

      {/* 8. Keyboard Accessibility Test Helper */}
      <section className="p-6 rounded-2xl bg-[#12161D]/50 border border-white/5 space-y-3">
        <h3 className="text-sm font-semibold text-[#F2F4F7]">
          Keyboard Focus Check
        </h3>
        <p className="text-xs text-[#8B93A1] leading-relaxed">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#F2F4F7] font-mono text-[11px]">Tab</kbd> to traverse all interactive elements on this page. Every button and input displays a visible, high-contrast cyan ring (<code className="text-[#5EE1D2]">#5EE1D2</code>) conforming to WCAG 2.1 Focus Visible criteria.
        </p>
      </section>
    </div>
  );
}
