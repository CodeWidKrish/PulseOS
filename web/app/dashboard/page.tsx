"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { HealthRing } from "@/components/app/health-ring";
import { TrendChart } from "@/components/app/trend-chart";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon, type IconName } from "@/components/ui/icon";
import { CountUp, Stagger, StaggerItem } from "@/components/ui/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Appointment, type ReportListItem, type Vital, type VitalSummary, type VitalType } from "@/lib/api";
import { REPORT_STATUS_LABEL, formatDate, formatDateTime } from "@/lib/format";
import { useSessionUser } from "@/lib/session";
import { VITAL_META } from "@/lib/vitals";

type Range = "7d" | "30d";

interface DashboardData {
  reports: ReportListItem[];
  summary: VitalSummary[];
  /** Confirmed, future appointments sorted soonest first. */
  upcoming: Appointment[];
  greeting: string;
  /** Whole days until the next appointment, computed at load time. */
  daysToNext: number | null;
}

const STATUS_CHIP: Record<ReportListItem["status"], "normal" | "caution" | "alert" | "neutral"> = {
  done: "normal",
  pending: "neutral",
  processing: "caution",
  error: "alert",
};

const TREND_ICON: Record<VitalSummary["trend"], IconName> = { up: "trendUp", down: "trendDown", stable: "minus" };

