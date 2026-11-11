"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const METRICS = [
  {
    target: 14200,
    prefix: "",
    suffix: "+",
    label: "Lab metrics analyzed",
    subtext: "Sample synthetic data",
  },
  {
    target: 99.4,
    prefix: "",
    suffix: "%",
    label: "Parsing fidelity",
    subtext: "Standard clinical benchmark",
    decimals: 1,
  },
  {
    target: 2.4,
    prefix: "< ",
    suffix: "s",
    label: "Average streaming time",
    subtext: "Real-time SSE token delivery",
    decimals: 1,
  },
  {
    target: 0,
    prefix: "",
    suffix: "",
    label: "Medical diagnoses made",
    subtext: "Absolute safety boundary",
  },
];

export function NumbersBand() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const reducedMotion = useReducedMotion();

  const displayedCounts = reducedMotion ? METRICS.map((m) => m.target) : counts;

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          METRICS.forEach((metric, index) => {
            const countObj = { val: 0 };
            gsap.to(countObj, {
              val: metric.target,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                setCounts((prev) => {
                  const copy = [...prev];
                  copy[index] = countObj.val;
                  return copy;
                });
              },
            });
          });
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, reducedMotion]);

  return (
    <section
      ref={containerRef}
      id="numbers"
      className="py-16 sm:py-24 px-4 sm:px-6 border-y border-white/5 bg-[#0B0F15]/60 backdrop-blur-md"
      aria-label="PulseOS Platform Statistics"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {METRICS.map((item, idx) => (
            <div key={item.label} className="flex flex-col items-center text-center">
              <span className="font-mono text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F2F4F7] tabular-nums">
                {item.prefix}
                {item.decimals
                  ? displayedCounts[idx].toFixed(item.decimals)
                  : Math.round(displayedCounts[idx]).toLocaleString()}
                {item.suffix}
              </span>
              <span className="mt-2 text-sm sm:text-base font-medium text-[#F2F4F7]">
                {item.label}
              </span>
              <span className="mt-1 text-xs font-mono text-[#5EE1D2]/80">
                {item.subtext}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
