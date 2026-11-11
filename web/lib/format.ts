import type { ReportStatus } from "@/lib/api";

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export const formatDate = (iso: string): string => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string): string => dateTimeFmt.format(new Date(iso));
export const formatTime = (iso: string): string => timeFmt.format(new Date(iso));

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  pending: "Ready to explain",
  processing: "Processing",
  done: "Explained",
  error: "Needs retry",
};

/** Tailwind classes for a report status pill (teal = good, amber = attention, red = error). */
export const REPORT_STATUS_TONE: Record<ReportStatus, string> = {
  pending: "bg-[#FFB86B]/15 text-[#FFB86B] border border-[#FFB86B]/30",
  processing: "bg-[#FFB86B]/15 text-[#FFB86B] border border-[#FFB86B]/30",
  done: "bg-[#5EE1D2]/15 text-[#5EE1D2] border border-[#5EE1D2]/30",
  error: "bg-[#FF4D5E]/15 text-[#FF4D5E] border border-[#FF4D5E]/30",
};