function scoreLabel(score: number): string {
  if (score >= 80) return "Mostly in range";
  if (score >= 60) return "A few readings to watch";
  return "Worth discussing with a doctor";
}

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  return (
    <AppShell>
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
        const now = new Date();
        const upcoming = appointments
          .filter((a) => a.status === "confirmed" && a.slot && new Date(a.slot.starts_at) > now)
          .sort((a, b) => (a.slot?.starts_at ?? "").localeCompare(b.slot?.starts_at ?? ""));
        const next = upcoming[0]?.slot?.starts_at;
        const daysToNext = next ? Math.max(0, Math.ceil((new Date(next).getTime() - now.getTime()) / 86_400_000)) : null;
        if (!cancelled) setData({ reports, summary, upcoming, greeting: greetingFor(now.getHours()), daysToNext });
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load your overview.");
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

  const firstName = user.full_name.replace(/^Dr\.?\s+/i, "").split(" ")[0];
  const healthScore = data?.summary[0]?.health_score ?? null;
  const readingCount = data?.summary.reduce((n, s) => n + s.readings.length, 0) ?? 0;
  const hrSeries = heartRate[range];
  const hrLatest = hrSeries?.at(-1);
  const nextAppt = data?.upcoming[0] ?? null;
  const summaryFor = (t: VitalType) => data?.summary.find((s) => s.type === t);

  if (loadError) {
    return (
      <EmptyState
        tone="error"
        icon="alert"
        title="We couldn’t load your overview"
        description={loadError}
        action={
          <button type="button" onClick={() => window.location.reload()} className="btn-secondary">
            Try again
          </button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={data ? data.greeting : "Overview"}
        title={<>Welcome back, {firstName}</>}
        description="Your latest readings, reports and follow-ups — in one calm place."
        action={
          <Link href="/reports" className="btn-primary">
            <Icon name="upload" size={16} />
            Upload a lab report
          </Link>
        }
      />

      <Stagger className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Hero: health score (top-left = primary insight, DESIGN §3.4) */}
        <StaggerItem className="tile tile-interactive flex flex-col p-7 lg:col-span-5 lg:row-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg-muted">Health score</p>
            {healthScore !== null && (
              <Chip variant={healthScore >= 80 ? "normal" : "caution"} size="sm">
                {healthScore >= 80 ? "Steady" : "Watch"}
              </Chip>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 sm:flex-row sm:justify-start lg:flex-col lg:items-center">
            {data ? <HealthRing score={healthScore} size={168} /> : <Skeleton variant="circle" className="w-[168px]" />}
            <div className="text-center sm:text-left lg:text-center">
              <p className="text-xl font-semibold tracking-tight text-fg">
                {healthScore !== null ? scoreLabel(healthScore) : data ? "No vitals logged yet" : "Loading…"}
              </p>
              <p className="mt-1.5 text-sm text-fg-muted">
                {healthScore !== null
                  ? `From your latest vitals · ${readingCount} recent readings`
                  : "Log a few readings to see your score."}
              </p>
            </div>
          </div>

          <details className="group rounded-card-sm border border-line bg-hover px-4 py-3 text-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between text-fg-muted marker:hidden hover:text-fg">
              <span className="flex items-center gap-2">
                <Icon name="info" size={15} /> How is this calculated?
              </span>
              <Icon name="chevronRight" size={15} className="transition-transform duration-300 group-open:rotate-90" />
            </summary>
            <p className="mt-3 leading-relaxed text-fg-muted">
              A transparent rule, not an AI guess: heart rate, blood pressure and glucose each earn up to 25 points
              when your latest reading sits in its reference range, with points easing off the further it drifts.
            </p>
          </details>
        </StaggerItem>

        {/* Heart rate trend */}
        <StaggerItem className="tile tile-interactive p-7 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-fg-muted">
                <Icon name="heartPulse" size={16} className="text-pulse" /> Resting heart rate
              </p>
              <p className="mt-2 flex items-baseline gap-2">
                {hrLatest ? (
                  <CountUp value={hrLatest.value_1} decimals={hrLatest.value_1 % 1 ? 1 : 0} className="text-4xl font-semibold tracking-tight" />
                ) : (
                  <span className="text-4xl font-semibold">—</span>
                )}
                <span className="font-mono text-sm text-fg-muted">bpm</span>
              </p>
            </div>
            <Segmented
              size="sm"
              label="Heart rate range"
              value={range}
              onChange={setRange}
              options={[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
              ]}
            />
          </div>
          <div className="mt-4">
            {hrSeries === undefined ? (
              <Skeleton className="h-[180px] w-full" />
            ) : hrSeries.length > 1 ? (
              <TrendChart
                key={range}
                data={hrSeries.map((v) => ({ t: v.recorded_at, v: v.value_1 }))}
                band={[60, 100]}
                unit="bpm"
                height={180}
              />
            ) : (
              <p className="grid h-[180px] place-items-center text-sm text-fg-muted">Not enough readings in this period yet.</p>
            )}
          </div>
        </StaggerItem>

        {/* Quick vitals */}
        {(["bp", "glucose"] as const).map((type) => {
          const meta = VITAL_META.find((m) => m.type === type);
          const s = summaryFor(type);
          const latest = s?.readings.at(-1);
          return (
            <StaggerItem key={type} className="tile tile-interactive p-6 lg:col-span-2">
              <p className="flex items-center gap-2 text-sm font-medium text-fg-muted">
                <Icon name={type === "bp" ? "gauge" : "droplet"} size={16} className="text-teal" />
                {type === "bp" ? "Blood pressure" : "Glucose"}
              </p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
                {latest ? (type === "bp" ? `${Math.round(latest.value_1)}/${Math.round(latest.value_2 ?? 0)}` : latest.value_1) : "—"}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-fg-muted">
                <span className="font-mono">{meta?.unit}</span>
                {s && (
                  <>
                    <span aria-hidden="true">·</span>
                    <Icon name={TREND_ICON[s.trend]} size={13} />
                    <span>{s.trend === "stable" ? "Stable" : s.trend === "up" ? "Rising" : "Falling"}</span>
                  </>
                )}
              </p>
            </StaggerItem>
          );
        })}

        {/* Next appointment */}
        <StaggerItem className="tile tile-interactive flex flex-col justify-between p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-fg-muted">
              <Icon name="calendar" size={16} className="text-amber" /> Next visit
            </p>
            {data?.daysToNext != null && (
              <span className="font-mono text-xs text-amber">
                {data.daysToNext === 0 ? "Today" : data.daysToNext === 1 ? "Tomorrow" : `In ${data.daysToNext} days`}
              </span>
            )}
          </div>
          {nextAppt ? (
            <div className="mt-4">
              <p className="font-semibold leading-snug text-fg">{nextAppt.doctor?.name}</p>
              {nextAppt.slot && <p className="mt-1 font-mono text-xs text-fg-muted">{formatDateTime(nextAppt.slot.starts_at)}</p>}
            </div>
          ) : (
            <p className="mt-4 text-sm text-fg-muted">{data ? "Nothing booked yet." : "Loading…"}</p>
          )}
          <Link href="/appointments" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
            {nextAppt ? "Manage" : "Book a visit"} <Icon name="arrowRight" size={14} />
          </Link>
        </StaggerItem>

        {/* Recent reports */}
        <StaggerItem className="tile p-6 sm:p-7 lg:col-span-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Recent lab reports</h2>
            <Link href="/reports" className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline">
              View all <Icon name="arrowRight" size={14} />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {!data &&
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-[92px]" />)}
            {data && data.reports.length === 0 && (
              <p className="text-sm text-fg-muted md:col-span-3">
                No reports yet —{" "}
                <Link href="/reports" className="text-teal hover:underline">
                  upload your first one
                </Link>
                .
              </p>
            )}
            {data?.reports.slice(0, 3).map((rep) => (
              <Link
                key={rep.id}
                href={`/reports/${rep.id}`}
                className="group rounded-card-sm border border-line bg-hover p-4 transition-colors hover:border-line-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-fg-muted group-hover:text-teal">
                    <Icon name="report" size={17} />
                  </span>
                  <Chip variant={STATUS_CHIP[rep.status]} size="sm">
                    {REPORT_STATUS_LABEL[rep.status]}
                  </Chip>
                </div>
                <p className="mt-3 truncate text-sm font-medium text-fg">{rep.filename}</p>
                <p className="mt-0.5 font-mono text-xs text-fg-muted">{formatDate(rep.created_at)}</p>
              </Link>
            ))}
          </div>
        </StaggerItem>
      </Stagger>

      <p className="mt-10 text-center text-xs text-fg-muted">
        PulseOS explains information and does not provide medical advice.
      </p>
    </>
  );
}
