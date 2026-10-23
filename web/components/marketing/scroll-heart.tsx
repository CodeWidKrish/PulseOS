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

  const reducedMotion = useReducedMotion();
  const { bpm, setBpm, subscribeBeat } = useHeart();

  // Dynamic state
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [color, setColor] = useState("#FFD3D8");
  const [glowColor, setGlowColor] = useState("#FF4D5E");
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Dynamic interactive feedback: hold-to-charge in hero
  const [glowMultiplier, setGlowMultiplier] = useState(1.0);
  const [cursorIntensity, setCursorIntensity] = useState(0.75);

  const chargeStartTimeRef = useRef<number | null>(null);
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isChargingRef = useRef(false);

  // Persistent Biological heartbeat rhythm (lub-dub) active throughout whole page
  useHeartbeat({
    wrapperRef: tiltRef,
    active: true,
    onGlowPulse: (strength) => {
      outlineRef.current?.beat(strength);
    },
  });

  // Keep beat subscribers synchronized
  useEffect(() => {
    const unsubscribe = subscribeBeat((strength = 1) => {
      outlineRef.current?.beat(strength);
    });
    return unsubscribe;
  }, [subscribeBeat]);

  // Pointer-events: none everywhere except over hero
  useEffect(() => {
    if (typeof window === "undefined") return;

    const heroEl = document.getElementById("hero");
    if (!heroEl) return;

    const handlePointerEnter = () => setIsHeroHovered(true);
    const handlePointerLeave = () => setIsHeroHovered(false);

    heroEl.addEventListener("pointerenter", handlePointerEnter);
    heroEl.addEventListener("pointerleave", handlePointerLeave);

    const handleScroll = () => {
      const heroRect = heroEl.getBoundingClientRect();
      if (heroRect.bottom <= 0 || heroRect.top >= window.innerHeight) {
        setIsHeroHovered(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      heroEl.removeEventListener("pointerenter", handlePointerEnter);
      heroEl.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Spring cursor tilt & velocity response (Hero only, disabled on reduced motion)
  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") return;

    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();
    let velocityDamp = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !tiltRef.current || !isHeroHovered) return;

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

      // Cursor tilt spring: rotateX/rotateY up to 8deg, translate up to 10px
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      gsap.to(tiltRef.current, {
        rotateY: nx * 8,
        rotateX: -ny * 8,
        x: nx * 10,
        y: ny * 10,
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
  }, [reducedMotion, isHeroHovered]);

  // Hold-to-charge and release interaction in Hero
  const startCharge = useCallback(() => {
    if (reducedMotion || !isHeroHovered) return;
    isChargingRef.current = true;
    chargeStartTimeRef.current = performance.now();

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

      if (Math.random() < 0.25) {
        outlineRef.current?.beat(0.6 * (1 + progress));
      }
    }, 50);
  }, [bpm, setBpm, reducedMotion, isHeroHovered]);

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
      outlineRef.current?.ripple();
      setGlowMultiplier(1.0);
      setCursorIntensity(0.75);
    }
  }, [bpm, setBpm]);

  // Master GSAP Timeline across entire page scroll + Background cross-fade
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

        // Keyframe definitions matching prompt specifications:
        // Hero: centered, large (scale 1), anatomy fully visible, behind headline and below CTAs
        // Story: move right on desktop (x ~22vw) or above text on mobile, scale 0.85
        // Demo: small (scale 0.45), left side, calm
        // Dashboard: small (scale 0.4), top-right, switch theme to 'light' (crisp electric ink)
        // Security: back to dark theme, center, scale 0.7, slow
        // FAQ: theme 'light', scale 0.35, right edge
        // Closing CTA: dark theme, centered, scale 1.1, beating strongly
        // Footer: heart settles at bottom of viewport, scale 0.6, final slow beat. At 100% still fully visible.

        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: reducedMotion ? false : 0.8,
          },
        });

        // 1. Hero (0 to 1.0) -> Story
        masterTl
          .fromTo(
            wrapper,
            {
              x: "0vw",
              y: "0svh",
              scale: isDesktop ? 1.0 : 0.95,
              opacity: 1,
            },
            {
              x: isDesktop ? "22vw" : "0vw",
              y: isDesktop ? "0svh" : "-18svh",
              scale: isDesktop ? 0.85 : 0.75,
              opacity: 1,
              duration: 1.0,
              ease: "power1.inOut",
            }
          )
          // 2. Story Panels hold (1.0 to 4.0) with subtle 3D tilt rotateY
          .to(
            wrapper,
            {
              x: isDesktop ? "22vw" : "0vw",
              y: isDesktop ? "0svh" : "-18svh",
              scale: isDesktop ? 0.85 : 0.75,
              opacity: 1,
              duration: 3.0,
              ease: "none",
            }
          );

        // Subtle 3D tilt across story panels
        if (!reducedMotion) {
          masterTl.fromTo(
            tilt,
            { rotateY: -10 },
            { rotateY: 10, duration: 3.0, ease: "none" },
            1.0
          );
        }

        // 3. Story -> Demo: small (scale 0.45), left side, calm
        masterTl.to(wrapper, {
          x: isDesktop ? "-26vw" : "-18vw",
          y: isDesktop ? "4svh" : "-12svh",
          scale: isDesktop ? 0.45 : 0.4,
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
        });

        // 4. Demo -> Dashboard: small (scale 0.4), top-right
        masterTl.to(wrapper, {
          x: isDesktop ? "28vw" : "20vw",
          y: isDesktop ? "-20svh" : "-22svh",
          scale: isDesktop ? 0.4 : 0.35,
          opacity: 0.92,
          duration: 1.6,
          ease: "power2.inOut",
        });

        // 5. Dashboard -> Security: back to dark, center, scale 0.7, slow
        masterTl.to(wrapper, {
          x: "0vw",
          y: "0svh",
          scale: isDesktop ? 0.7 : 0.6,
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
        });

        // 6. Security -> FAQ: theme 'light', scale 0.35, right edge
        masterTl.to(wrapper, {
          x: isDesktop ? "30vw" : "22vw",
          y: isDesktop ? "6svh" : "-10svh",
          scale: isDesktop ? 0.35 : 0.32,
          opacity: 0.92,
          duration: 1.2,
          ease: "power2.inOut",
        });

        // 7. FAQ -> Closing CTA: dark theme, centered, scale 1.1, beating strongly
        masterTl.to(wrapper, {
          x: "0vw",
          y: "-4svh",
          scale: isDesktop ? 1.1 : 1.0,
          opacity: 1,
          duration: 1.0,
          ease: "power2.out",
        });

        // 8. Closing CTA -> Footer: heart settles at bottom of viewport, scale 0.6, fully visible
        masterTl.to(wrapper, {
          x: "0vw",
          y: isDesktop ? "22svh" : "20svh",
          scale: isDesktop ? 0.6 : 0.55,
          opacity: 1,
          duration: 0.6,
          ease: "power1.out",
        });

        // Section Triggers for Themes, Background Color Cross-fade, and BPM states
        const setBg = (bgHex: string) => {
          gsap.to("#fixed-page-bg", {
            backgroundColor: bgHex,
            duration: 0.45,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        // Hero
        ScrollTrigger.create({
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          onEnter: () => {
            setTheme("dark");
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            setBpm(72);
            setBg("#07090D");
          },
          onEnterBack: () => {
            setTheme("dark");
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            setBpm(72);
            setBg("#07090D");
          },
        });

        // Story 3 panels: step colors red -> teal -> amber
        ScrollTrigger.create({
          trigger: "#story",
          start: "top top",
          end: "+=300%",
          onEnter: () => {
            setTheme("dark");
            setBg("#07090D");
          },
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
          onLeaveBack: () => {
            setTheme("dark");
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            setBg("#07090D");
          },
        });

        // Demo (calm)
        ScrollTrigger.create({
          trigger: "#demo",
          start: "top 60%",
          end: "bottom 30%",
          onEnter: () => {
            setTheme("dark");
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            setBpm(68);
            setBg("#07090D");
          },
          onEnterBack: () => {
            setTheme("dark");
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            setBpm(68);
            setBg("#07090D");
          },
        });

        // Dashboard (#app): light theme (crisp electric ink) & background cross-fades to mist #F4F5F7
        ScrollTrigger.create({
          trigger: "#app",
          start: "top 60%",
          end: "bottom 30%",
          onEnter: () => {
            setTheme("light");
            setColor("#1E2530");
            setGlowColor("#FF4D5E");
            setBpm(72);
            setBg("#F4F5F7");
          },
          onLeaveBack: () => {
            setTheme("dark");
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            setBpm(68);
            setBg("#07090D");
          },
        });

        // Security: back to dark theme, slow beat
        ScrollTrigger.create({
          trigger: "#security",
          start: "top 60%",
          end: "bottom 30%",
          onEnter: () => {
            setTheme("dark");
            setColor("#D4FFF9");
            setGlowColor("#5EE1D2");
            setBpm(64);
            setBg("#07090D");
          },
          onLeaveBack: () => {
            setTheme("light");
            setColor("#1E2530");
            setGlowColor("#FF4D5E");
            setBpm(72);
            setBg("#F4F5F7");
          },
        });

        // FAQ: theme 'light' & background mist #F4F5F7
        ScrollTrigger.create({
          trigger: "#faq",
          start: "top 60%",
          end: "bottom 30%",
          onEnter: () => {
            setTheme("light");
            setColor("#1E2530");
            setGlowColor("#FF4D5E");
            setBpm(68);
            setBg("#F4F5F7");
          },
          onLeaveBack: () => {
            setTheme("dark");
            setColor("#D4FFF9");
            setGlowColor("#5EE1D2");
            setBpm(64);
            setBg("#07090D");
          },
        });

        // Closing CTA: dark theme, strong beat
        ScrollTrigger.create({
          trigger: "#cta",
          start: "top 60%",
          end: "bottom bottom",
          onEnter: () => {
            setTheme("dark");
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            setBpm(84);
            setBg("#07090D");
          },
          onLeaveBack: () => {
            setTheme("light");
            setColor("#1E2530");
            setGlowColor("#FF4D5E");
            setBpm(68);
            setBg("#F4F5F7");
          },
        });

        // Footer: final slow beat, dark theme, settled at bottom
        ScrollTrigger.create({
          trigger: "footer",
          start: "top bottom",
          end: "bottom bottom",
          onEnter: () => {
            setTheme("dark");
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            setBpm(60);
            setBg("#07090D");
          },
          onLeaveBack: () => {
            setTheme("dark");
            setColor("#FFD3D8");
            setGlowColor("#FF4D5E");
            setBpm(84);
            setBg("#07090D");
          },
        });
      });
    });

    return () => {
      isCancelled = true;
      if (ctx) ctx.revert();
    };
  }, [reducedMotion, setBpm]);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-x-0 top-0 w-full h-[100svh] z-[1] flex items-center justify-center transition-opacity duration-300 pointer-events-none"
      style={{
        perspective: "1000px",
        pointerEvents: isHeroHovered ? "auto" : "none",
      }}
      aria-hidden="true"
      onPointerDown={startCharge}
      onPointerUp={endCharge}
      onPointerCancel={endCharge}
    >
      <div
        ref={tiltRef}
        className="relative w-full h-full max-w-[900px] flex items-center justify-center pointer-events-none"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
          pointerEvents: isHeroHovered ? "auto" : "none",
        }}
      >
        <DynamicElectricLogo
          ref={outlineRef}
          src="/media/heart-plain.svg"
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
          interactive={isHeroHovered}
          cursorIntensity={cursorIntensity}
          cursorRadius={120}
          theme={theme}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}

export default ScrollHeart;
