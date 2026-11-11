"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error cleanly without dumping full patient context
    console.error("PulseOS Client Error caught by boundary:", error.message);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#07090D] text-[#F2F4F7] text-center select-none">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(255,77,94,0.2)]">
          <span className="w-4 h-4 rounded-full bg-[#FF4D5E]" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-[#FF4D5E] tracking-widest uppercase">
            Clinical Recovery State
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F2F4F7] mt-2">
            Something interrupted the display
          </h1>
          <p className="text-sm text-[#8B93A1] mt-3 leading-relaxed text-pretty-body">
            A temporary client exception occurred while preparing this view. Your health records and stored data remain completely safe.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button onClick={() => reset()} size="md" variant="primary">
            Try Loading Again
          </Button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium border border-white/15 text-[#F2F4F7] hover:bg-white/[0.08] transition-all"
          >
            Return to Safety
          </Link>
        </div>

        <p className="text-xs text-[#8B93A1]/70 pt-8">
          PulseOS · Resilient health intelligence
        </p>
      </div>
    </div>
  );
}
