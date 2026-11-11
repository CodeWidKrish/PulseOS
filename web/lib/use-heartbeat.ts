"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./use-reduced-motion";
import { useHeart } from "./heart-context";

interface UseHeartbeatOptions {
  wrapperRef: React.RefObject<HTMLElement | null>;
  active?: boolean;
  onGlowPulse?: (strength: number) => void;
}

export function useHeartbeat({
  wrapperRef,
  active = true,
  onGlowPulse,
}: UseHeartbeatOptions) {
  const { bpm, beat, soundEnabled, subscribeBeat } = useHeart();
  const reducedMotion = useReducedMotion();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const dubTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isTabVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Visual wrapper spring pulse listener (triggered by either timer or audio clock scheduler)
  useEffect(() => {
    if (reducedMotion || !active) return;

    const unsubscribe = subscribeBeat((strength = 1, isDub = false) => {
      if (!isTabVisibleRef.current || !wrapperRef.current) return;
      onGlowPulse?.(strength);

      if (!isDub) {
        gsap.timeline()
          .to(wrapperRef.current, {
            scale: 1.045,
            duration: 0.12,
            ease: "power2.out",
          })
          .to(wrapperRef.current, {
            scale: 1.0,
            duration: 0.16,
            ease: "power2.inOut",
          });
      } else {
        gsap.timeline()
          .to(wrapperRef.current, {
            scale: 1.025,
            duration: 0.1,
            ease: "power2.out",
          })
          .to(wrapperRef.current, {
            scale: 1.0,
            duration: 0.14,
            ease: "power2.inOut",
          });
      }
    });

    return unsubscribe;
  }, [reducedMotion, active, subscribeBeat, wrapperRef, onGlowPulse]);

  // When sound is off, maintain the timer-driven rhythm
  useEffect(() => {
    if (reducedMotion || !active || soundEnabled) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (dubTimeoutIdRef.current) clearTimeout(dubTimeoutIdRef.current);
      return;
    }

    let isAlive = true;

    const scheduleNextCycle = () => {
      if (!isAlive) return;

      // ±3% natural variation
      const variance = 1 + (Math.random() * 0.06 - 0.03);
      const cycleMs = (60 / Math.max(40, bpm)) * 1000 * variance;
      const s1ToS2Ms = Math.round(300 * Math.pow(72 / bpm, 0.22));

      // 1. Primary "Lub" Beat
      if (isTabVisibleRef.current && active) {
        beat(1.0, false);
      }

      // 2. Secondary "Dub" Beat about 300ms later
      dubTimeoutIdRef.current = setTimeout(() => {
        if (!isAlive || !isTabVisibleRef.current || !active) return;
        beat(0.65, true);
      }, s1ToS2Ms);

      // Schedule next full heartbeat cycle
      timeoutIdRef.current = setTimeout(scheduleNextCycle, cycleMs);
    };

    scheduleNextCycle();

    return () => {
      isAlive = false;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (dubTimeoutIdRef.current) clearTimeout(dubTimeoutIdRef.current);
    };
  }, [bpm, active, reducedMotion, soundEnabled, beat]);
}
