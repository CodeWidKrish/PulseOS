import React from "react";
import { MARKETING_CONTENT } from "@/lib/content";

export function MarketingFooter() {
  return (
    <footer className="relative z-20 py-8 px-4 sm:px-8 lg:px-12 bg-[#07090D] border-t border-white/6 text-center text-xs text-[#8B93A1]">
      <div className="max-w-[1200px] mx-auto space-y-3">
        <p className="max-w-[70ch] mx-auto leading-relaxed text-[#8B93A1]">
          {MARKETING_CONTENT.footer.disclaimer}
        </p>
        <p className="text-[#8B93A1]">{MARKETING_CONTENT.footer.copyright}</p>
      </div>
    </footer>
  );
}
