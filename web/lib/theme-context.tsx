"use client";

import React, { createContext, useCallback, useContext, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

/** Where the theme change visually starts (e.g. the toggle button's centre). */
export interface ThemeOrigin {
  x: number;
  y: number;
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (origin?: ThemeOrigin | React.MouseEvent) => void;
  setTheme: (theme: Theme, origin?: ThemeOrigin | React.MouseEvent) => void;
}

const STORAGE_KEY = "pulseos_theme";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

/**
 * Inline <head> script: applies the saved (or system) theme before first paint so the
 * page never flashes the wrong theme. Kept tiny and dependency-free on purpose.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(t);r.style.colorScheme=t;if(location.pathname==="/")r.classList.add("marketing")}catch(e){}})();`;

// The DOM class on <html> is the single source of truth; React subscribes to it.
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getSnapshot = (): Theme => (document.documentElement.classList.contains("light") ? "light" : "dark");
const getServerSnapshot = (): Theme => "dark";

function writeTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove(t === "light" ? "dark" : "light");
  root.classList.add(t);
  root.style.colorScheme = t;
}

function resolveOrigin(origin?: ThemeOrigin | React.MouseEvent): ThemeOrigin {
  if (origin && "currentTarget" in origin && origin.currentTarget instanceof Element) {
    const rect = origin.currentTarget.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  if (origin && "x" in origin && typeof origin.x === "number") return { x: origin.x, y: origin.y };
  return { x: window.innerWidth - 48, y: 32 };
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/**
 * Switches theme smoothly:
 * - View Transitions API: the new theme expands as a soft circle from the toggle,
 *   so every pixel (charts, glows, gradients) changes together, never piecemeal.
 * - Fallback: a whole-page cross-fade of colours.
 * - prefers-reduced-motion: instant switch.
 */
function transitionTo(next: Theme, origin?: ThemeOrigin | React.MouseEvent) {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as ViewTransitionDocument;

  if (reduce) {
    writeTheme(next);
    return;
  }

  if (typeof doc.startViewTransition === "function") {
    const { x, y } = resolveOrigin(origin);
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-r", `${radius}px`);
    root.classList.add("theme-vt");
    doc
      .startViewTransition(() => writeTheme(next))
      .finished.finally(() => root.classList.remove("theme-vt"));
    return;
  }

  root.classList.add("theme-transition");
  writeTheme(next);
  window.setTimeout(() => root.classList.remove("theme-transition"), 650);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme, origin?: ThemeOrigin | React.MouseEvent) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — theme still applies for this visit */
    }
    if (getSnapshot() !== next) transitionTo(next, origin);
  }, []);

  const toggleTheme = useCallback(
    (origin?: ThemeOrigin | React.MouseEvent) => setTheme(getSnapshot() === "dark" ? "light" : "dark", origin),
    [setTheme],
  );

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
