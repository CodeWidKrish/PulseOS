"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/app/app-shell";
import { EcgLine } from "@/components/app/ecg-line";
import { RangeBar } from "@/components/app/range-bar";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { api, streamExplanation, type Report, type ReportValue } from "@/lib/api";
import { parseExplanation } from "@/lib/explanation";
import { REPORT_STATUS_LABEL, formatDate } from "@/lib/format";

const VALUE_CHIP: Record<ReportValue["status"], { variant: "normal" | "alert" | "caution"; label: string }> = {
  normal: { variant: "normal", label: "In range" },
  high: { variant: "alert", label: "High" },
  low: { variant: "caution", label: "Low" },
};

function formatRange(v: ReportValue): string {
  if (v.ref_low === null && v.ref_high === null) return "—";
  if (v.ref_low === null) return `< ${v.ref_high}`;
  if (v.ref_high === null) return `> ${v.ref_low}`;
  return `${v.ref_low}–${v.ref_high}`;
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = params.id;
  const [report, setReport] = useState<Report | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<"values" | "explanation">("values");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [copied, setCopied] = useState(false);
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
    setTab("explanation");

    await streamExplanation(
      reportId,
      {
        onToken: (token) => setStreamedText((prev) => prev + token),
        onDone: () => toast.success("Explanation ready."),
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
  const explanation = parseExplanation(streamedText || savedText);
  const hasExplanation = Boolean(report?.explanation) || (!isStreaming && streamedText.length > 0);
  const values = report?.values ?? [];
  const flagged = values.filter((v) => v.status !== "normal");

  const copyQuestions = async () => {
    try {
      await navigator.clipboard.writeText(explanation.questions.map((q, i) => `${i + 1}. ${q}`).join("\n"));
      setCopied(true);
      toast.success("Questions copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy isn’t available in this browser.");
    }
  };

  if (loadError) {
    return (
      <AppShell title="Report">
        <EmptyState
          tone="error"
          icon="alert"
          title="We couldn’t load this report"
          description={loadError}
          action={
            <button type="button" onClick={() => void loadReport()} className="btn-secondary">
              Try again
            </button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Report">
      <div className="no-print">
        {/* Header */}
        <header className="pb-8">
          <Link href="/reports" className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg">
            <Icon name="chevronLeft" size={16} /> All reports
          </Link>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              {report ? (
                <>
                  <h1 className="text-h2 break-words text-fg">{report.filename}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-fg-muted">
                    <span className="font-mono text-xs">Uploaded {formatDate(report.created_at)}</span>
                    <Chip variant={report.status === "done" ? "normal" : report.status === "error" ? "alert" : "neutral"} size="sm">
                      {REPORT_STATUS_LABEL[report.status]}
                    </Chip>
                  </div>
                </>
              ) : (
                <>
                  <Skeleton className="h-10 w-72" />
                  <Skeleton className="mt-3 h-5 w-48" />
                </>
              )}
            </div>
            {report && (
              <div className="flex flex-wrap items-center gap-3">
                {hasExplanation && explanation.questions.length > 0 && (
                  <button type="button" onClick={() => window.print()} className="btn-secondary">
                    <Icon name="printer" size={16} /> Print visit sheet
                  </button>
                )}
                {!report.explanation && (
                  <button type="button" onClick={() => void handleExplain()} disabled={isStreaming} className="btn-primary">
                    <Icon name="sparkles" size={16} />
                    {isStreaming ? "Explaining…" : "Explain my report"}
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Mobile tab switch */}
        <div className="mb-6 lg:hidden">
          <Segmented
            label="Report view"
            value={tab}
            onChange={setTab}
            options={[
              { value: "values", label: `Values (${values.length})` },
              { value: "explanation", label: "Explanation" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Values (60%) */}
          <section className={`lg:col-span-7 ${tab === "values" ? "block" : "hidden lg:block"}`} aria-labelledby="values-heading">
            <div className="tile p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="values-heading" className="text-lg font-semibold tracking-tight">
                  Your values
                </h2>
                {values.length > 0 && (
                  <Chip variant={flagged.length ? "caution" : "normal"} size="sm">
                    {flagged.length ? `${flagged.length} outside range` : "All in range"}
                  </Chip>
                )}
              </div>

              {!report && (
                <div className="mt-6 space-y-4">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              )}

              {report && values.length === 0 && (
                <div className="mt-6 rounded-card-sm border border-dashed border-line-strong px-6 py-10 text-center">
                  <Icon name="sparkles" size={22} className="mx-auto text-teal" />
                  <p className="mt-3 font-medium text-fg">
                    {report.status === "pending" ? "Values appear once you explain the report" : "No values could be read"}
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">
                    {report.status === "pending"
                      ? "PulseOS reads each result and its reference range, then lays them out here."
                      : "Try a clearer digital PDF so each value and its range can be read."}
                  </p>
                </div>
              )}

              {values.length > 0 && (
                <Stagger className="mt-6 divide-y divide-line" gap={0.05}>
                  {values.map((v) => {
                    const chip = VALUE_CHIP[v.status];
                    return (
                      <StaggerItem key={v.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium text-fg">{v.test_name}</p>
                            <p className="mt-0.5 font-mono text-xs text-fg-muted">
                              Range {formatRange(v)}&nbsp;{v.unit ?? ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <p className="text-right font-semibold tabular-nums text-fg">
                              {v.value ?? "—"}
                              <span className="ml-1 text-xs font-normal text-fg-muted">{v.unit}</span>
                            </p>
                            <Chip variant={chip.variant} size="sm" className="hidden sm:inline-flex">
                              {chip.label}
                            </Chip>
                          </div>
                        </div>
                        <div className="mt-3">
                          <RangeBar value={v.value} low={v.ref_low} high={v.ref_high} status={v.status} />
                        </div>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              )}
            </div>
          </section>

          {/* Explanation (40%) */}
          <section
            className={`lg:col-span-5 ${tab === "explanation" ? "block" : "hidden lg:block"}`}
            aria-labelledby="explain-heading"
          >
            <div className="tile overflow-hidden lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 id="explain-heading" className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="sparkles" size={16} className="text-teal" /> Plain-language explanation
                </h2>
                {isStreaming && <EcgLine label="Explaining" className="h-5 w-20" />}
              </div>

              <div className="space-y-4 px-6 py-6 text-[15px] leading-relaxed text-fg-muted" aria-live="polite" aria-busy={isStreaming}>
                <AnimatePresence>
                  {explanation.urgent && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 rounded-card-sm border border-amber/30 bg-amber-muted p-4 text-sm text-fg"
                      role="note"
                    >
                      <Icon name="alert" size={18} className="mt-0.5 shrink-0 text-amber" />
                      <p>
                        Some values may need prompt attention. Please contact your doctor or local urgent care soon.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {explanation.paragraphs.length === 0 && !isStreaming && (
                  <p className="text-sm">
                    {report?.explanation === null && values.length === 0
                      ? "Press “Explain my report” and PulseOS will read your values and explain what stands out — in plain words."
                      : "No explanation yet."}
                  </p>
                )}
                {explanation.paragraphs.length === 0 && isStreaming && <p className="stream-caret text-sm">Reading your values</p>}

                {explanation.paragraphs.map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`${i === 0 ? "text-fg" : ""} ${
                      isStreaming && i === explanation.paragraphs.length - 1 && explanation.questions.length === 0 ? "stream-caret" : ""
                    }`}
                  >
                    {para}
                  </motion.p>
                ))}
              </div>

              {explanation.questions.length > 0 && (
                <div className="border-t border-line px-6 py-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
                      <Icon name="stethoscope" size={16} className="text-teal" /> Questions for your doctor
                    </h3>
                    <button
                      type="button"
                      onClick={() => void copyQuestions()}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs text-fg-muted transition-colors hover:bg-hover hover:text-fg"
                    >
                      <Icon name={copied ? "check" : "copy"} size={14} /> {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <ol className="space-y-2.5">
                    {explanation.questions.map((q, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="flex gap-3 rounded-card-sm border border-line bg-hover p-3.5 text-sm text-fg"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-muted font-mono text-xs text-teal">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{q}</span>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="border-t border-line bg-hover px-6 py-4">
                <p className="text-xs text-fg-muted">PulseOS explains information and does not provide medical advice.</p>
                <Link href="/appointments" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
                  Book a doctor to talk it through <Icon name="arrowRight" size={14} />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Printable doctor visit sheet (shown only when printing) */}
      {report && (
        <section className="print-sheet" aria-hidden="true">
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Doctor visit sheet</h1>
          <p style={{ marginTop: 4, fontSize: 12 }}>
            {report.filename} · uploaded {formatDate(report.created_at)} · prepared with PulseOS (sample data)
          </p>
          {flagged.length > 0 && (
            <>
              <h2 style={{ marginTop: 20, fontSize: 15, fontWeight: 600 }}>Values outside the reference range</h2>
              <ul style={{ marginTop: 6, fontSize: 13, lineHeight: 1.7 }}>
                {flagged.map((v) => (
                  <li key={v.id}>
                    {v.test_name}: {v.value} {v.unit ?? ""} (range {formatRange(v)}) — {VALUE_CHIP[v.status].label}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h2 style={{ marginTop: 20, fontSize: 15, fontWeight: 600 }}>My questions</h2>
          <ol style={{ marginTop: 6, fontSize: 13, lineHeight: 1.9 }}>
            {explanation.questions.map((q, i) => (
              <li key={i}>
                {i + 1}. {q}
              </li>
            ))}
          </ol>
          <p style={{ marginTop: 24, fontSize: 11 }}>PulseOS explains information and does not provide medical advice.</p>
        </section>
      )}
    </AppShell>
  );
}
