"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("theme-transition");
  if (t === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }
  const timer = setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 300);
  return () => clearTimeout(timer);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("pulseos_theme") as Theme | null;
    let initial: Theme = "dark";
    if (saved === "light" || saved === "dark") {
      initial = saved;
    } else {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      initial = prefersLight ? "light" : "dark";
    }

    requestAnimationFrame(() => {
      setThemeState(initial);
      applyTheme(initial);
    });
  }, []);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem("pulseos_theme", nextTheme);
    applyTheme(nextTheme);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
