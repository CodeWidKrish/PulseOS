"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { toast } from "@/components/ui/toast";
import { CommandPalette } from "@/components/marketing/command-palette";
import { api } from "@/lib/api";
import { RequireSession, initialsOf, useSessionUser } from "@/lib/session";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Lab Reports",
    href: "/reports",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Vitals Tracker",
    href: "/vitals",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
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

export function AppShell(props: AppShellProps) {
  return (
    <RequireSession>
      <AppShellFrame {...props} />
    </RequireSession>
  );
}

function AppShellFrame({ children, title }: AppShellProps) {
  const user = useSessionUser();
  const role = user.role;
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  // Collapse by default on narrow screens; a manual toggle overrides the default.
  const isNarrow = useSyncExternalStore(subscribeNarrow, getNarrowSnapshot, () => false);
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | null>(null);
  const sidebarCollapsed = collapsedOverride ?? isNarrow;
  const [mobileOpen, setMobileOpen] = useState(false);
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
    toast.info("Signed out. Returning to home.");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-page)] overflow-x-hidden max-w-full">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-white/8 bg-[#0B0D12] transition-all duration-300 z-30 sticky top-0 h-screen shrink-0 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          {/* Brand & Collapse Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 overflow-hidden"
              aria-label="PulseOS Dashboard Home"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D5E] shadow-[0_0_10px_#FF4D5E] shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-semibold text-lg tracking-tight text-[#F2F4F7]">
                  Pulse<span className="text-[#8B93A1]">OS</span>
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setCollapsedOverride(!sidebarCollapsed)}
              className="p-1.5 text-[#8B93A1] hover:text-[#F2F4F7] rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5" aria-label="App Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#5EE1D2]/15 text-[#5EE1D2] font-semibold border border-[#5EE1D2]/30 shadow-sm"
                      : "text-[#8B93A1] hover:text-[#F2F4F7] hover:bg-white/5"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout at Bottom */}
        <div className="p-4 border-t border-white/8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#5EE1D2]/20 border border-[#5EE1D2]/40 text-[#5EE1D2] font-semibold text-xs flex items-center justify-center shrink-0">
              {initialsOf(user.full_name)}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#F2F4F7] truncate">
                  {user.full_name}
                </p>
                <p className="text-[11px] text-[#8B93A1] capitalize">{role}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Link
              href="/"
              className={`text-xs text-[#8B93A1] hover:text-[#F2F4F7] transition-colors ${
                sidebarCollapsed ? "hidden" : "block"
              }`}
            >
              ← Marketing
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-[#FF4D5E] hover:underline focus-visible:outline-none"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-white/8 bg-[#07090D]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-[#8B93A1] hover:text-[#F2F4F7] rounded-lg"
              aria-label="Open mobile menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8B93A1]">
              <Link href="/dashboard" className="hover:text-[#F2F4F7] transition-colors">
                PulseOS
              </Link>
              <span>/</span>
              <span className="text-[#F2F4F7] font-medium capitalize">
                {title || pathname.replace("/", "").replace("-", " ") || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#5EE1D2]/10 border border-[#5EE1D2]/30 text-[#5EE1D2] capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5EE1D2]" />
              {role}
            </span>

            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs text-[#8B93A1] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
              aria-label="Open command palette"
            >
              <span>Search or jump to...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-black/40 rounded border border-white/10 text-white font-mono">
                Ctrl K
              </kbd>
            </button>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-white/10 bg-white/[0.04] text-[#8B93A1] hover:text-[#F2F4F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EE1D2]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4 text-[#FFB86B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#5EE1D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Quick Upload Action */}
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#5EE1D2] text-[#07090D] hover:bg-[#5EE1D2]/90 transition-all hover:scale-[1.02] shadow-sm"
            >
              <span>+</span>
              <span className="hidden sm:inline">Upload Report</span>
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-72 bg-[#0B0D12] h-full p-6 flex flex-col justify-between border-r border-white/10 animate-scaleUp">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <span className="font-semibold text-lg text-white">PulseOS App</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1 text-[#8B93A1] hover:text-white"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <nav className="mt-6 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#F2F4F7] hover:bg-white/5"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 text-center text-xs font-semibold text-[#FF4D5E] border border-[#FF4D5E]/30 rounded-full hover:bg-[#FF4D5E]/10"
              >
                Sign out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
