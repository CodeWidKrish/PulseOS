"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { api, type Vital, type VitalType } from "@/lib/api";
import { VITAL_META, formatVitalValue, isInRange, relativeTime, sparklinePath } from "@/lib/vitals";

type Range = "7d" | "30d";

/** Parses "72" or "120/80" into value_1/value_2. Returns null when the input is invalid. */
function parseReading(type: VitalType, raw: string): { value_1: number; value_2: number | null } | null {
  const parts = raw.split("/").map((p) => Number(p.trim()));
  if (parts.some((n) => !Number.isFinite(n) || n <= 0)) return null;
  if (type === "bp") return parts.length === 2 ? { value_1: parts[0], value_2: parts[1] } : null;
  return parts.length === 1 ? { value_1: parts[0], value_2: null } : null;
}

export default function VitalsPage() {
  const [range, setRange] = useState<Range>("7d");
  const [vitals, setVitals] = useState<Record<Range, Vital[] | undefined>>({ "7d": undefined, "30d": undefined });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<VitalType>("heart_rate");
  const [logValue, setLogValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.vitals
      .list(range)
      .then((data) => {
        if (!cancelled) {
          setVitals((prev) => ({ ...prev, [range]: data }));
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load your vitals.");
      });
    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  const readings = vitals[range];

  const handleLogVital = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseReading(selectedType, logValue);
    if (!parsed) {
      toast.error(selectedType === "bp" ? "Enter blood pressure as systolic/diastolic, e.g. 120/80." : "Enter a single positive number.");
      return;
    }
    setIsSaving(true);
    try {
      await api.vitals.create({ type: selectedType, ...parsed });
      toast.success("Reading saved.");
      setLogValue("");
      setModalOpen(false);
      setVitals({ "7d": undefined, "30d": undefined });
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the reading.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell title="Vitals Tracker">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
          <div>
            <span className="text-xs font-mono text-[#5EE1D2] uppercase tracking-wider">
              Biometric Logging & Trends
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-[#F2F4F7] mt-1">Vitals Tracker</h1>
            <p className="text-sm text-[#8B93A1] mt-1">
              Track heart rate, blood pressure, blood glucose, and body weight over time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 7d / 30d Segmented Toggle */}
            <div className="flex p-1 bg-[#12161D] rounded-full border border-white/10 text-xs font-medium" role="group" aria-label="Time range">
              {(["7d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={range === r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-full transition-all ${
                    range === r ? "bg-[#5EE1D2] text-[#07090D] font-bold" : "text-[#8B93A1] hover:text-[#F2F4F7]"
                  }`}
                >
                  {r === "7d" ? "7 Days" : "30 Days"}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setModalOpen(true)}
              size="md"
              variant="primary"
              className="bg-[#FF4D5E] text-white shadow-lg shadow-[#FF4D5E]/20"
            >
              + Log Vital Reading
            </Button>
          </div>
        </div>

        {loadError && (
          <div className="p-6 rounded-[28px] bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-center space-y-3" role="alert">
            <p className="text-sm text-[#F2F4F7]">{loadError}</p>
            <Button onClick={() => setReloadKey((k) => k + 1)} size="sm" variant="primary">
              Try again
            </Button>
          </div>
        )}

        {/* 4 Vitals Metric Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {VITAL_META.map((meta) => {
            const series = (readings ?? []).filter((v) => v.type === meta.type);
            const latest = series.at(-1);
            const avg1 = series.length ? series.reduce((s, v) => s + v.value_1, 0) / series.length : null;
            const avg2 =
              meta.type === "bp" && series.length
                ? series.reduce((s, v) => s + (v.value_2 ?? 0), 0) / series.length
                : null;
            const ok = latest ? isInRange(meta, latest) : true;
            const tone = ok
              ? "text-[#5EE1D2] bg-[#5EE1D2]/10 border-[#5EE1D2]/30"
              : "text-[#FFB86B] bg-[#FFB86B]/10 border-[#FFB86B]/30";

            return (
              <SpotlightCard
                key={meta.type}
                className="p-6 sm:p-8 bg-[#12161D]/85 backdrop-blur-md flex flex-col justify-between"
                spotlightColor="rgba(94, 225, 210, 0.12)"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#8B93A1] uppercase tracking-wider">{meta.name}</span>
                    {latest && meta.range && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tone}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ok ? "In range" : "Outside range"}
                      </span>
                    )}
                  </div>

                  {readings === undefined ? (
                    <div className="mt-4 h-28 rounded-xl bg-white/[0.04] animate-pulse" aria-hidden="true" />
                  ) : latest ? (
                    <>
                      <div className="mt-4 flex items-baseline gap-2 flex-wrap">
                        <span className="text-4xl font-bold font-mono text-[#F2F4F7] tracking-tight tabular-nums">
                          {formatVitalValue(latest)}
                        </span>
                        <span className="text-sm font-mono text-[#8B93A1]">{meta.unit}</span>
                        {avg1 !== null && (
                          <span className="text-xs text-[#8B93A1] ml-3">
                            {range} avg: {Math.round(avg1)}
                            {avg2 !== null ? ` / ${Math.round(avg2)}` : ""}
                          </span>
                        )}
                      </div>

                      <div className="mt-6 h-20 w-full">
                        <svg
                          viewBox="0 0 300 50"
                          className="w-full h-full overflow-visible"
                          role="img"
                          aria-label={`${meta.name} trend over ${series.length} readings`}
                        >
                          <path
                            d={sparklinePath(series.map((v) => v.value_1))}
                            fill="none"
                            stroke={ok ? "#5EE1D2" : "#FFB86B"}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <p className="mt-6 text-sm text-[#8B93A1]">No readings in this period yet.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/6 flex items-center justify-between text-xs text-[#8B93A1]">
                  <span>{series.length} reading{series.length === 1 ? "" : "s"}</span>
                  <span className="font-mono">{latest ? `Last logged: ${relativeTime(latest.recorded_at)}` : "—"}</span>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        <p className="text-xs text-[#8B93A1] text-center">
          Ranges are general reference bands for adults. PulseOS explains information and does not provide medical advice.
        </p>

        {/* Modal Dialog for Logging Vital Reading */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-vital-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") setModalOpen(false);
            }}
          >
            <div className="w-full max-w-md bg-[#12161D] border border-white/10 rounded-[28px] p-6 sm:p-8 space-y-6 animate-scaleUp">
              <div className="flex items-center justify-between pb-4 border-b border-white/8">
                <h2 id="log-vital-title" className="text-xl font-semibold text-[#F2F4F7]">
                  Log Vital Reading
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-[#8B93A1] hover:text-white"
                  aria-label="Close dialog"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleLogVital} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="vital-type" className="text-xs font-medium text-[#8B93A1] uppercase tracking-wider">
                    Select Measurement
                  </label>
                  <select
                    id="vital-type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as VitalType)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#0B0D12] text-sm text-[#F2F4F7] border border-white/10 outline-none focus:border-[#5EE1D2]"
                  >
                    {VITAL_META.map((m) => (
                      <option key={m.type} value={m.type}>
                        {m.name} ({m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vital-value" className="text-xs font-medium text-[#8B93A1] uppercase tracking-wider">
                    Measured Value
                  </label>
                  <input
                    id="vital-value"
                    type="text"
                    inputMode="decimal"
                    autoFocus
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    placeholder={selectedType === "bp" ? "e.g. 120/80" : "e.g. 72"}
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-[#0B0D12] text-sm text-[#F2F4F7] border border-white/10 outline-none focus:border-[#5EE1D2]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[#8B93A1] hover:text-white"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm" variant="primary" isLoading={isSaving}>
                    Save Reading
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
