"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { api, type Appointment, type ReportListItem, type Vital, type VitalSummary } from "@/lib/api";
import { REPORT_STATUS_LABEL, REPORT_STATUS_TONE, formatDate, formatDateTime } from "@/lib/format";
import { useSessionUser } from "@/lib/session";
import { sparklinePath } from "@/lib/vitals";

type Range = "7d" | "30d";

interface DashboardData {
  reports: ReportListItem[];
  summary: VitalSummary[];
  /** Confirmed, future appointments sorted soonest first. */
  upcoming: Appointment[];
}

const RING_CIRCUMFERENCE = 264;

function scoreLabel(score: number): string {
  if (score >= 80) return "Mostly in range";
  if (score >= 60) return "Some readings to watch";
  return "Worth discussing with a doctor";
}

function daysUntil(iso: string): string {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Today";
  return days === 1 ? "Tomorrow" : `In ${days} days`;
}

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const user = useSessionUser();
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [heartRate, setHeartRate] = useState<Record<Range, Vital[] | undefined>>({ "7d": undefined, "30d": undefined });
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.reports.list(), api.vitals.summary(), api.appointments.list()])
      .then(([reports, summary, appointments]) => {
        const now = Date.now();
        const upcoming = appointments
          .filter((a) => a.status === "confirmed" && a.slot && new Date(a.slot.starts_at).getTime() > now)
          .sort((a, b) => (a.slot?.starts_at ?? "").localeCompare(b.slot?.starts_at ?? ""));
        if (!cancelled) setData({ reports, summary, upcoming });
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load your dashboard.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.vitals
      .list(range, "heart_rate")
      .then((rows) => {
        if (!cancelled) setHeartRate((prev) => ({ ...prev, [range]: rows }));
      })
      .catch(() => {
        if (!cancelled) setHeartRate((prev) => ({ ...prev, [range]: [] }));
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const healthScore = data?.summary[0]?.health_score ?? null;
  const vitalCount = data?.summary.reduce((n, s) => n + s.readings.length, 0) ?? 0;
  const hrSeries = heartRate[range];
  const hrLatest = hrSeries?.at(-1);
  const hrAvg = hrSeries?.length ? Math.round(hrSeries.reduce((s, v) => s + v.value_1, 0) / hrSeries.length) : null;
  const nextAppt = data?.upcoming[0] ?? null;
  const recentReports = data?.reports.slice(0, 3) ?? [];
  const firstName = user.full_name.replace(/^Dr\.?\s+/i, "").split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <span className="text-xs font-mono text-[#5EE1D2] uppercase tracking-wider">Your Health Overview</span>
          <h1 className="text-3xl font-semibold tracking-tight text-[#F2F4F7] mt-1">Welcome back, {firstName}</h1>
          <p className="text-sm text-[#8B93A1] mt-1">
            Track your trends and upcoming follow-ups in one calm place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#FF4D5E] text-white hover:bg-[#ff3b4e] transition-all hover:scale-[1.02] shadow-lg shadow-[#FF4D5E]/20"
          >
            <span>+</span>
            <span>Upload New Lab Report</span>
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="p-6 rounded-[28px] bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-center text-sm text-[#F2F4F7]" role="alert">
          {loadError}
        </div>
      )}

      {/* Top 3 Metric Tiles (Bento Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tile 1: Health Score */}
        <SpotlightCard className="p-6 bg-[#12161D]/90 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8B93A1] uppercase tracking-wider">Health Score</span>
          </div>

          <div className="flex items-center gap-5 my-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
                {healthScore !== null && (
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke={healthScore >= 80 ? "#5EE1D2" : "#FFB86B"}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - healthScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-[#F2F4F7]">{healthScore ?? "—"}</span>
                <span className="text-[10px] text-[#8B93A1]">/100</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#F2F4F7]">
                {healthScore !== null ? scoreLabel(healthScore) : data ? "No vitals yet" : "Loading…"}
              </p>
              <p className="text-xs text-[#8B93A1] mt-1 leading-relaxed">
                {healthScore !== null
                  ? `Rule-based score from your latest vitals (${vitalCount} recent readings).`
                  : "Log a few vitals to see your score."}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/6 text-xs flex items-center justify-between">
            <Link href="/vitals" className="text-[#5EE1D2] hover:underline">
              Log vitals →
            </Link>
          </div>
        </SpotlightCard>

        {/* Tile 2: Resting Heart Rate */}
        <SpotlightCard className="p-6 bg-[#12161D]/90 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8B93A1] uppercase tracking-wider">Resting Heart Rate</span>
            <div className="flex bg-black/40 p-0.5 rounded-full text-[11px]" role="group" aria-label="Time range">
              {(["7d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={range === r}
                  onClick={() => setRange(r)}
                  className={`px-2.5 py-0.5 rounded-full transition-colors ${
                    range === r ? "bg-[#5EE1D2] text-[#07090D] font-bold" : "text-[#8B93A1]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono text-[#F2F4F7] tabular-nums">{hrLatest?.value_1 ?? "—"}</span>
              <span className="text-xs font-mono text-[#8B93A1]">BPM</span>
              {hrAvg !== null && <span className="text-xs text-[#8B93A1] ml-2">avg {hrAvg}</span>}
            </div>

            <div className="mt-3 h-12 w-full">
              {hrSeries && hrSeries.length > 0 ? (
                <svg viewBox="0 0 300 50" className="w-full h-full overflow-visible" role="img" aria-label="Heart rate trend">
                  <path
                    d={sparklinePath(hrSeries.map((v) => v.value_1))}
                    fill="none"
                    stroke="#5EE1D2"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <p className="text-xs text-[#8B93A1]">{hrSeries ? "No heart-rate readings in this period." : ""}</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/6 text-xs text-[#8B93A1] flex items-center justify-between">
            <span>{hrSeries?.length ?? 0} readings</span>
            <Link href="/vitals" className="text-[#5EE1D2] hover:underline">
              All vitals →
            </Link>
          </div>
        </SpotlightCard>

        {/* Tile 3: Upcoming Appointment */}
        <SpotlightCard className="p-6 bg-[#12161D]/90 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8B93A1] uppercase tracking-wider">Next Appointment</span>
            {nextAppt?.slot && (
              <span className="text-xs font-mono text-[#FFB86B] bg-[#FFB86B]/10 px-2 py-0.5 rounded-full">
                {daysUntil(nextAppt.slot.starts_at)}
              </span>
            )}
          </div>

          <div className="my-3 space-y-1.5">
            {nextAppt ? (
              <>
                <p className="text-lg font-semibold text-[#F2F4F7]">{nextAppt.doctor?.name}</p>
                <p className="text-xs text-[#8B93A1]">{nextAppt.doctor?.specialty}</p>
                {nextAppt.slot && (
                  <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/5">
                    <p className="text-xs text-[#F2F4F7] font-medium">{formatDateTime(nextAppt.slot.starts_at)}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[#8B93A1]">{data ? "Nothing booked yet." : "Loading…"}</p>
            )}
          </div>

          <div className="pt-3 border-t border-white/6 text-xs flex items-center justify-between">
            <Link href="/appointments" className="text-[#5EE1D2] hover:underline">
              {nextAppt ? "Manage appointment →" : "Book a physician →"}
            </Link>
          </div>
        </SpotlightCard>
      </div>

      {/* Recent Reports */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#12161D]/80 border border-white/8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#F2F4F7]">Recent Lab Reports</h2>
            <p className="text-xs text-[#8B93A1] mt-0.5">
              Every value translated into plain language with physician discussion points.
            </p>
          </div>
          <Link href="/reports" className="text-xs font-medium text-[#5EE1D2] hover:underline flex items-center gap-1">
            View all reports ({data?.reports.length ?? 0}) →
          </Link>
        </div>

        <div className="space-y-3">
          {data && recentReports.length === 0 && (
            <p className="text-sm text-[#8B93A1]">
              No reports yet.{" "}
              <Link href="/reports" className="text-[#5EE1D2] hover:underline">
                Upload your first one
              </Link>
              .
            </p>
          )}
          {recentReports.map((rep) => (
            <Link
              key={rep.id}
              href={`/reports/${rep.id}`}
              className="block p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/6 hover:border-white/15 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm sm:text-base text-[#F2F4F7] group-hover:text-[#5EE1D2] transition-colors truncate">
                    {rep.filename}
                  </span>
                  <span className="text-xs text-[#8B93A1]">·</span>
                  <span className="text-xs font-mono text-[#8B93A1] shrink-0">{formatDate(rep.created_at)}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${REPORT_STATUS_TONE[rep.status]}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {REPORT_STATUS_LABEL[rep.status]}
                  </span>
                  <span className="text-xs text-[#8B93A1] group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 text-center text-xs text-[#8B93A1]">
        PulseOS explains information and does not provide medical advice. Consult your doctor for medical decisions.
      </div>
    </div>
  );
}
