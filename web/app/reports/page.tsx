"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/app/app-shell";
import { EcgLine } from "@/components/app/ecg-line";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { api, type ReportListItem } from "@/lib/api";
import { REPORT_STATUS_LABEL, formatDate } from "@/lib/format";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/tiff"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const STATUS_CHIP: Record<ReportListItem["status"], "normal" | "caution" | "alert" | "neutral"> = {
  done: "normal",
  pending: "neutral",
  processing: "caution",
  error: "alert",
};

const errorMessage = (err: unknown, fallback: string): string => (err instanceof Error ? err.message : fallback);

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReports = useCallback(async () => {
    setLoadError(null);
    try {
      setReports(await api.reports.list());
    } catch (err) {
      setLoadError(errorMessage(err, "Could not load your reports."));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.reports
      .list()
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err, "Could not load your reports."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    if (!reports) return [];
    return [...reports].sort((x, y) =>
      sortBy === "name" ? x.filename.localeCompare(y.filename) : y.created_at.localeCompare(x.created_at),
    );
  }, [reports, sortBy]);

  const uploadFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a PDF, JPG, PNG or TIFF file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("That file is larger than 10 MB.");
      return;
    }
    setUploadingName(file.name);
    try {
      const created = await api.reports.upload(file);
      setReports((prev) => [created, ...(prev ?? [])]);
      toast.success("Report uploaded. Open it to generate your explanation.");
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed. Please try again."));
    } finally {
      setUploadingName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openPicker = () => {
    if (!uploadingName) fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void uploadFile(file);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Lab reports"
        title="Your reports, in plain language"
        description="Upload a lab report and PulseOS lays out every value against its normal range, then explains what stands out."
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFile(file);
        }}
      />

      {/* Dropzone — the page's single primary action */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-label="Upload a lab report"
        aria-busy={Boolean(uploadingName)}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ scale: isDragging ? 1.01 : 1 }}
        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className={`group relative cursor-pointer overflow-hidden rounded-card border border-dashed p-10 text-center transition-colors duration-300 ${
          isDragging ? "border-teal bg-teal-muted" : "border-line-strong bg-surface/60 hover:border-teal/60"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(94,225,210,0.10), transparent 70%)" }}
          aria-hidden="true"
        />
        <AnimatePresence mode="wait" initial={false}>
          {uploadingName ? (
            <motion.div
              key="uploading"
              className="relative flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <EcgLine label="Uploading" className="h-8 w-40" />
              <p className="font-medium text-fg">Uploading securely…</p>
              <p className="max-w-xs truncate font-mono text-xs text-fg-muted">{uploadingName}</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="relative flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <span className="grid h-14 w-14 place-items-center rounded-full border border-teal/30 bg-teal-muted text-teal transition-transform duration-500 group-hover:-translate-y-1">
                <Icon name="upload" size={22} />
              </span>
              <p className="text-lg font-semibold tracking-tight text-fg">
                {isDragging ? "Drop to upload" : "Drop a lab report here, or click to browse"}
              </p>
              <p className="text-sm text-fg-muted">PDF, JPG, PNG or TIFF · up to 10 MB · sample or synthetic reports only</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <section className="mt-12" aria-labelledby="reports-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h2 id="reports-heading" className="text-lg font-semibold tracking-tight">
            All reports {reports && reports.length > 0 && <span className="ml-1 text-fg-muted">({reports.length})</span>}
          </h2>
          {reports && reports.length > 1 && (
            <Segmented
              size="sm"
              label="Sort reports"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "date", label: "Newest" },
                { value: "name", label: "Name" },
              ]}
            />
          )}
        </div>

        {loadError && (
          <EmptyState
            tone="error"
            icon="alert"
            title="We couldn’t load your reports"
            description={loadError}
            action={
              <button type="button" onClick={() => void loadReports()} className="btn-secondary">
                Try again
              </button>
            }
          />
        )}

        {!loadError && reports === null && (
          <div className="space-y-3" role="status" aria-label="Loading reports">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[76px] rounded-card-sm" />
            ))}
          </div>
        )}

        {!loadError && reports?.length === 0 && (
          <EmptyState
            icon="report"
            title="No lab reports yet"
            description="Upload your first report above to see each value explained, plus questions to bring to your doctor."
          />
        )}

        {!loadError && sorted.length > 0 && (
          <Stagger key={sortBy} className="space-y-3" gap={0.04}>
            {sorted.map((report) => (
              <StaggerItem key={report.id}>
                <Link
                  href={`/reports/${report.id}`}
                  className="tile tile-interactive group flex items-center gap-4 rounded-card-sm px-5 py-4"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-hover text-fg-muted transition-colors group-hover:text-teal">
                    <Icon name="report" size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">{report.filename}</p>
                    <p className="mt-0.5 font-mono text-xs text-fg-muted">Uploaded {formatDate(report.created_at)}</p>
                  </div>
                  <Chip variant={STATUS_CHIP[report.status]} size="sm" className="hidden sm:inline-flex">
                    {REPORT_STATUS_LABEL[report.status]}
                  </Chip>
                  <Icon
                    name="chevronRight"
                    size={18}
                    className="shrink-0 text-fg-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-fg"
                  />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </AppShell>
  );
}
