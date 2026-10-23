"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/use-reduced-motion";

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
  const reducedMotion = useReducedMotion();

  // Color state for the 3 story panels
  const [color, setColor] = useState("#FFD3D8");
  const [glowColor, setGlowColor] = useState("#FF4D5E");

  // GPU optimization: unmount when hidden behind #app, remount near #cta
  const [isMounted, setIsMounted] = useState(true);
  const [isInteractive, setIsInteractive] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isCancelled = false;
    let ctx: { revert: () => void } | null = null;
    let heartbeatTween: gsap.core.Tween | null = null;

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

        // Subtle 1.2s heartbeat scale loop (pulsing by 4%) if reduced motion is disabled
        if (!reducedMotion) {
          heartbeatTween = gsap.to(tilt, {
            scale: 1.04,
            duration: 0.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }

        // 1. Hero to Story: Move heart to the right on desktop (~22vw) or centered above text on mobile, scale to 0.85
        gsap.to(wrapper, {
          x: isDesktop ? "22vw" : "0vw",
          y: isDesktop ? "0svh" : "-12svh",
          scale: 0.85,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            onLeave: () => setIsInteractive(false),
            onEnterBack: () => setIsInteractive(true),
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
      if (heartbeatTween) heartbeatTween.kill();
      if (ctx) ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-x-0 bottom-0 z-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
      style={{
        height: "70svh",
        perspective: "1000px",
        pointerEvents: isInteractive ? "auto" : "none",
        visibility: isMounted ? "visible" : "hidden",
      }}
      aria-hidden="true"
    >
      <div
        ref={tiltRef}
        className="w-full h-full max-w-[850px] flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {isMounted ? (
          <DynamicElectricLogo
            src="/media/heart.svg"
            color={color}
            glowColor={glowColor}
            scale={0.72}
            strands={4}
            bend={0.6}
            crackle={1.2}
            arcs={1}
            thickness={1.5}
            glow={1.2}
            fill={0.35}
            flicker={0.4}
            speed={1.6}
            interactive={isInteractive}
            cursorIntensity={0.75}
            cursorRadius={120}
            theme="dark"
          />
        ) : null}
      </div>
    </div>
  );
}

export default ScrollHeart;
