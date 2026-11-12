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

export function isInRange(meta: VitalMeta, v: Vital): boolean {
  const inBand = (x: number, band: [number, number]) => x >= band[0] && x <= band[1];
  if (!meta.range) return true;
  if (!inBand(v.value_1, meta.range)) return false;
  return !(meta.range2 && v.value_2 !== null && !inBand(v.value_2, meta.range2));
}
