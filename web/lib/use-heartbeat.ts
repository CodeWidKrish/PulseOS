"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./use-reduced-motion";
import { useHeart } from "./heart-context";

interface UseHeartbeatOptions {
  wrapperRef: React.RefObject<HTMLElement | null>;
  isHeroVisible?: boolean;
  onGlowPulse?: (strength: number) => void;
}

export function useHeartbeat({
  wrapperRef,
  isHeroVisible = true,
  onGlowPulse,
}: UseHeartbeatOptions) {
  const { bpm, beat } = useHeart();
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

  useEffect(() => {
    if (reducedMotion || !isHeroVisible) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (dubTimeoutIdRef.current) clearTimeout(dubTimeoutIdRef.current);
      return;
    }

    let isAlive = true;

    const scheduleNextCycle = () => {
      if (!isAlive) return;

      // 3% organic biological variance so the rhythm is never robotic
      const variance = 1 + (Math.random() * 0.06 - 0.03);
      const cycleMs = (60 / Math.max(40, bpm)) * 1000 * variance;

      // 1. Primary "Lub" Beat
      if (isTabVisibleRef.current && isHeroVisible) {
        beat(1.0, false);
        onGlowPulse?.(1.0);

        if (wrapperRef.current) {
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
        }
      }

      // 2. Secondary "Dub" Beat about 0.28s later
      dubTimeoutIdRef.current = setTimeout(() => {
        if (!isAlive || !isTabVisibleRef.current || !isHeroVisible) return;

        beat(0.65, true);
        onGlowPulse?.(0.6);

        if (wrapperRef.current) {
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
      }, 280);

      // Schedule next full heartbeat cycle
      timeoutIdRef.current = setTimeout(scheduleNextCycle, cycleMs);
    };

    scheduleNextCycle();

    return () => {
      isAlive = false;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (dubTimeoutIdRef.current) clearTimeout(dubTimeoutIdRef.current);
    };
  }, [bpm, isHeroVisible, reducedMotion, beat, wrapperRef, onGlowPulse]);
}
