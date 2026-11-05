const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "").replace(/\/api\/v1$/, "") + "/api/v1";
export async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = sessionStorage.getItem("pulse-access");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(base + path, { ...init, headers });
  if (!response.ok) {
    if (response.status === 401) sessionStorage.removeItem("pulse-access");
    const error = await response.json().catch(() => ({}));
    throw new Error(typeof error.detail === "string" ? error.detail : "Please check your entries and try again.");
  }
  return response;
}
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await request(path, init);
  return response.status === 204 ? undefined as T : response.json();
}
export interface Report { id: string; filename: string; status: string; created_at: string; values?: {id:string;test_name:string;value:number;unit:string;ref_low:number;ref_high:number;status:string}[]; explanation?: {details:{full_text?:string};summary:string} }
export interface Vital {id:string;type:string;value_1:number;value_2:number|null;recorded_at:string}
export interface Summary {type:string;latest:number;average:number;trend:string;health_score:number}
export interface Doctor {id:string;name:string;specialty:string;bio:string}
export interface Slot {id:string;starts_at:string}
export interface Appointment {id:string;status:string;doctor:Doctor;slot:Slot}
