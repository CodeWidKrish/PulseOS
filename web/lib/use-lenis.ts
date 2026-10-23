"use client";

import { useEffect, useRef, useCallback } from "react";
import type Lenis from "lenis";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Initializes Lenis smooth scrolling connected directly to GSAP ScrollTrigger ticker.
 * Fully honors prefers-reduced-motion and touch device native momentum scrolling.
 * Dynamically loads dependencies only on desktop pointer devices.
 */
export function useLenis() {
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (reducedMotion) {
      return;
    }

    // Touch devices (phones and tablets) have hardware momentum scrolling natively.
    // Lenis is optimized for precision pointer / desktop mousewheel.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      return;
    }

    let isDestroyed = false;
    let cleanupTicker: (() => void) | null = null;

    Promise.all([
      import("lenis"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: LenisClass }, { default: gsap }, { ScrollTrigger }]) => {
      if (isDestroyed) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new LenisClass({
        lerp: 0.08,
        wheelMultiplier: 1.05,
        touchMultiplier: 1.5,
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);

      const tickerCallback = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);

      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          if (lenisRef.current && !reducedMotion) {
            lenisRef.current.scrollTo(el as HTMLElement, { offset: -70 });
          } else {
            el.scrollIntoView({
              behavior: reducedMotion ? "auto" : "smooth",
            });
          }
        }
      };

      document.addEventListener("click", handleAnchorClick);

      cleanupTicker = () => {
        document.removeEventListener("click", handleAnchorClick);
        gsap.ticker.remove(tickerCallback);
        lenis.destroy();
        lenisRef.current = null;
      };
    });

    return () => {
      isDestroyed = true;
      if (cleanupTicker) {
        cleanupTicker();
      }
    };
  }, [reducedMotion]);

  const scrollTo = useCallback(
    (target: string | HTMLElement, offset: number = -60) => {
      if (typeof window === "undefined") return;
      const element =
        typeof target === "string" ? document.querySelector(target) : target;
      if (!element) return;

      if (lenisRef.current && !reducedMotion) {
        lenisRef.current.scrollTo(element as HTMLElement, { offset });
      } else {
        (element as HTMLElement).scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
    },
    [reducedMotion]
  );

  return { scrollTo };
}
