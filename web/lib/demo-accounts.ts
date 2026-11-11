/**
 * Synthetic demo accounts created by `python -m app.core.seed` (api/app/core/seed.py).
 * Sample data only — these are public sandbox credentials, not real users.
 */
export const DEMO_PASSWORD = "PulseOS2026!";

export const DEMO_ACCOUNTS = {
  patient: "elena.rostova@sample.pulseos.health",
  doctor: "dr.marcus.vance@sample.pulseos.health",
} as const;

export type DemoRole = keyof typeof DEMO_ACCOUNTS;
