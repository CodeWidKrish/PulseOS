"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { TrendChart } from "@/components/app/trend-chart";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon, type IconName } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { CountUp, Stagger, StaggerItem } from "@/components/ui/motion";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { api, type Vital, type VitalType } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { VITAL_META, isInRange } from "@/lib/vitals";

type Range = "7d" | "30d";

const VITAL_ICON: Record<VitalType, IconName> = {
  heart_rate: "heartPulse",
  bp: "gauge",
  glucose: "droplet",
  weight: "weight",
};

const SHORT_NAME: Record<VitalType, string> = {
  heart_rate: "Heart rate",
  bp: "Blood pressure",
  glucose: "Glucose",
  weight: "Weight",
};

function percentChange(series: Vital[]): number | null {
  if (series.length < 2 || series[0].value_1 === 0) return null;
  return ((series[series.length - 1].value_1 - series[0].value_1) / series[0].value_1) * 100;
}

export default function VitalsPage() {
  const [range, setRange] = useState<Range>("7d");
  const [vitals, setVitals] = useState<Record<Range, Vital[] | undefined>>({ "7d": undefined, "30d": undefined });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<VitalType>("heart_rate");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.vitals
      .list(range)
      .then((data) => {
        if (!cancelled) {
          setVitals((prev) => ({ ...prev, [range]: data }));
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Could not load your vitals.");
      });
    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  const readings = vitals[range];
  const meta = VITAL_META.find((m) => m.type === selectedType) ?? VITAL_META[0];

  const openLog = (type?: VitalType) => {
    if (type) setSelectedType(type);
    setValue1("");
    setValue2("");
    setModalOpen(true);
  };

  const handleLogVital = async (e: React.FormEvent) => {
    e.preventDefault();
    const v1 = Number(value1);
    const v2 = selectedType === "bp" ? Number(value2) : null;
    if (!Number.isFinite(v1) || v1 <= 0 || (selectedType === "bp" && (!Number.isFinite(v2) || (v2 ?? 0) <= 0))) {
      toast.error(selectedType === "bp" ? "Enter both systolic and diastolic values." : "Enter a positive number.");
      return;
    }
    setIsSaving(true);
    try {
      await api.vitals.create({ type: selectedType, value_1: v1, value_2: v2 });
      toast.success(`${SHORT_NAME[selectedType]} saved.`);
      setModalOpen(false);
      setVitals({ "7d": undefined, "30d": undefined });
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the reading.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Vitals"
        title="Your trends, at a glance"
        description="Log heart rate, blood pressure, glucose and weight. The shaded band on each chart is the typical adult range."
        controls={
          <Segmented
            label="Time range"
            value={range}
            onChange={setRange}
            options={[
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
            ]}
          />
        }
        action={
          <button type="button" onClick={() => openLog()} className="btn-primary">
            <Icon name="plus" size={16} /> Log a reading
          </button>
        }
      />

      {loadError ? (
        <EmptyState
          tone="error"
          icon="alert"
          title="We couldn’t load your vitals"
          description={loadError}
          action={
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="btn-secondary">
              Try again
            </button>
          }
        />
      ) : (
        <Stagger key={range} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {VITAL_META.map((m) => {
            const series = (readings ?? []).filter((v) => v.type === m.type);
            const latest = series.at(-1);
            const avg = series.length ? series.reduce((s, v) => s + v.value_1, 0) / series.length : null;
            const avg2 =
              m.type === "bp" && series.length ? series.reduce((s, v) => s + (v.value_2 ?? 0), 0) / series.length : null;
            const ok = latest ? isInRange(m, latest) : true;
            const change = percentChange(series);

            return (
              <StaggerItem key={m.type} className="tile tile-interactive flex flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-fg-muted">
                    <span className={`grid h-8 w-8 place-items-center rounded-full ${ok ? "bg-teal-muted text-teal" : "bg-amber-muted text-amber"}`}>
                      <Icon name={VITAL_ICON[m.type]} size={16} />
                    </span>
                    {SHORT_NAME[m.type]}
                  </p>
                  {latest && m.range && (
                    <Chip variant={ok ? "normal" : "caution"} size="sm">
                      {ok ? "In range" : "Outside range"}
                    </Chip>
                  )}
                </div>

                {readings === undefined ? (
                  <>
                    <Skeleton className="mt-6 h-10 w-40" />
                    <Skeleton className="mt-6 h-[150px] w-full" />
                  </>
                ) : latest ? (
                  <>
                    <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="text-4xl font-semibold tracking-tight text-fg">
                        {m.type === "bp" && latest.value_2 !== null ? (
                          <span className="tabular-nums">
                            {Math.round(latest.value_1)}/{Math.round(latest.value_2)}
                          </span>
                        ) : (
                          <CountUp value={latest.value_1} decimals={latest.value_1 % 1 ? 1 : 0} />
                        )}
                      </p>
                      <span className="font-mono text-sm text-fg-muted">{m.unit}</span>
                      {change !== null && Math.abs(change) >= 0.5 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-hover px-2 py-0.5 text-xs text-fg-muted">
                          <Icon name={change > 0 ? "trendUp" : "trendDown"} size={13} />
                          {Math.abs(change).toFixed(1)}% this period
                        </span>
                      )}
                    </div>
                    <div className="mt-5 flex-1">
                      {series.length > 1 ? (
                        <TrendChart
                          data={series.map((v) => ({ t: v.recorded_at, v: v.value_1, v2: v.value_2 }))}
                          band={m.range}
                          tone={ok ? "teal" : "amber"}
                          unit={m.unit}
                          height={150}
                        />
                      ) : (
                        <p className="grid h-[150px] place-items-center text-sm text-fg-muted">Log one more reading to see a trend.</p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs text-fg-muted">
                      <span className="font-mono">
                        Avg {avg !== null ? Math.round(avg) : "—"}
                        {avg2 !== null ? `/${Math.round(avg2)}` : ""} · {series.length} reading{series.length === 1 ? "" : "s"}
                      </span>
                      <span className="font-mono">{formatDateTime(latest.recorded_at)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-start justify-center gap-3 py-10">
                    <p className="text-sm text-fg-muted">No readings in this period yet.</p>
                    <button type="button" onClick={() => openLog(m.type)} className="btn-ghost -ml-3 text-sm">
                      <Icon name="plus" size={15} /> Add {SHORT_NAME[m.type].toLowerCase()}
                    </button>
                  </div>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      )}

      <p className="mt-10 text-center text-xs text-fg-muted">
        Ranges are general reference bands for adults. PulseOS explains information and does not provide medical advice.
      </p>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log a reading" description="Saved to your private timeline.">
        <form onSubmit={handleLogVital} className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-fg-muted">Measurement</legend>
            <div className="grid grid-cols-2 gap-2">
              {VITAL_META.map((m) => {
                const active = m.type === selectedType;
                return (
                  <button
                    key={m.type}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedType(m.type)}
                    className={`flex items-center gap-2.5 rounded-control border px-3 py-3 text-left text-sm transition-colors ${
                      active ? "border-teal bg-teal-muted text-fg" : "border-line text-fg-muted hover:border-line-strong hover:text-fg"
                    }`}
                  >
                    <Icon name={VITAL_ICON[m.type]} size={17} className={active ? "text-teal" : ""} />
                    {SHORT_NAME[m.type]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className={`grid gap-3 ${selectedType === "bp" ? "grid-cols-2" : "grid-cols-1"}`}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-fg-muted">
                {selectedType === "bp" ? "Systolic" : "Value"}
              </span>
              <span className="flex h-12 items-center rounded-control border border-line bg-canvas px-4 focus-within:border-teal focus-within:shadow-[0_0_0_3px_rgba(94,225,210,0.18)]">
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  required
                  data-autofocus
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  placeholder={selectedType === "bp" ? "120" : selectedType === "heart_rate" ? "72" : selectedType === "glucose" ? "95" : "70"}
                  className="w-full bg-transparent text-lg tabular-nums text-fg outline-none placeholder:text-fg-muted/50"
                />
                <span className="font-mono text-xs text-fg-muted">{meta.unit}</span>
              </span>
            </label>
            {selectedType === "bp" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-fg-muted">Diastolic</span>
                <span className="flex h-12 items-center rounded-control border border-line bg-canvas px-4 focus-within:border-teal focus-within:shadow-[0_0_0_3px_rgba(94,225,210,0.18)]">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    required
                    value={value2}
                    onChange={(e) => setValue2(e.target.value)}
                    placeholder="80"
                    className="w-full bg-transparent text-lg tabular-nums text-fg outline-none placeholder:text-fg-muted/50"
                  />
                  <span className="font-mono text-xs text-fg-muted">mmHg</span>
                </span>
              </label>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? "Saving…" : "Save reading"}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
