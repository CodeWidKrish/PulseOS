"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, tokenStore, type User } from "@/lib/api";
import { EcgLine } from "@/components/app/ecg-line";

const SessionContext = createContext<User | null>(null);

/** Current signed-in user. Only valid inside <RequireSession>. */
export function useSessionUser(): User {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useSessionUser must be used inside <RequireSession>");
  return user;
}

export function initialsOf(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Client-side route guard: redirects to /login when there is no valid session,
 * otherwise loads the user and exposes it via useSessionUser().
 */
export function RequireSession({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    const toLogin = () => router.replace(`/login?next=${encodeURIComponent(pathname)}`);

    if (!tokenStore.access && !tokenStore.refresh) {
      toLogin();
      return;
    }
    api.auth
      .me()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) {
          tokenStore.clear();
          toLogin();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (!user) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas text-sm text-fg-muted"
        role="status"
        aria-live="polite"
      >
        <EcgLine label="Loading" className="h-8 w-36" />
        <span>Opening your health workspace…</span>
      </div>
    );
  }

  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

/** Validates a post-login redirect target so it can only point inside this app. */
export function safeNextPath(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}
