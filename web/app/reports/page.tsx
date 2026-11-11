"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { api, type ReportListItem } from "@/lib/api";
import { REPORT_STATUS_LABEL, REPORT_STATUS_TONE, formatDate } from "@/lib/format";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/tiff"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    setIsUploading(true);
    try {
      const created = await api.reports.upload(file);
      setReports((prev) => [created, ...(prev ?? [])]);
      toast.success("Report uploaded. Open it to generate your explanation.");
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed. Please try again."));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openPicker = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void uploadFile(file);
  };

  return (
    <AppShell title="Lab Reports">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
          <div>
            <span className="text-xs font-mono text-[#5EE1D2] uppercase tracking-wider">
              Diagnostic Documents
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-[#F2F4F7] mt-1">
              Lab Reports Hub
            </h1>
            <p className="text-sm text-[#8B93A1] mt-1">
              Upload bloodwork, urinalysis, or metabolic panels to receive calm, plain-language insights.
            </p>
          </div>
        </div>

        {/* Upload Dropzone */}
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
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a lab report"
          aria-busy={isUploading}
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
          className={`border-2 border-dashed ${
            isDragging ? "border-[#5EE1D2]/70 bg-[#12161D]/90" : "border-white/15 bg-[#12161D]/60"
          } hover:border-[#5EE1D2]/50 hover:bg-[#12161D]/90 rounded-[28px] p-8 text-center cursor-pointer transition-all group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]`}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#5EE1D2]/10 border border-[#5EE1D2]/30 text-[#5EE1D2] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              {isUploading ? <span className="animate-spin text-base">⏳</span> : <span>↑</span>}
            </div>
            <div>
              <p className="font-semibold text-base text-[#F2F4F7]">
                {isUploading ? "Uploading securely..." : "Drop your lab report here or click to browse"}
              </p>
              <p className="text-xs text-[#8B93A1] mt-1">
                Supports PDF, JPG, PNG, TIFF up to 10 MB · Use sample or synthetic reports only
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {loadError && (
          <div className="p-8 rounded-[28px] bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-center space-y-4" role="alert">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FF4D5E]/20 text-[#FF4D5E] flex items-center justify-center text-xl">
              !
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#F2F4F7]">We couldn&rsquo;t load your reports</h2>
              <p className="text-xs text-[#8B93A1] mt-1 max-w-sm mx-auto">{loadError}</p>
            </div>
            <Button onClick={() => void loadReports()} size="sm" variant="primary">
              Try again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {!loadError && reports === null && (
          <div className="space-y-3" role="status" aria-label="Loading reports">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadError && reports !== null && reports.length === 0 && (
          <div className="p-12 rounded-[28px] bg-[#12161D]/60 border border-white/8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-white/10 text-[#8B93A1] flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#F2F4F7]">No lab reports uploaded yet</h2>
              <p className="text-sm text-[#8B93A1] mt-1 max-w-md mx-auto">
                Add your first lab report above to see plain-language explanations and physician questions.
              </p>
            </div>
            <Button onClick={openPicker} size="md" variant="primary">
              Upload a Report
            </Button>
          </div>
        )}

        {/* Data Table with Sorting & Responsive Cards */}
        {!loadError && sorted.length > 0 && (
          <div className="rounded-[28px] bg-[#12161D]/80 border border-white/8 overflow-hidden">
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0B0D12] text-[#8B93A1] text-xs font-mono uppercase tracking-wider sticky top-0 border-b border-white/8">
                  <tr>
                    <th scope="col" className="py-4 px-6 font-semibold" aria-sort={sortBy === "name" ? "ascending" : "none"}>
                      <button type="button" className="uppercase hover:text-white" onClick={() => setSortBy("name")}>
                        Report {sortBy === "name" ? "↓" : "↕"}
                      </button>
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold" aria-sort={sortBy === "date" ? "descending" : "none"}>
                      <button type="button" className="uppercase hover:text-white" onClick={() => setSortBy("date")}>
                        Uploaded {sortBy === "date" ? "↓" : "↕"}
                      </button>
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold">Status</th>
                    <th scope="col" className="py-4 px-6 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sorted.map((report) => (
                    <tr key={report.id} className="hover:bg-white/[0.04] transition-colors group">
                      <td className="py-4 px-6 font-medium text-[#F2F4F7]">
                        <Link href={`/reports/${report.id}`} className="hover:text-[#5EE1D2] transition-colors">
                          {report.filename}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-[#8B93A1] font-mono text-xs">{formatDate(report.created_at)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${REPORT_STATUS_TONE[report.status]}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {REPORT_STATUS_LABEL[report.status]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/reports/${report.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5EE1D2] hover:underline"
                        >
                          View Explainer →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout (< 768px) */}
            <div className="md:hidden p-4 space-y-3">
              {sorted.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="block p-4 rounded-2xl bg-white/[0.03] space-y-2 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-[#F2F4F7] break-all">{report.filename}</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${REPORT_STATUS_TONE[report.status]}`}
                    >
                      {REPORT_STATUS_LABEL[report.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#8B93A1] pt-1">
                    <span className="font-mono">{formatDate(report.created_at)}</span>
                    <span>View explainer →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
