import React from "react";
import { MARKETING_CONTENT } from "@/lib/content";

export function SecuritySection() {
  return (
    <section
      id="security"
      className="relative z-20 py-24 sm:py-32 px-4 sm:px-8 lg:px-12 bg-transparent border-t border-white/6"
      aria-label="Security and Privacy"
    >
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-semibold tracking-[-0.035em] text-3xl sm:text-4xl md:text-5xl text-[#F2F4F7]">
          {MARKETING_CONTENT.security.heading}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-10">
          {MARKETING_CONTENT.security.features.map((item) => (
            <div
              key={item.title}
              className="bg-[#12161D] border border-white/10 rounded-[24px] p-7 transition-all duration-300 hover:border-white/20 hover:shadow-xl"
            >
              <h3 className="font-semibold text-lg sm:text-xl tracking-tight text-[#F2F4F7] mb-2.5">
                {item.title}
              </h3>
              <p className="text-[#8B93A1] font-light text-sm sm:text-base leading-[1.6]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
