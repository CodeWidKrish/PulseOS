import React from "react";

/**
 * A short ECG trace that sweeps while work is in progress (streaming, loading).
 * Functional status indicator, not decoration (DESIGN anti-pattern 12).
 */
export function EcgLine({ className = "", label = "Working" }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={`h-6 w-28 text-teal ${className}`}
      role="img"
      aria-label={label}
      fill="none"
    >
      <path
        d="M0 12h30l4-7 5 14 5-17 4 10h12l3-3 3 3h54"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="ecg-trace"
        d="M0 12h30l4-7 5 14 5-17 4 10h12l3-3 3 3h54"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
      />
    </svg>
  );
}
