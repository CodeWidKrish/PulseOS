"use client";

import React, { useEffect, useRef } from "react";
import { MARKETING_CONTENT } from "@/lib/content";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function PinnedStory() {
  const containerRef = useRef<HTMLElement | null>(null);
  const railBarRef = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined" || reducedMotion) return;

    let isCancelled = false;
    let ctx: { revert: () => void } | null = null;

    // Load GSAP only when story section is within proximity (600px margin)
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
          if (isCancelled || !containerRef.current) return;

          gsap.registerPlugin(ScrollTrigger);

          ctx = gsap.context(() => {
            const panels = gsap.utils.toArray<HTMLElement>(".story-panel");

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=300%",
                pin: true,
                scrub: 0.6,
              },
              defaults: { ease: "none" },
            });

            // Animate progress rail
            if (railBarRef.current) {
              tl.fromTo(
                railBarRef.current,
                { scaleY: 0 },
                { scaleY: 1, duration: 3 },
                0
              );
            }

            // Transition panel 0 -> 1 -> 2
            if (panels.length >= 3) {
              tl.to(panels[0], { opacity: 0, y: -28, duration: 0.35 }, 0.9)
                .fromTo(
                  panels[1],
                  { opacity: 0, y: 28 },
                  { opacity: 1, y: 0, duration: 0.35 },
                  1.1
                )
                .to(panels[1], { opacity: 0, y: -28, duration: 0.35 }, 1.9)
                .fromTo(
                  panels[2],
                  { opacity: 0, y: 28 },
                  { opacity: 1, y: 0, duration: 0.35 },
                  2.1
                );
            }
          }, containerRef);
        });
      },
      { rootMargin: "600px 0px 600px 0px" }
    );

    observer.observe(el);

    return () => {
      isCancelled = true;
      observer.disconnect();
      if (ctx) ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={containerRef}
      id="story"
      aria-label={MARKETING_CONTENT.story.sectionAriaLabel}
      className="relative z-10 h-[100svh] overflow-hidden"
    >
      {/* Story Panels Container */}
      <div className="absolute left-6 sm:left-[7vw] lg:left-[120px] top-1/2 -translate-y-1/2 max-w-[520px] w-[86vw] h-[340px] pointer-events-none md:pointer-events-auto">
        {MARKETING_CONTENT.story.panels.map((panel, index) => (
          <article
            key={panel.id}
            className={`story-panel absolute left-0 top-1/2 -translate-y-1/2 w-full transition-opacity duration-300 ${
              index === 0 ? "opacity-100" : "opacity-0"
            }`}
          >
            <h2 className="font-semibold tracking-[-0.04em] leading-[1.03] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F2F4F7]">
              {panel.title}
            </h2>
            <p className="mt-4 text-[#8B93A1] font-light text-base sm:text-lg leading-[1.55] max-w-[40ch]">
              {panel.description}
            </p>
          </article>
        ))}
      </div>

      {/* Vertical Progress Rail */}
      <div
        className="hidden md:block absolute right-6 sm:right-[3vw] lg:right-10 top-1/2 -translate-y-1/2 w-[2px] h-[120px] bg-white/10 rounded-full overflow-hidden"
        aria-hidden="true"
      >
        <span
          ref={railBarRef}
          className="block h-full w-full bg-[#F2F4F7] origin-top scale-y-0"
        />
      </div>
    </section>
  );
}
