"use client";

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#07090D] text-[#F2F4F7] text-center select-none">
      <div className="max-w-md space-y-6">
        {/* Calm Pulse Dot */}
        <div className="w-16 h-16 mx-auto rounded-full bg-[#5EE1D2]/10 border border-[#5EE1D2]/30 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(94,225,210,0.2)]">
          <span className="w-4 h-4 rounded-full bg-[#5EE1D2]" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-[#5EE1D2] tracking-widest uppercase">
            404 · Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F4F7] mt-2">
            This route is off the clinical path
          </h1>
          <p className="text-sm text-[#8B93A1] mt-3 leading-relaxed text-pretty-body">
            The page you are looking for has either moved or does not exist. Let&rsquo;s get you back to safe ground.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#F2F4F7] text-[#07090D] hover:bg-white transition-all shadow-md hover:scale-[1.02]"
          >
            Return to Homepage
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-medium border border-white/15 text-[#F2F4F7] hover:bg-white/[0.08] transition-all"
          >
            Go to Patient Dashboard
          </Link>
        </div>

        <p className="text-xs text-[#8B93A1]/70 pt-8">
          PulseOS · Clinical clarity in plain language
        </p>
      </div>
    </div>
  );
}
