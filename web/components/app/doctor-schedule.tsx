"use client";

import React, { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type DoctorScheduleItem, type User } from "@/lib/api";
import { formatTime } from "@/lib/format";
import { initialsOf } from "@/lib/session";

const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

interface ScheduleState {
  items: DoctorScheduleItem[];
  /** Local calendar day key of "today", computed when the data loads. */
  todayKey: string;
}

/** Physician view: confirmed visits grouped by day, soonest first. */
export function DoctorSchedule({ user }: { user: User }) {
  const [state, setState] = useState<ScheduleState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.appointments
      .schedule()
      .then((items) => {
        if (cancelled) return;
        const now = Date.now();
        setState({
          items: items.filter((i) => new Date(i.slot.ends_at).getTime() > now),
          todayKey: new Date(now).toDateString(),
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your schedule.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const days = useMemo(() => {
    const groups = new Map<string, DoctorScheduleItem[]>();
    for (const item of state?.items ?? []) {
      const key = new Date(item.slot.starts_at).toDateString();
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return Array.from(groups.entries());
  }, [state]);

  const todayCount = state ? state.items.filter((i) => new Date(i.slot.starts_at).toDateString() === state.todayKey).length : 0;
  const surname = user.full_name.replace(/,.*$/, "");

  return (
    <>
      <PageHeader
        eyebrow="Physician schedule"
        title={<>Welcome, {surname}</>}
        description="Your confirmed visits. Patients book these from their PulseOS app, usually with a printed visit sheet of questions."
      />

      {error && <EmptyState tone="error" icon="alert" title="We couldn’t load your schedule" description={error} />}

      {!error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-2 gap-6 lg:col-span-4 lg:grid-cols-1 lg:content-start">
            <div className="tile p-6">
              <p className="text-sm font-medium text-fg-muted">Today</p>
              <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">{state ? todayCount : "—"}</p>
              <p className="mt-1 text-xs text-fg-muted">visits</p>
            </div>
            <div className="tile p-6">
              <p className="text-sm font-medium text-fg-muted">Upcoming</p>
              <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">{state ? state.items.length : "—"}</p>
              <p className="mt-1 text-xs text-fg-muted">confirmed in total</p>
            </div>
          </div>

          <section className="tile p-6 sm:p-7 lg:col-span-8" aria-labelledby="schedule-heading">
            <h2 id="schedule-heading" className="text-lg font-semibold tracking-tight">
              Upcoming visits
            </h2>

            {!state && (
              <div className="mt-6 space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            )}

            {state && days.length === 0 && (
              <p className="mt-6 text-sm text-fg-muted">No upcoming visits yet. New bookings appear here automatically.</p>
            )}

            {days.length > 0 && (
              <Stagger className="mt-6 space-y-8" gap={0.05}>
                {days.map(([key, items]) => (
                  <StaggerItem key={key}>
                    <p className="mb-3 text-sm font-medium text-fg-muted">
                      {key === state?.todayKey ? "Today · " : ""}
                      {dayFmt.format(new Date(items[0].slot.starts_at))}
                    </p>
                    <ul className="space-y-2.5">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-center gap-4 rounded-card-sm border border-line bg-hover px-4 py-3">
                          <span className="w-20 shrink-0 font-mono text-sm tabular-nums text-fg">{formatTime(item.slot.starts_at)}</span>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-muted text-xs font-semibold text-teal">
                            {initialsOf(item.patient_name)}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium text-fg">{item.patient_name}</span>
                          <span className="hidden items-center gap-1.5 text-xs text-fg-muted sm:flex">
                            <Icon name="clock" size={14} />
                            {formatTime(item.slot.starts_at)}–{formatTime(item.slot.ends_at)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>
        </div>
      )}
    </>
  );
}
