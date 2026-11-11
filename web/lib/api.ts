/**
 * Typed client for the PulseOS FastAPI backend (/api/v1).
 * Mirrors the Pydantic schemas in api/app/schemas/*.
 *
 * Tokens live in localStorage for now. Moving them to httpOnly cookies
 * is a planned hardening step (see docs/SECURITY.md).
 */

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const API_PREFIX = `${API_BASE_URL}/api/v1`;

const ACCESS_KEY = "pulseos.access_token";
const REFRESH_KEY = "pulseos.refresh_token";

// ── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type ReportStatus = "pending" | "processing" | "done" | "error";
export type ValueStatus = "normal" | "low" | "high";

export interface ReportListItem {
  id: string;
  filename: string;
  status: ReportStatus;
  created_at: string;
}

export interface ReportValue {
  id: string;
  test_name: string;
  value: number | null;
  unit: string | null;
  ref_low: number | null;
  ref_high: number | null;
  status: ValueStatus;
}

export interface ReportExplanation {
  id: string;
  summary: string;
  details: { full_text?: string } & Record<string, unknown>;
  questions: string[];
  model: string;
  created_at: string;
}

export interface Report extends ReportListItem {
  values: ReportValue[];
  explanation: ReportExplanation | null;
}

export type VitalType = "heart_rate" | "bp" | "glucose" | "weight";
export type Trend = "up" | "down" | "stable";

export interface Vital {
  id: string;
  type: VitalType;
  value_1: number;
  value_2: number | null;
  recorded_at: string;
}

export interface VitalCreate {
  type: VitalType;
  value_1: number;
  value_2?: number | null;
  recorded_at?: string;
}

export interface VitalSummary {
  type: VitalType;
  average: number | null;
  latest: number | null;
  trend: Trend;
  health_score: number;
  readings: Vital[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
}

export interface Slot {
  id: string;
  doctor_id: string;
  starts_at: string;
  ends_at: string;
  is_booked: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_id: string;
  status: "confirmed" | "cancelled";
  created_at: string;
  doctor: Doctor | null;
  slot: Slot | null;
}

// ── Token storage ──────────────────────────────────────────────────────────

function readStorage(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const tokenStore = {
  get access(): string | null {
    return readStorage(ACCESS_KEY);
  },
  get refresh(): string | null {
    return readStorage(REFRESH_KEY);
  },
  set(tokens: TokenResponse): void {
    try {
      window.localStorage.setItem(ACCESS_KEY, tokens.access_token);
      window.localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    } catch {
      /* storage unavailable (private mode) — session will not persist */
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(ACCESS_KEY);
      window.localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* ignore */
    }
  },
};

// ── Errors ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface FastApiErrorBody {
  detail?: string | { msg?: string }[];
}

async function toApiError(res: Response): Promise<ApiError> {
  let message = `Request failed (${res.status})`;
  try {
    const body = (await res.json()) as FastApiErrorBody;
    if (typeof body.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      message = body.detail[0].msg.replace(/^Value error, /, "");
    }
  } catch {
    /* non-JSON error body */
  }
  return new ApiError(res.status, message);
}

// ── Core request with one transparent refresh on 401 ─────────────────────

let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;
  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${API_PREFIX}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      tokenStore.set((await res.json()) as TokenResponse);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function rawFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = tokenStore.access;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  try {
    return await fetch(`${API_PREFIX}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, "Cannot reach the PulseOS server. Check your connection and try again.");
  }
}

/** Fetch with auth header; on 401 tries one token refresh, then clears the session. */
export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  let res = await rawFetch(path, init);
  if (res.status === 401 && tokenStore.refresh) {
    if (await refreshTokens()) {
      res = await rawFetch(path, init);
    }
  }
  if (res.status === 401) {
    tokenStore.clear();
  }
  return res;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authedFetch(path, init);
  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export const api = {
  auth: {
    async login(email: string, password: string): Promise<User> {
      const tokens = await request<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      tokenStore.set(tokens);
      return api.auth.me();
    },
    async register(fullName: string, email: string, password: string): Promise<User> {
      const tokens = await request<TokenResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ full_name: fullName, email, password }),
      });
      tokenStore.set(tokens);
      return api.auth.me();
    },
    me: (): Promise<User> => request<User>("/auth/me"),
    logout(): void {
      tokenStore.clear();
    },
  },
  reports: {
    list: (): Promise<ReportListItem[]> => request<ReportListItem[]>("/reports"),
    get: (id: string): Promise<Report> => request<Report>(`/reports/${encodeURIComponent(id)}`),
    upload(file: File): Promise<ReportListItem> {
      const form = new FormData();
      form.append("file", file);
      return request<ReportListItem>("/reports", { method: "POST", body: form });
    },
  },
  vitals: {
    list: (range: "7d" | "30d", type?: VitalType): Promise<Vital[]> => {
      const qs = new URLSearchParams({ range });
      if (type) qs.set("type", type);
      return request<Vital[]>(`/vitals?${qs.toString()}`);
    },
    summary: (): Promise<VitalSummary[]> => request<VitalSummary[]>("/vitals/summary"),
    create: (body: VitalCreate): Promise<Vital> =>
      request<Vital>("/vitals", { method: "POST", body: JSON.stringify(body) }),
  },
  doctors: {
    list: (): Promise<Doctor[]> => request<Doctor[]>("/doctors"),
    slots: (doctorId: string): Promise<Slot[]> =>
      request<Slot[]>(`/doctors/${encodeURIComponent(doctorId)}/slots`),
  },
  appointments: {
    list: (): Promise<Appointment[]> => request<Appointment[]>("/appointments"),
    book: (doctorId: string, slotId: string): Promise<Appointment> =>
      request<Appointment>("/appointments", {
        method: "POST",
        body: JSON.stringify({ doctor_id: doctorId, slot_id: slotId }),
      }),
    cancel: (id: string): Promise<void> =>
      request<void>(`/appointments/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
};

// ── SSE: streamed report explanation ──────────────────────────────────────

export interface ExplainHandlers {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

interface ExplainEvent {
  token?: string;
  done?: boolean;
  error?: string;
}

/**
 * Streams GET /reports/{id}/explain. EventSource cannot send an Authorization
 * header, so this reads the SSE body via fetch + ReadableStream.
 */
export async function streamExplanation(
  reportId: string,
  handlers: ExplainHandlers,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await authedFetch(`/reports/${encodeURIComponent(reportId)}/explain`, {
      headers: { Accept: "text/event-stream" },
      signal,
    });
  } catch (err) {
    if (signal?.aborted) return;
    handlers.onError(err instanceof Error ? err.message : "Could not start the explanation.");
    return;
  }
  if (!res.ok || !res.body) {
    handlers.onError((await toApiError(res)).message);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const data = frame
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (!data) continue;
        const event = JSON.parse(data) as ExplainEvent;
        if (event.token) handlers.onToken(event.token);
        if (event.error) {
          handlers.onError(event.error);
          return;
        }
        if (event.done) {
          handlers.onDone();
          return;
        }
      }
    }
    handlers.onDone();
  } catch (err) {
    if (signal?.aborted) return;
    handlers.onError(err instanceof Error ? err.message : "The explanation stream was interrupted.");
  }
}
