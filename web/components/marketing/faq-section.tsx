"use client";

import React, { useState } from "react";
import { MARKETING_CONTENT } from "@/lib/content";

export function FAQSection() {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleItem = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section
      id="faq"
      className="relative z-20 py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-[#F4F5F7] text-[#0B0F15] transition-colors"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-[820px] mx-auto">
        <h2 className="font-semibold tracking-[-0.035em] text-3xl sm:text-4xl md:text-5xl text-[#0B0F15]">
          {MARKETING_CONTENT.faq.heading}
        </h2>

        <div className="mt-10 divide-y divide-[#DADCE1]">
          {MARKETING_CONTENT.faq.items.map((item, idx) => {
            const isOpen = openIndices.includes(idx);
            const questionId = `faq-q-${idx}`;
            const answerId = `faq-a-${idx}`;

            return (
              <div key={idx} className="py-5 transition-colors">
                <h3>
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggleItem(idx)}
                    className="w-full flex items-center justify-between text-left text-base sm:text-lg font-medium cursor-pointer select-none text-[#0B0F15] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] rounded-lg py-1 px-1 -mx-1"
                  >
                    <span>{item.question}</span>
                    <span
                      className={`ml-4 flex-none text-xl font-light text-[#5B6270] transition-transform duration-300 ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  className={`grid transition-all duration-300 ease-out overflow-hidden ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm sm:text-base text-[#5A6270] font-light leading-[1.65] max-w-[62ch]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
