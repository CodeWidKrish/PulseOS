import type { Vital, VitalType } from "@/lib/api";

export interface VitalMeta {
  type: VitalType;
  name: string;
  unit: string;
  /** Reference band for value_1 (and value_2 for blood pressure); mirrors api/app/services/scoring.py. */
  range: [number, number] | null;
  range2?: [number, number];
}

export const VITAL_META: VitalMeta[] = [
  { type: "heart_rate", name: "Resting Heart Rate", unit: "BPM", range: [60, 100] },
  { type: "bp", name: "Blood Pressure", unit: "mmHg", range: [90, 120], range2: [60, 80] },
  { type: "glucose", name: "Fasting Glucose", unit: "mg/dL", range: [70, 100] },
  { type: "weight", name: "Body Weight", unit: "kg", range: null },
];

export const formatVitalValue = (v: Pick<Vital, "type" | "value_1" | "value_2">): string =>
  v.type === "bp" && v.value_2 !== null ? `${Math.round(v.value_1)} / ${Math.round(v.value_2)}` : `${v.value_1}`;

export function isInRange(meta: VitalMeta, v: Vital): boolean {
  const inBand = (x: number, band: [number, number]) => x >= band[0] && x <= band[1];
  if (!meta.range) return true;
  if (!inBand(v.value_1, meta.range)) return false;
  return !(meta.range2 && v.value_2 !== null && !inBand(v.value_2, meta.range2));
}

/** Builds an SVG polyline path (viewBox 300x50) for a series of readings. */
export function sparklinePath(values: number[]): string {
  if (values.length === 0) return "";
  if (values.length === 1) return "M0,25 L300,25";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((val, i) => {
      const x = (i / (values.length - 1)) * 300;
      const y = 45 - ((val - min) / span) * 40;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}
