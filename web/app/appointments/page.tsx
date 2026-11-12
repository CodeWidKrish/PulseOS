"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/app/app-shell";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ApiError, api, type Appointment, type Doctor, type Slot } from "@/lib/api";
import { formatDateTime, formatTime } from "@/lib/format";
import { initialsOf } from "@/lib/session";

const weekdayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const dayNumFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

const errorMessage = (err: unknown, fallback: string): string => (err instanceof Error ? err.message : fallback);

/** Builds a minimal .ics file so the visit can be added to any calendar app. */
function downloadIcs(appt: Appointment) {
  if (!appt.slot) return;
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PulseOS//Appointments//EN",
    "BEGIN:VEVENT",
    `UID:${appt.id}@pulseos`,
    `DTSTAMP:${stamp(appt.created_at)}`,
    `DTSTART:${stamp(appt.slot.starts_at)}`,
    `DTEND:${stamp(appt.slot.ends_at)}`,
    `SUMMARY:Doctor visit — ${appt.doctor?.name ?? "PulseOS"}`,
    "DESCRIPTION:Bring your PulseOS doctor visit sheet.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "pulseos-visit.ics";
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [justBooked, setJustBooked] = useState<Appointment | null>(null);

  const refreshAppointments = useCallback(async () => {
    try {
      setAppointments(await api.appointments.list());
    } catch (err) {
      toast.error(errorMessage(err, "Could not refresh your appointments."));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.doctors.list(), api.appointments.list()])
      .then(([docs, appts]) => {
        if (cancelled) return;
        setDoctors(docs);
        setAppointments(appts);
        setSelectedDocId((current) => current ?? docs[0]?.id ?? null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err, "Could not load physicians."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDocId) return;
    let cancelled = false;
    api.doctors
      .slots(selectedDocId)
      .then((data) => {
        if (cancelled) return;
        const now = Date.now();
        const upcoming = data.filter((s) => new Date(s.starts_at).getTime() > now);
        setSlots(upcoming);
        setSelectedSlotId(upcoming[0]?.id ?? null);
      })
      .catch((err: unknown) => {
        if (!cancelled) toast.error(errorMessage(err, "Could not load availability."));
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDocId, slotsVersion]);

  // Group open slots by calendar day for the weekly grid
  const days = useMemo(() => {
    const groups = new Map<string, Slot[]>();
    for (const s of slots ?? []) {
      const key = new Date(s.starts_at).toDateString();
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }
    return Array.from(groups.entries()).slice(0, 7);
  }, [slots]);

  const activeDoc = doctors?.find((d) => d.id === selectedDocId) ?? null;
  const activeSlot = slots?.find((s) => s.id === selectedSlotId) ?? null;
  const confirmed = appointments.filter((a) => a.status === "confirmed");

  const selectDoctor = (id: string) => {
    if (id === selectedDocId) return;
    setSlots(null);
    setSelectedSlotId(null);
    setJustBooked(null);
    setSelectedDocId(id);
  };

  const handleBooking = async () => {
    if (!activeDoc || !activeSlot) return;
    setIsSubmitting(true);
    try {
      const appt = await api.appointments.book(activeDoc.id, activeSlot.id);
      setJustBooked(appt);
      await refreshAppointments();
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 409
          ? "That time was just taken. Please pick another."
          : errorMessage(err, "Booking failed. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
      setSlotsVersion((v) => v + 1);
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await api.appointments.cancel(id);
      toast.info("Appointment cancelled.");
      if (justBooked?.id === id) setJustBooked(null);
      await refreshAppointments();
      setSlotsVersion((v) => v + 1);
    } catch (err) {
      toast.error(errorMessage(err, "Could not cancel the appointment."));
    }
  };

  if (loadError) {
    return (
      <AppShell>
        <EmptyState tone="error" icon="alert" title="We couldn’t load physicians" description={loadError} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Appointments"
        title="Talk it through with a doctor"
        description="Pick a physician and a time. Bring your printed visit sheet so nothing gets forgotten."
      />

      {/* Upcoming visits */}
      {confirmed.length > 0 && (
        <section className="mb-10" aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="mb-4 text-lg font-semibold tracking-tight">
            Upcoming visits
          </h2>
          <Stagger className="grid gap-3 md:grid-cols-2">
            {confirmed.map((b) => (
              <StaggerItem key={b.id} className="tile flex items-center gap-4 rounded-card-sm p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-muted text-amber">
                  <Icon name="calendar" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{b.doctor?.name ?? "Physician"}</p>
                  {b.slot && <p className="mt-0.5 font-mono text-xs text-fg-muted">{formatDateTime(b.slot.starts_at)}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => downloadIcs(b)}
                  className="grid h-9 w-9 place-items-center rounded-full text-fg-muted transition-colors hover:bg-hover hover:text-fg"
                  aria-label="Add to calendar"
                  title="Add to calendar"
                >
                  <Icon name="calendar" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => void handleCancelBooking(b.id)}
                  className="h-9 rounded-full px-3 text-sm text-fg-muted transition-colors hover:bg-pulse-muted hover:text-pulse"
                >
                  Cancel
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Step 1 — doctors (carousel on mobile, list on desktop) */}
        <section className="lg:col-span-4" aria-labelledby="doctor-heading">
          <h2 id="doctor-heading" className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-muted font-mono text-xs text-teal">1</span>
            Choose a physician
          </h2>
          <div
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-3 lg:overflow-visible lg:px-0"
            role="radiogroup"
            aria-label="Physicians"
          >
            {doctors === null &&
              [0, 1].map((i) => <Skeleton key={i} className="h-32 w-[82%] shrink-0 rounded-card-sm lg:w-full" />)}
            {doctors?.length === 0 && <p className="text-sm text-fg-muted">No physicians yet — run the API seed script to add demo doctors.</p>}
            {doctors?.map((doc) => {
              const selected = doc.id === selectedDocId;
              return (
                <button
                  key={doc.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => selectDoctor(doc.id)}
                  className={`tile w-[82%] shrink-0 snap-start rounded-card-sm p-5 text-left transition-colors lg:w-full ${
                    selected ? "!border-teal/60 shadow-glow-teal" : "hover:!border-line-strong"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                        selected ? "bg-teal text-ink" : "bg-hover text-fg"
                      }`}
                    >
                      {initialsOf(doc.name.split(",")[0] ?? doc.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-fg">{doc.name}</p>
                      <p className="mt-0.5 text-sm text-teal">{doc.specialty}</p>
                      {doc.bio && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-muted">{doc.bio}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 — weekly slot grid + confirm */}
        <section className="lg:col-span-8" aria-labelledby="time-heading">
          <h2 id="time-heading" className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-muted font-mono text-xs text-teal">2</span>
            Pick a time
          </h2>

          <div className="tile p-6 sm:p-7">
            <AnimatePresence mode="wait">
              {justBooked ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <svg viewBox="0 0 52 52" className="h-16 w-16 text-teal" aria-hidden="true">
                    <motion.circle
                      cx="26"
                      cy="26"
                      r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                    />
                    <motion.path
                      d="M15 27l7 7 15-15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.45 }}
                    />
                  </svg>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-fg">You’re booked</h3>
                  <p className="mt-1.5 text-fg-muted">
                    {justBooked.doctor?.name} · {justBooked.slot ? formatDateTime(justBooked.slot.starts_at) : ""}
                  </p>
                  <p className="mt-1 text-sm text-fg-muted">A confirmation email is on its way.</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => downloadIcs(justBooked)} className="btn-secondary">
                      <Icon name="calendar" size={16} /> Add to calendar
                    </button>
                    <button type="button" onClick={() => setJustBooked(null)} className="btn-ghost">
                      Book another
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-sm text-fg-muted">
                    Booking with <span className="font-medium text-fg">{activeDoc?.name ?? "—"}</span>
                  </p>

                  <div className="mt-5">
                    {slots === null ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <Skeleton key={i} className="h-12" />
                        ))}
                      </div>
                    ) : days.length === 0 ? (
                      <p className="py-10 text-center text-sm text-fg-muted">No open times for this physician right now.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-7" role="radiogroup" aria-label="Available times">
                        {days.map(([key, daySlots]) => {
                          const date = new Date(daySlots[0].starts_at);
                          return (
                            <div key={key}>
                              <p className="text-xs font-medium text-fg-muted">{weekdayFmt.format(date)}</p>
                              <p className="mb-2 font-mono text-xs text-fg-muted/80">{dayNumFmt.format(date)}</p>
                              <div className="space-y-2">
                                {daySlots.map((slot) => {
                                  const selected = slot.id === selectedSlotId;
                                  return (
                                    <button
                                      key={slot.id}
                                      type="button"
                                      role="radio"
                                      aria-checked={selected}
                                      aria-label={formatDateTime(slot.starts_at)}
                                      onClick={() => setSelectedSlotId(slot.id)}
                                      className={`relative h-11 w-full rounded-control border text-sm font-medium tabular-nums transition-colors ${
                                        selected
                                          ? "border-teal text-ink"
                                          : "border-line text-fg hover:border-line-strong hover:bg-hover"
                                      }`}
                                    >
                                      {selected && (
                                        <motion.span
                                          layoutId="slot-active"
                                          className="absolute inset-0 rounded-control bg-teal"
                                          transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                          aria-hidden="true"
                                        />
                                      )}
                                      <span className="relative">{formatTime(slot.starts_at)}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
                    <div className="text-sm">
                      <p className="text-fg-muted">Selected</p>
                      <p className="mt-0.5 font-medium text-fg">{activeSlot ? formatDateTime(activeSlot.starts_at) : "—"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleBooking()}
                      disabled={!activeSlot || isSubmitting}
                      className="btn-primary w-full sm:w-auto"
                    >
                      {isSubmitting ? "Confirming…" : "Confirm appointment"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-fg-muted">
            <Chip variant="neutral" size="sm" dot={false}>
              Demo
            </Chip>
            Synthetic physicians and times for demonstration only.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
