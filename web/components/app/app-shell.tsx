"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { toast } from "@/components/ui/toast";
import { Icon, type IconName } from "@/components/ui/icon";
import { CommandPalette } from "@/components/marketing/command-palette";
import { api } from "@/lib/api";
import { RequireSession, initialsOf, useSessionUser } from "@/lib/session";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

const NAV_ITEMS: { label: string; href: string; icon: IconName }[] = [
  { label: "Overview", href: "/dashboard", icon: "dashboard" },
  { label: "Lab reports", href: "/reports", icon: "report" },
  { label: "Vitals", href: "/vitals", icon: "activity" },
  { label: "Appointments", href: "/appointments", icon: "calendar" },
];

const NARROW_QUERY = "(max-width: 1199px)";

function subscribeNarrow(onChange: () => void): () => void {
  const mql = window.matchMedia(NARROW_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getNarrowSnapshot(): boolean {
  return window.matchMedia(NARROW_QUERY).matches;
}

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function AppShell(props: AppShellProps) {
  return (
    <RequireSession>
      <AppShellFrame {...props} />
    </RequireSession>
  );
}

function AppShellFrame({ children, title }: AppShellProps) {
  const user = useSessionUser();
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { theme, toggleTheme } = useTheme();
  // Collapse by default on narrow screens; a manual toggle overrides the default.
  const isNarrow = useSyncExternalStore(subscribeNarrow, getNarrowSnapshot, () => false);
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | null>(null);
  const collapsed = collapsedOverride ?? isNarrow;
  const [commandOpen, setCommandOpen] = useState(false);

  // Command palette hotkey (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    toast.info("Signed out.");
    router.push("/");
  };

  const sectionTitle = title ?? NAV_ITEMS.find((n) => isActive(pathname, n.href))?.label ?? "Overview";

  return (
    <div className="relative flex min-h-screen bg-canvas text-fg">
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside
        className={`no-print sticky top-0 z-30 hidden h-screen shrink-0 flex-col justify-between border-r border-line bg-surface/70 backdrop-blur-xl transition-[width] duration-300 md:flex ${
          collapsed ? "w-[76px]" : "w-[248px]"
        }`}
      >
        <div>
          <div className={`flex h-16 items-center ${collapsed ? "justify-center" : "justify-between px-5"}`}>
            <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="PulseOS overview">
              <span className="beacon relative h-2.5 w-2.5 rounded-full bg-pulse text-pulse" aria-hidden="true" />
              {!collapsed && (
                <span className="text-[15px] font-semibold tracking-tight">
                  Pulse<span className="text-fg-muted">OS</span>
                </span>
              )}
            </Link>
            {!collapsed && (
              <button
                type="button"
                onClick={() => setCollapsedOverride(true)}
                className="grid h-8 w-8 place-items-center rounded-full text-fg-muted transition-colors hover:bg-hover hover:text-fg"
                aria-label="Collapse sidebar"
              >
                <Icon name="chevronsLeft" size={16} />
              </button>
            )}
          </div>

          <nav className="mt-4 space-y-1 px-3" aria-label="App">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-11 items-center gap-3 rounded-control text-sm font-medium transition-colors ${
                    collapsed ? "justify-center" : "px-3.5"
                  } ${active ? "text-fg" : "text-fg-muted hover:text-fg"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-control border border-line-strong bg-hover"
                      transition={reduce ? { duration: 0 } : { type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      aria-hidden="true"
                    >
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-teal shadow-glow-teal" />
                    </motion.span>
                  )}
                  <span className={`relative ${active ? "text-teal" : ""}`}>
                    <Icon name={item.icon} size={19} />
                  </span>
                  {!collapsed && <span className="relative">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-line p-3">
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsedOverride(false)}
              className="mx-auto grid h-9 w-9 place-items-center rounded-full text-fg-muted hover:bg-hover hover:text-fg"
              aria-label="Expand sidebar"
            >
              <Icon name="chevronRight" size={16} />
            </button>
          )}
          <div className={`flex items-center gap-3 rounded-control p-2 ${collapsed ? "justify-center" : ""}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-teal/30 bg-teal-muted text-xs font-semibold text-teal">
              {initialsOf(user.full_name)}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{user.full_name}</p>
                <p className="text-xs capitalize text-fg-muted">{user.role}</p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="grid h-9 w-9 place-items-center rounded-full text-fg-muted transition-colors hover:bg-pulse-muted hover:text-pulse"
                aria-label="Sign out"
                title="Sign out"
              >
                <Icon name="logout" size={17} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main column ───────────────────────────────────────── */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="app-aurora no-print" aria-hidden="true" />

        <header className="glass-nav no-print sticky top-0 z-20 flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link href="/dashboard" className="flex items-center gap-2 md:hidden" aria-label="PulseOS overview">
              <span className="beacon relative h-2.5 w-2.5 rounded-full bg-pulse text-pulse" aria-hidden="true" />
            </Link>
            <span className="hidden text-fg-muted sm:inline">PulseOS</span>
            <span className="hidden text-fg-muted/50 sm:inline" aria-hidden="true">
              /
            </span>
            <span className="truncate font-medium text-fg">{sectionTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-full border border-line bg-hover px-3.5 text-[13px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg sm:inline-flex"
              aria-label="Open command palette"
            >
              <Icon name="search" size={15} />
              <span>Jump to…</span>
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px]">Ctrl K</kbd>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-hover text-fg-muted transition-colors hover:text-fg"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-hover text-fg-muted transition-colors hover:text-pulse md:hidden"
              aria-label="Sign out"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-[1280px] flex-1 px-4 pb-28 pt-8 sm:px-8 md:pb-16 md:pt-10"
        >
          {children}
        </motion.main>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────────── */}
      <nav
        className="no-print fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[22px] border border-line bg-surface/85 p-1.5 shadow-elevation-high backdrop-blur-xl md:hidden"
        aria-label="App"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium ${
                active ? "text-teal" : "text-fg-muted"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="tab-active"
                  className="absolute inset-0 rounded-2xl bg-hover"
                  transition={reduce ? { duration: 0 } : { type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  aria-hidden="true"
                />
              )}
              <span className="relative">
                <Icon name={item.icon} size={20} />
              </span>
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
