"use client";

import React, { useId } from "react";
import { Area, AreaChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";

export interface TrendPoint {
  t: string; // ISO timestamp
  v: number;
  v2?: number | null;
}

interface TrendChartProps {
  data: TrendPoint[];
  band?: [number, number] | null;
  tone?: "teal" | "amber";
  unit: string;
  height?: number;
  /** Compact sparkline (no axes/tooltip). */
  compact?: boolean;
}

const PALETTE = {
  dark: { teal: "#5EE1D2", amber: "#FFB86B", muted: "#8B93A1", grid: "rgba(255,255,255,0.08)", surface: "#12161D" },
  light: { teal: "#0F766E", amber: "#B45309", muted: "#4B5563", grid: "rgba(11,15,21,0.08)", surface: "#FFFFFF" },
};

const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const tipFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

interface TipProps {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
  unit: string;
}

function ChartTooltip({ active, payload, unit }: TipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-control border border-line bg-surface/95 px-3 py-2 shadow-elevation-low backdrop-blur-md">
      <p className="font-mono text-xs text-fg-muted">{tipFmt.format(new Date(point.t))}</p>
      <p className="mt-0.5 font-semibold tabular-nums text-fg">
        {point.v2 != null ? `${Math.round(point.v)} / ${Math.round(point.v2)}` : point.v}
        <span className="ml-1 text-xs font-normal text-fg-muted">{unit}</span>
      </p>
    </div>
  );
}

/** Area trend with the normal reference band shaded behind the line (DESIGN §8.4). */
export function TrendChart({ data, band, tone = "teal", unit, height = 160, compact = false }: TrendChartProps) {
  const gradId = useId().replace(/:/g, "");
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const colors = PALETTE[theme];
  const stroke = colors[tone];

  const values = data.map((d) => d.v);
  const lo = Math.min(...values, band?.[0] ?? Infinity);
  const hi = Math.max(...values, band?.[1] ?? -Infinity);
  const pad = (hi - lo || 1) * 0.15;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={compact ? { top: 4, right: 0, bottom: 0, left: 0 } : { top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis
            hide={compact}
            domain={[Math.floor(lo - pad), Math.ceil(hi + pad)]}
            tickFormatter={(v: number) => String(Math.round(v))}
            tick={{ fill: colors.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickCount={4}
          />
          <XAxis
            hide={compact}
            dataKey="t"
            tickFormatter={(t: string) => dayFmt.format(new Date(t))}
            tick={{ fill: colors.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          {band && (
            <ReferenceArea y1={band[0]} y2={band[1]} fill={colors.teal} fillOpacity={0.07} stroke="none" ifOverflow="extendDomain" />
          )}
          {!compact && (
            <Tooltip
              content={<ChartTooltip unit={unit} />}
              cursor={{ stroke: colors.muted, strokeDasharray: "3 4", strokeWidth: 1 }}
            />
          )}
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{ r: 4, fill: stroke, stroke: colors.surface, strokeWidth: 2 }}
            isAnimationActive={!reduce}
            animationDuration={1400}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
