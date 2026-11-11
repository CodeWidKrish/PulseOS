"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { api, streamExplanation, type Report, type ReportValue } from "@/lib/api";
import { REPORT_STATUS_LABEL, formatDate } from "@/lib/format";

const STATUS_LABEL: Record<ReportValue["status"], string> = {
  normal: "Normal",
  high: "High",
  low: "Low",
};

function formatRange(v: ReportValue): string {
  if (v.ref_low === null && v.ref_high === null) return "—";
  if (v.ref_low === null) return `< ${v.ref_high}`;
  if (v.ref_high === null) return `> ${v.ref_low}`;
  return `${v.ref_low} – ${v.ref_high}`;
}

/** Splits the model's plain-text answer into paragraphs; strips markdown emphasis markers. */
function toParagraphs(text: string): string[] {
  return text
    .replace(/\*\*/g, "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = params.id;
  const [report, setReport] = useState<Report | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"table" | "explainer">("table");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setReport(await api.reports.get(reportId));
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load this report.");
    }
  }, [reportId]);

  useEffect(() => {
    let cancelled = false;
    api.reports
      .get(reportId)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load this report.");
      });
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [reportId]);

  const handleExplain = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    setStreamedText("");
    setActiveTab("explainer");

    await streamExplanation(
      reportId,
      {
        onToken: (token) => setStreamedText((prev) => prev + token),
        onDone: () => toast.success("Explanation complete."),
        onError: (message) => toast.error(message || "The explanation could not be generated."),
      },
      controller.signal,
    );
    if (!controller.signal.aborted) {
      setIsStreaming(false);
      await loadReport();
    }
  };

  const savedText = report?.explanation?.details.full_text ?? report?.explanation?.summary ?? "";
  const explanationText = streamedText || savedText;
  const values = report?.values ?? [];
  const flagged = values.filter((v) => v.status !== "normal").length;
  const hasExplanation = Boolean(report?.explanation);

  return (
    <AppShell title="Report Details">
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
          <div className="min-w-0">
            <Link href="/reports" className="text-xs text-[#8B93A1] hover:text-[#5EE1D2] flex items-center gap-1 mb-2">
              ← Back to Lab Reports
            </Link>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F2F4F7] break-all">
              {report?.filename ?? (loadError ? "Report unavailable" : "Loading report…")}
            </h1>
            {report && (
              <p className="text-xs font-mono text-[#8B93A1] mt-1">
                Uploaded {formatDate(report.created_at)} · {REPORT_STATUS_LABEL[report.status]}
              </p>
            )}
          </div>

          {report && !hasExplanation && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => void handleExplain()}
                size="md"
                variant="primary"
                isLoading={isStreaming}
                disabled={isStreaming}
                className="bg-[#5EE1D2] text-[#07090D] hover:bg-[#5EE1D2]/90 shadow-md shadow-[#5EE1D2]/20"
              >
                {isStreaming ? "Streaming Explanation..." : "Explain My Report"}
              </Button>
            </div>
          )}
        </div>

        {loadError && (
          <div className="p-8 rounded-[28px] bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-center space-y-4" role="alert">
            <h2 className="text-lg font-semibold text-[#F2F4F7]">We couldn&rsquo;t load this report</h2>
            <p className="text-xs text-[#8B93A1] max-w-sm mx-auto">{loadError}</p>
            <Button onClick={() => void loadReport()} size="sm" variant="primary">
              Try again
            </Button>
          </div>
        )}

        {report && (
          <>
            {/* Mobile Tab Switcher (< 1024px) */}
            <div className="lg:hidden flex p-1 bg-[#12161D] rounded-full border border-white/10 text-xs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "table"}
                onClick={() => setActiveTab("table")}
                className={`flex-1 py-2 rounded-full font-semibold transition-all ${
                  activeTab === "table" ? "bg-[#5EE1D2] text-[#07090D] shadow" : "text-[#8B93A1]"
                }`}
              >
                Biomarker Values ({values.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "explainer"}
                onClick={() => setActiveTab("explainer")}
                className={`flex-1 py-2 rounded-full font-semibold transition-all ${
                  activeTab === "explainer" ? "bg-[#5EE1D2] text-[#07090D] shadow" : "text-[#8B93A1]"
                }`}
              >
                Plain Explanation
              </button>
            </div>

            {/* 60/40 Split Grid on Desktop (>= 1024px) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Structured Biomarker Table */}
              <div className={`lg:col-span-7 space-y-4 ${activeTab === "table" ? "block" : "hidden lg:block"}`}>
                <div className="rounded-[28px] bg-[#12161D]/80 border border-white/8 overflow-hidden">
                  <div className="p-5 border-b border-white/8 bg-[#0B0D12] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#8B93A1] uppercase tracking-wider">
                      Extracted Biomarker Panel
                    </span>
                    {values.length > 0 && (
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                          flagged > 0 ? "text-[#FFB86B] bg-[#FFB86B]/10" : "text-[#5EE1D2] bg-[#5EE1D2]/10"
                        }`}
                      >
                        {flagged > 0 ? `${flagged} out-of-range flag${flagged > 1 ? "s" : ""}` : "All in range"}
                      </span>
                    )}
                  </div>

                  {values.length === 0 ? (
                    <p className="p-6 text-sm text-[#8B93A1]">
                      {report.status === "pending"
                        ? "Values are extracted when you run “Explain My Report”."
                        : "No structured lab values could be read from this file. Try a clearer digital PDF."}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-black/20 text-[#8B93A1] text-xs font-mono uppercase tracking-wider border-b border-white/5">
                          <tr>
                            <th scope="col" className="py-3.5 px-5">Biomarker</th>
                            <th scope="col" className="py-3.5 px-5">Value</th>
                            <th scope="col" className="py-3.5 px-5">Reference Range</th>
                            <th scope="col" className="py-3.5 px-5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {values.map((bm) => {
                            const abnormal = bm.status !== "normal";
                            return (
                              <tr
                                key={bm.id}
                                className={`hover:bg-white/[0.04] transition-colors ${abnormal ? "bg-[#FF4D5E]/[0.05]" : ""}`}
                              >
                                <td className="py-3.5 px-5 font-medium text-[#F2F4F7]">{bm.test_name}</td>
                                <td className="py-3.5 px-5 font-mono text-[#F2F4F7]">
                                  <span className="font-bold">{bm.value ?? "—"}</span>{" "}
                                  <span className="text-xs text-[#8B93A1]">{bm.unit}</span>
                                </td>
                                <td className="py-3.5 px-5 font-mono text-xs text-[#8B93A1]">
                                  {formatRange(bm)} {bm.unit}
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                      abnormal
                                        ? "bg-[#FFB86B]/20 text-[#FFB86B] border border-[#FFB86B]/40"
                                        : "bg-[#5EE1D2]/15 text-[#5EE1D2] border border-[#5EE1D2]/30"
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {STATUS_LABEL[bm.status]}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Plain-Language Streaming Explainer */}
              <div className={`lg:col-span-5 space-y-4 ${activeTab === "explainer" ? "block" : "hidden lg:block"}`}>
                <SpotlightCard
                  className="p-6 sm:p-7 bg-[#12161D]/90 backdrop-blur-md border border-white/10 space-y-5"
                  spotlightColor="rgba(94, 225, 210, 0.15)"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/8">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#5EE1D2] shadow-[0_0_8px_#5EE1D2]" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5EE1D2]">
                        PulseOS AI Explainer
                      </span>
                    </div>
                    {isStreaming && (
                      <span className="text-xs font-mono text-[#5EE1D2] animate-pulse">Streaming...</span>
                    )}
                  </div>

                  <div className="space-y-4 text-sm text-[#C9CFD9] leading-relaxed" aria-live="polite" aria-busy={isStreaming}>
                    {explanationText ? (
                      toParagraphs(explanationText).map((para, idx) => (
                        <p key={idx} className="whitespace-pre-line">
                          {para}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-[#8B93A1] italic">
                        {isStreaming
                          ? "Reading your values…"
                          : "Click “Explain My Report” to generate plain-language insights."}
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-[#8B93A1] border-t border-white/8 pt-3">
                    PulseOS explains information and does not provide medical advice.
                  </p>

                  {/* Physician Next Action */}
                  <div className="pt-1 space-y-2">
                    <p className="text-xs font-medium text-[#8B93A1]">Ready to consult your physician?</p>
                    <Link
                      href="/appointments"
                      className="block w-full py-2.5 px-4 text-center rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-[#F2F4F7] border border-white/10 transition-colors"
                    >
                      Book an appointment →
                    </Link>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </>
        )}

        {/* Prominent Medical Notice */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 text-center text-xs text-[#8B93A1]">
          PulseOS explains diagnostic information and does not provide medical diagnoses or prescribe treatment.
        </div>
      </div>
    </AppShell>
  );
}
