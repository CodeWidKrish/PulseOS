"use client";

import React, { useState, useRef, useEffect } from "react";
import { MARKETING_CONTENT } from "@/lib/content";
import { useReducedMotion } from "@/lib/use-reduced-motion";

import { useHeart } from "@/lib/heart-context";

export function InteractiveDemo() {
  const [isBusy, setIsBusy] = useState(false);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const reducedMotion = useReducedMotion();
  const { beat, setBpm } = useHeart();
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  const handleAnalyze = () => {
    if (isBusy) return;

    // Reset timeouts
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];

    // Trigger strong double beat and elevate BPM to 84 while streaming
    beat(2.0, false);
    setTimeout(() => beat(1.5, true), 220);
    setBpm(84);

    setIsBusy(true);
    setVisibleIndices([]);
    setStreamedText("");
    setIsStreaming(true);

    if (reducedMotion) {
      // Instant reveal for reduced motion
      setVisibleIndices([0, 1, 2]);
      setStreamedText(MARKETING_CONTENT.demo.explanationMarkdown);
      setIsStreaming(false);
      setIsBusy(false);
      setBpm(72);
      return;
    }

    // Sequentially reveal each lab metric row
    MARKETING_CONTENT.demo.labValues.forEach((_, idx) => {
      const timer = setTimeout(() => {
        setVisibleIndices((prev) => [...prev, idx]);
      }, 400 + idx * 450);
      timeoutIdsRef.current.push(timer);
    });

    // Start streaming words after values are revealed
    const streamStartTimer = setTimeout(() => {
      const words = MARKETING_CONTENT.demo.explanationMarkdown.split(" ");
      let currentWordIndex = 0;
      let accumulated = "";

      const streamNextWord = () => {
        if (currentWordIndex >= words.length) {
          setIsStreaming(false);
          setIsBusy(false);
          setBpm(72);
          return;
        }

        accumulated += (currentWordIndex > 0 ? " " : "") + words[currentWordIndex];
        setStreamedText(accumulated);
        currentWordIndex++;

        const wordTimer = setTimeout(streamNextWord, 42);
        timeoutIdsRef.current.push(wordTimer);
      };

      streamNextWord();
    }, 1800);

    timeoutIdsRef.current.push(streamStartTimer);
  };

  // Convert markdown **bold** to <strong> tags
  const renderFormattedExplanation = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-[#F2F4F7] font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <section
      id="demo"
      className="relative z-20 py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-transparent border-t border-white/6"
      aria-label="Interactive Demo"
    >
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-semibold tracking-[-0.035em] text-3xl sm:text-4xl md:text-5xl text-[#F2F4F7]">
          {MARKETING_CONTENT.demo.heading}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-8 lg:gap-16 items-center mt-8">
          {/* Left Column: Explainer and Action Button */}
          <div>
            <p className="text-[#8B93A1] font-light text-base sm:text-lg leading-[1.6] max-w-[44ch]">
              {MARKETING_CONTENT.demo.subcopy}
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isBusy}
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-medium text-[#07090D] bg-[#F2F4F7] hover:bg-white disabled:opacity-50 disabled:pointer-events-none rounded-full transition-all duration-200 shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
              >
                {isBusy
                  ? MARKETING_CONTENT.demo.analyzingLabel
                  : streamedText
                  ? "Re-run sample analysis"
                  : MARKETING_CONTENT.demo.buttonLabel}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Terminal Preview */}
          <div
            className="bg-[#12161D] border border-white/10 rounded-[28px] p-6 sm:p-8 min-h-[360px] shadow-2xl relative overflow-hidden flex flex-col justify-between"
            aria-live="polite"
          >
            {/* Window bar */}
            <div>
              <div className="flex items-center gap-2 mb-6" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A303B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A303B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A303B]" />
              </div>

              {/* Lab Values List */}
              <div className="space-y-2.5 mb-6">
                {MARKETING_CONTENT.demo.labValues.map((metric, idx) => {
                  const isVisible = visibleIndices.includes(idx);
                  return (
                    <div
                      key={metric.name}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#1A1F28] text-sm transition-all duration-500 ${
                        isVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-3 pointer-events-none"
                      }`}
                    >
                      <span className="font-mono text-[#C9CFD9]">
                        {metric.name} {metric.value}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          metric.variant === "amber"
                            ? "bg-[#FFB86B]/15 text-[#FFB86B]"
                            : "bg-[#5EE1D2]/15 text-[#5EE1D2]"
                        }`}
                      >
                        {metric.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation Stream Area */}
            <div className="min-h-[110px] text-sm sm:text-base text-[#C9CFD9] font-light leading-[1.65] pt-4 border-t border-white/5">
              {streamedText ? (
                <span>
                  {renderFormattedExplanation(streamedText)}
                  {isStreaming && (
                    <span
                      className="inline-block w-1.5 h-4 ml-1 bg-[#5EE1D2] animate-[pulse_1s_infinite] align-middle"
                      aria-hidden="true"
                    />
                  )}
                </span>
              ) : (
                <span className="text-[#8B93A1] italic font-normal">
                  Click &ldquo;Analyze sample report&rdquo; to see the clinical explainer in action.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
