import React from "react";

/**
 * Inline icon set in the Lucide style: 24px grid, 1.5px stroke, round caps (DESIGN.md §7.4).
 * Kept in-repo instead of adding an icon dependency.
 */
type Shape =
  | { d: string }
  | { circle: [number, number, number] }
  | { rect: [number, number, number, number, number] };

const p = (d: string): Shape => ({ d });
const c = (cx: number, cy: number, r: number): Shape => ({ circle: [cx, cy, r] });
const r = (x: number, y: number, w: number, h: number, rx: number): Shape => ({ rect: [x, y, w, h, rx] });

const ICONS = {
  dashboard: [r(3, 3, 7, 9, 1.5), r(14, 3, 7, 5, 1.5), r(14, 12, 7, 9, 1.5), r(3, 16, 7, 5, 1.5)],
  report: [
    p("M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"),
    p("M14 2v4a2 2 0 0 0 2 2h4"),
    p("M16 13H8"),
    p("M16 17H8"),
    p("M10 9H8"),
  ],
  activity: [p("M22 12h-4l-3 9L9 3l-3 9H2")],
  calendar: [r(3, 4, 18, 18, 2), p("M16 2v4"), p("M8 2v4"), p("M3 10h18")],
  upload: [p("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), p("m17 8-5-5-5 5"), p("M12 3v12")],
  chevronRight: [p("m9 18 6-6-6-6")],
  chevronLeft: [p("m15 18-6-6 6-6")],
  chevronsLeft: [p("m11 17-5-5 5-5"), p("m18 17-5-5 5-5")],
  close: [p("M18 6 6 18"), p("m6 6 12 12")],
  plus: [p("M5 12h14"), p("M12 5v14")],
  logout: [p("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"), p("m16 17 5-5-5-5"), p("M21 12H9")],
  sun: [
    c(12, 12, 4),
    p("M12 2v2"),
    p("M12 20v2"),
    p("m4.93 4.93 1.41 1.41"),
    p("m17.66 17.66 1.41 1.41"),
    p("M2 12h2"),
    p("M20 12h2"),
    p("m6.34 17.66-1.41 1.41"),
    p("m19.07 4.93-1.41 1.41"),
  ],
  moon: [p("M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z")],
  search: [c(11, 11, 8), p("m21 21-4.3-4.3")],
  sparkles: [
    p(
      "M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0Z",
    ),
  ],
  alert: [p("m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"), p("M12 9v4"), p("M12 17h.01")],
  check: [p("M20 6 9 17l-5-5")],
  clock: [c(12, 12, 10), p("M12 6v6l4 2")],
  heartPulse: [
    p("M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"),
    p("M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"),
  ],
  arrowRight: [p("M5 12h14"), p("m12 5 7 7-7 7")],
  arrowUpRight: [p("M7 7h10v10"), p("M7 17 17 7")],
  copy: [r(8, 8, 14, 14, 2), p("M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2")],
  printer: [
    p("M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"),
    p("M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"),
    r(6, 14, 12, 8, 1),
  ],
  trendUp: [p("M22 7 13.5 15.5 8.5 10.5 2 17"), p("M16 7h6v6")],
  trendDown: [p("M22 17 13.5 8.5 8.5 13.5 2 7"), p("M16 17h6v-6")],
  minus: [p("M5 12h14")],
  menu: [p("M4 6h16"), p("M4 12h16"), p("M4 18h16")],
  droplet: [p("M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z")],
  gauge: [p("m12 14 4-4"), p("M3.34 19a10 10 0 1 1 17.32 0")],
  weight: [
    c(12, 5, 3),
    p("M6.5 8a2 2 0 0 0-1.9 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.93-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"),
  ],
  stethoscope: [
    p("M11 2v2"),
    p("M5 2v2"),
    p("M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"),
    p("M8 15a6 6 0 0 0 12 0v-3"),
    c(20, 10, 2),
  ],
  info: [c(12, 12, 10), p("M12 16v-4"), p("M12 8h.01")],
  shield: [
    p("M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"),
    p("m9 12 2 2 4-4"),
  ],
  eye: [p("M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"), c(12, 12, 3)],
  eyeOff: [
    p("M10.73 5.08a10.74 10.74 0 0 1 11.2 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49"),
    p("M14.08 14.16a3 3 0 0 1-4.24-4.24"),
    p("M17.48 17.5a10.75 10.75 0 0 1-15.42-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14"),
    p("m2 2 20 20"),
  ],
  user: [c(12, 8, 5), p("M20 21a8 8 0 0 0-16 0")],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  /** Accessible label; omit for decorative icons (they are then aria-hidden). */
  label?: string;
}

export function Icon({ name, size = 18, label, strokeWidth = 1.5, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {ICONS[name].map((shape, i) => {
        if ("d" in shape) return <path key={i} d={shape.d} />;
        if ("circle" in shape) {
          const [cx, cy, rad] = shape.circle;
          return <circle key={i} cx={cx} cy={cy} r={rad} />;
        }
        const [x, y, w, h, rx] = shape.rect;
        return <rect key={i} x={x} y={y} width={w} height={h} rx={rx} />;
      })}
    </svg>
  );
}
