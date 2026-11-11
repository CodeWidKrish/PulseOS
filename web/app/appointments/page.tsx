"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ApiError, api, type Appointment, type Doctor, type Slot } from "@/lib/api";
import { formatDateTime, formatTime } from "@/lib/format";
import { initialsOf } from "@/lib/session";

const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" });

const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotsVersion, setSlotsVersion] = useState(0);

  const refreshAppointments = useCallback(async () => {
    try {
      setAppointments(await api.appointments.list());
    } catch (err) {
      toast.error(errorMessage(err, "Could not refresh your appointments."));
    }
  }, []);

  // Initial load: doctors + my appointments
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

  // Slots for the selected doctor
  useEffect(() => {
    if (!selectedDocId) return;
    let cancelled = false;
    api.doctors
      .slots(selectedDocId)
      .then((data) => {
        if (cancelled) return;
        const upcoming = data.filter((s) => new Date(s.starts_at).getTime() > Date.now());
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

  const activeDoc = doctors?.find((d) => d.id === selectedDocId) ?? null;
  const activeSlot = slots?.find((s) => s.id === selectedSlotId) ?? null;
  const confirmed = appointments.filter((a) => a.status === "confirmed");

  const selectDoctor = (id: string) => {
    if (id === selectedDocId) return;
    setSlots(null);
    setSelectedSlotId(null);
    setSelectedDocId(id);
  };

  const handleBooking = async () => {
    if (!activeDoc || !activeSlot) return;
    setIsSubmitting(true);
    try {
      await api.appointments.book(activeDoc.id, activeSlot.id);
      toast.success(`Appointment confirmed with ${activeDoc.name}.`);
      await refreshAppointments();
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 409
          ? "That slot was just taken. Please pick another time."
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
      await refreshAppointments();
      setSlotsVersion((v) => v + 1);
    } catch (err) {
      toast.error(errorMessage(err, "Could not cancel the appointment."));
    }
  };

  return (
    <AppShell title="Appointments">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
          <div>
            <span className="text-xs font-mono text-[#5EE1D2] uppercase tracking-wider">Clinical Consultations</span>
            <h1 className="text-3xl font-semibold tracking-tight text-[#F2F4F7] mt-1">Physician Appointments</h1>
            <p className="text-sm text-[#8B93A1] mt-1">
              Book a follow-up with a physician and bring your report questions with you.
            </p>
          </div>
        </div>

        {loadError && (
          <div className="p-6 rounded-[28px] bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-center text-sm text-[#F2F4F7]" role="alert">
            {loadError}
          </div>
        )}

        {/* Confirmed Bookings */}
        {confirmed.length > 0 && (
          <div className="p-6 rounded-[28px] bg-[#12161D]/80 border border-white/8 space-y-4">
            <h2 className="text-base font-semibold text-[#F2F4F7] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5EE1D2]" />
              Your Scheduled Consultations ({confirmed.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confirmed.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/6 flex items-center justify-between gap-3 min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#F2F4F7] truncate">{b.doctor?.name ?? "Physician"}</p>
                    <p className="text-xs text-[#8B93A1] truncate">{b.doctor?.specialty}</p>
                    {b.slot && (
                      <p className="text-xs font-mono text-[#5EE1D2] mt-1.5 truncate">{formatDateTime(b.slot.starts_at)}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCancelBooking(b.id)}
                    className="text-xs text-[#FF4D5E] hover:underline px-2 py-1 shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-Column Booking Wizard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Physician Directory */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-lg font-semibold text-[#F2F4F7]">1. Select Physician</h2>
            <div className="space-y-3" role="radiogroup" aria-label="Physician selection">
              {doctors === null && !loadError &&
                [0, 1].map((i) => <div key={i} className="h-28 rounded-[28px] bg-white/[0.04] animate-pulse" />)}
              {doctors?.length === 0 && (
                <p className="text-sm text-[#8B93A1]">No physicians available yet. Run the API seed script to add demo doctors.</p>
              )}
              {doctors?.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <SpotlightCard
                    key={doc.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => selectDoctor(doc.id)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectDoctor(doc.id);
                      }
                    }}
                    className={`p-5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2] ${
                      isSelected
                        ? "bg-[#12161D] border-[#5EE1D2]/50 shadow-md"
                        : "bg-[#12161D]/60 hover:bg-[#12161D]/90 border-white/8"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-[#5EE1D2]/15 border border-[#5EE1D2]/30 text-[#5EE1D2] font-semibold flex items-center justify-center shrink-0">
                        {initialsOf(doc.name.split(",")[0] ?? doc.name)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-semibold text-sm text-[#F2F4F7] truncate">{doc.name}</p>
                        <p className="text-xs text-[#5EE1D2] font-medium">{doc.specialty}</p>
                        {doc.bio && <p className="text-xs text-[#8B93A1] leading-relaxed line-clamp-2">{doc.bio}</p>}
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>

          {/* Right: Availability Slots & Confirmation */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-semibold text-[#F2F4F7]">2. Choose Time & Confirm</h2>

            <SpotlightCard className="p-6 sm:p-8 bg-[#12161D]/90 backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/8">
                <div>
                  <p className="text-xs font-mono text-[#8B93A1] uppercase tracking-wider">Booking with</p>
                  <p className="text-base font-semibold text-[#F2F4F7] mt-0.5">{activeDoc?.name ?? "—"}</p>
                </div>
              </div>

              {/* Slot Grid */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#8B93A1] uppercase tracking-wider">Available Slots</p>
                {slots === null ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-hidden="true">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-[#8B93A1]">No open slots for this physician right now.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Available time slots">
                    {slots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3.5 rounded-xl text-left border transition-all ${
                            isSelected
                              ? "bg-[#5EE1D2]/15 border-[#5EE1D2] text-[#F2F4F7] shadow-sm"
                              : "bg-[#0B0D12] border-white/10 text-[#8B93A1] hover:border-white/20 hover:text-[#F2F4F7]"
                          }`}
                        >
                          <p className="text-xs text-[#8B93A1]">{dayFmt.format(new Date(slot.starts_at))}</p>
                          <p className="text-sm font-semibold text-[#F2F4F7] mt-0.5">
                            {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#8B93A1]">
                  <span>Selected: </span>
                  <strong className="text-[#F2F4F7]">{activeSlot ? formatDateTime(activeSlot.starts_at) : "—"}</strong>
                </div>

                <Button
                  onClick={() => void handleBooking()}
                  isLoading={isSubmitting}
                  disabled={!activeSlot || isSubmitting}
                  size="md"
                  variant="primary"
                  className="w-full sm:w-auto bg-[#FF4D5E] text-white shadow-lg shadow-[#FF4D5E]/20"
                >
                  Confirm Appointment
                </Button>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Medical Notice */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 text-center text-xs text-[#8B93A1]">
          PulseOS provides scheduling coordination and health report organization. Appointments are conducted directly
          with licensed medical practitioners.
        </div>
      </div>
    </AppShell>
  );
}
