"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useHeart } from "@/lib/heart-context";
import { useHeartbeat } from "@/lib/use-heartbeat";
import type { ElectricLogoHandle } from "@/components/ui/ElectricLogo";

// Dynamically load ElectricLogo with ssr: false so it doesn't block first paint
const DynamicElectricLogo = dynamic(
  () => import("@/components/ui/ElectricLogo"),
  {
    ssr: false,
    loading: () => null,
  }
);

export function ScrollHeart() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const outlineRef = useRef<ElectricLogoHandle | null>(null);
  const vesselsRef = useRef<ElectricLogoHandle | null>(null);

  const reducedMotion = useReducedMotion();
  const { bpm, setBpm, subscribeBeat, soundEnabled, setSoundEnabled } = useHeart();

  // State
  const [color, setColor] = useState("#FFD3D8");
  const [glowColor, setGlowColor] = useState("#FF4D5E");
  const [isMounted, setIsMounted] = useState(true);
  const [isInteractive, setIsInteractive] = useState(true);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  // Dynamic interactive feedback: hold-to-charge
  const [glowMultiplier, setGlowMultiplier] = useState(1.0);
  const [cursorIntensity, setCursorIntensity] = useState(0.75);

  const chargeStartTimeRef = useRef<number | null>(null);
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isChargingRef = useRef(false);

  // Biological heartbeat rhythm (72 BPM lub-dub) with GSAP scale
  useHeartbeat({
    wrapperRef: tiltRef,
    isHeroVisible,
    onGlowPulse: (strength) => {
      // Glow pulse on beat
      outlineRef.current?.beat(strength);
      vesselsRef.current?.beat(strength * 0.7);
    },
  });

  // Keep beat subscribers updated
  useEffect(() => {
    const unsubscribe = subscribeBeat((strength = 1) => {
      outlineRef.current?.beat(strength);
      vesselsRef.current?.beat(strength * 0.7);
    });
    return unsubscribe;
  }, [subscribeBeat]);

  // Spring cursor tilt & velocity response
  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") return;

    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();
    let velocityDamp = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !tiltRef.current || !isHeroVisible) return;

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const vx = Math.abs(e.clientX - lastX) / dt;
      const vy = Math.abs(e.clientY - lastY) / dt;
      const speed = Math.hypot(vx, vy);

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;

      // Fast cursor motion induces micro-arcs
      if (speed > 1.8 && now - velocityDamp > 400) {
        velocityDamp = now;
        outlineRef.current?.beat(0.4);
      }

      // Cursor tilt spring: rotateX/rotateY up to 10deg, translate up to 12px
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      gsap.to(tiltRef.current, {
        rotateY: nx * 10,
        rotateX: -ny * 10,
        x: nx * 12,
        y: ny * 12,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handlePointerLeave = () => {
      if (!tiltRef.current) return;
      gsap.to(tiltRef.current, {
        rotateY: 0,
        rotateX: 0,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [reducedMotion, isHeroVisible]);

  // Hold-to-charge and release interaction
  const startCharge = useCallback(() => {
    if (reducedMotion) return;
    isChargingRef.current = true;
    chargeStartTimeRef.current = performance.now();

    // Gradually elevate BPM from current to 120 and raise intensity
    const startBpm = bpm;
    const startTime = performance.now();

    if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);

    chargeIntervalRef.current = setInterval(() => {
      if (!isChargingRef.current) return;
      const elapsed = (performance.now() - startTime) / 2000;
      const progress = Math.min(1, elapsed);

      const targetBpm = Math.round(startBpm + (120 - startBpm) * progress);
      setBpm(targetBpm);
      setGlowMultiplier(1 + progress * 0.9);
      setCursorIntensity(0.75 + progress * 0.75);

      // Pulse micro-ripples as it charges
      if (Math.random() < 0.25) {
        outlineRef.current?.beat(0.6 * (1 + progress));
      }
    }, 50);
  }, [bpm, setBpm, reducedMotion]);

  const endCharge = useCallback(() => {
    if (!isChargingRef.current) return;
    isChargingRef.current = false;

    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }

    const duration = chargeStartTimeRef.current
      ? performance.now() - chargeStartTimeRef.current
      : 0;

    if (duration > 300) {
      // Powerful discharge sequence
      outlineRef.current?.ripple(undefined, undefined, 2.5);
      vesselsRef.current?.ripple(undefined, undefined, 2.0);

      // Strong double beat
      outlineRef.current?.beat(2.4);
      setTimeout(() => {
        outlineRef.current?.beat(1.8);
      }, 220);

      // Flash scale feedback
      if (tiltRef.current) {
        gsap.timeline()
          .to(tiltRef.current, { scale: 1.08, duration: 0.15, ease: "power3.out" })
          .to(tiltRef.current, { scale: 1.0, duration: 0.35, ease: "power2.inOut" });
      }

      // Ease BPM back to 72 over 3 seconds
      const currentBpm = bpm;
      const revertStart = performance.now();
      const revertDuration = 3000;

      const revertInterval = setInterval(() => {
        const p = Math.min(1, (performance.now() - revertStart) / revertDuration);
        const nextBpm = Math.round(currentBpm + (72 - currentBpm) * p);
        setBpm(nextBpm);
        setGlowMultiplier(1 + (1 - p) * 0.9);
        setCursorIntensity(0.75 + (1 - p) * 0.75);

        if (p >= 1) {
          clearInterval(revertInterval);
          setBpm(72);
          setGlowMultiplier(1.0);
          setCursorIntensity(0.75);
        }
      }, 50);
    } else {
      // Quick click: standard ripple
      outlineRef.current?.ripple();
      setGlowMultiplier(1.0);
      setCursorIntensity(0.75);
    }
  }, [bpm, setBpm]);

  // GSAP ScrollTrigger story integration
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isCancelled = false;
    let ctx: { revert: () => void } | null = null;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (isCancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const wrapper = wrapperRef.current;
        const tilt = tiltRef.current;
        if (!wrapper || !tilt) return;

        const isDesktop = window.innerWidth >= 900;

        // 1. Hero to Story: Move heart to the right on desktop (~22vw) or centered above text on mobile, scale to 0.85
        gsap.to(wrapper, {
          x: isDesktop ? "22vw" : "0vw",
          y: isDesktop ? "0svh" : "-10svh",
          scale: 0.85,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            onLeave: () => {
              setIsInteractive(false);
              setIsHeroVisible(false);
            },
            onEnterBack: () => {
              setIsInteractive(true);
              setIsHeroVisible(true);
            },
          },
        });

        // 2. Story Panels: 3D tilt rotateY (-12deg to 12deg) and color state transitions
        gsap.fromTo(
          tilt,
          { rotateY: -12 },
          {
            rotateY: 12,
            ease: "none",
            scrollTrigger: {
              trigger: "#story",
              start: "top top",
              end: "+=300%",
              scrub: 0.6,
              onUpdate: (self) => {
                const p = self.progress;
                if (p < 0.33) {
                  setColor("#FFD3D8");
                  setGlowColor("#FF4D5E");
                } else if (p < 0.66) {
                  setColor("#D4FFF9");
                  setGlowColor("#5EE1D2");
                } else {
                  setColor("#FFE6C2");
                  setGlowColor("#FFB86B");
                }
              },
            },
          }
        );

        // 3. Fade out before light dashboard section (#app) and unmount to save GPU time
        gsap.to(wrapper, {
          opacity: 0,
          scale: 0.75,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "#demo",
            start: "top 60%",
            end: "bottom 30%",
            scrub: true,
            onLeave: () => {
              setIsMounted(false);
            },
            onEnterBack: () => {
              setIsMounted(true);
            },
          },
        });

        // 4. Remount when approaching closing CTA (#cta)
        ScrollTrigger.create({
          trigger: "#cta",
          start: "top 95%",
          end: "bottom bottom",
          onEnter: () => {
            setIsMounted(true);
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            gsap.to(wrapper, {
              x: 0,
              y: "-5svh",
              scale: 0.95,
              opacity: 0.9,
              duration: 0.8,
              ease: "power3.out",
            });
          },
          onLeaveBack: () => {
            setIsMounted(false);
          },
        });
      });
    });

    return () => {
      isCancelled = true;
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <>
      {/* Sound Toggle (Acoustic Web Audio Lub-Dub, off by default) */}
      <div className="fixed top-3.5 right-24 sm:right-32 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all ${
            soundEnabled
              ? "bg-[#FF4D5E]/15 border-[#FF4D5E]/40 text-[#FF4D5E] shadow-[0_0_12px_rgba(255,77,94,0.3)]"
              : "bg-white/[0.04] border-white/10 text-[#8B93A1] hover:text-[#F2F4F7]"
          }`}
          aria-label={soundEnabled ? "Mute heartbeat audio" : "Enable heartbeat audio"}
          aria-pressed={soundEnabled}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {soundEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H2v-6h3.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l4-4m0 0l-4-4m4 4H13" />
            )}
          </svg>
          <span className="hidden sm:inline font-mono text-[11px]">{bpm} BPM</span>
        </button>
      </div>

      {/* Anatomical Heart Wrapper: Positioned across upper headline & below CTAs */}
      <div
        ref={wrapperRef}
        className="fixed inset-x-0 top-[10svh] z-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
        style={{
          height: "76svh",
          perspective: "1000px",
          pointerEvents: isInteractive ? "auto" : "none",
          visibility: isMounted ? "visible" : "hidden",
        }}
        aria-hidden="true"
        onPointerDown={startCharge}
        onPointerUp={endCharge}
        onPointerCancel={endCharge}
      >
        <div
          ref={tiltRef}
          className="relative w-full h-full max-w-[850px] flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {isMounted ? (
            <>
              {/* Layer 1: Anatomical Heart Outline & Chambers */}
              <DynamicElectricLogo
                ref={outlineRef}
                src="/media/heart-anatomy.svg"
                color={color}
                glowColor={glowColor}
                scale={0.72}
                strands={4}
                bend={0.6}
                crackle={1.2}
                arcs={1}
                thickness={1.5}
                glow={1.3 * glowMultiplier}
                fill={0.5}
                flicker={0.4}
                speed={1.6}
                interactive={isInteractive}
                cursorIntensity={cursorIntensity}
                cursorRadius={120}
                theme="dark"
                className="absolute inset-0"
              />

              {/* Layer 2: Branching Coronary Blood Vessels */}
              <DynamicElectricLogo
                ref={vesselsRef}
                src="/media/heart-vessels.svg"
                color="#FFB3BC"
                glowColor="#C81E3A"
                scale={0.72}
                strands={2}
                thickness={1}
                glow={0.8 * glowMultiplier}
                crackle={0.8}
                arcs={0}
                fill={0}
                speed={1.6}
                intensity={0.8}
                interactive={false}
                theme="dark"
                className="absolute inset-0 pointer-events-none"
              />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default ScrollHeart;
