"use client";

import React, { useEffect, useRef } from "react";
import { useHeart } from "@/lib/heart-context";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface Cell {
  x: number;
  y: number;
  radius: number;
  baseVx: number;
  baseVy: number;
  alpha: number;
}

export function AmbientBloodCells() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { subscribeBeat } = useHeart();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || typeof window === "undefined") return;

    // Skip on low-power mobile devices (<=4 cores) to preserve 60fps budget
    const cores = navigator.hardwareConcurrency || 8;
    if (window.innerWidth < 768 && cores <= 4) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isAlive = true;
    let isVisible = true;
    let rafId = 0;
    let boost = 1.0;
    let glow = 1.0;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = (canvas.width = (container.clientWidth || 800) * dpr);
    let height = (canvas.height = (container.clientHeight || 800) * dpr);

    const resize = () => {
      if (!canvas || !container) return;
      width = canvas.width = container.clientWidth * dpr;
      height = canvas.height = container.clientHeight * dpr;
    };
    window.addEventListener("resize", resize);

    // Create 38 organic erythrocytes (soft red blood cells)
    const cellCount = 38;
    const cells: Cell[] = Array.from({ length: cellCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.5;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: (4 + Math.random() * 6) * dpr,
        baseVx: Math.cos(angle) * speed * dpr,
        baseVy: Math.sin(angle) * speed * dpr,
        alpha: 0.12 + Math.random() * 0.18,
      };
    });

    const unsubscribe = subscribeBeat((strength = 1) => {
      // Accelerate and brighten on every beat
      boost = Math.min(boost + 1.2 * strength, 2.5);
      glow = Math.min(glow + 0.8 * strength, 2.2);
    });

    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !rafId) {
        rafId = requestAnimationFrame(render);
      }
    });
    io.observe(container);

    const cx = width / 2;
    const cy = height / 2;

    const render = () => {
      if (!isAlive || !isVisible) {
        rafId = 0;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Dampen boost smoothly back to 1.0
      boost += (1.0 - boost) * 0.06;
      glow += (1.0 - glow) * 0.06;

      for (let i = 0; i < cellCount; i++) {
        const c = cells[i];

        // Slight drift bias toward the central circulatory hub
        const dx = cx - c.x;
        const dy = cy - c.y;
        const dist = Math.hypot(dx, dy) || 1;
        const inwardForce = (0.05 * dpr) / Math.max(dist, 100);

        c.x += (c.baseVx + dx * inwardForce) * boost;
        c.y += (c.baseVy + dy * inwardForce) * boost;

        // Wrap around borders
        if (c.x < -20) c.x = width + 20;
        if (c.x > width + 20) c.x = -20;
        if (c.y < -20) c.y = height + 20;
        if (c.y > height + 20) c.y = -20;

        // Draw soft, luminous erythrocyte disc
        const currentAlpha = Math.min(c.alpha * glow, 0.45);
        const rad = c.radius * (0.95 + 0.1 * glow);

        const gradient = ctx.createRadialGradient(
          c.x,
          c.y,
          0,
          c.x,
          c.y,
          rad * 1.8
        );
        gradient.addColorStop(0, `rgba(255, 77, 94, ${currentAlpha})`);
        gradient.addColorStop(0.5, `rgba(180, 20, 45, ${currentAlpha * 0.5})`);
        gradient.addColorStop(1, "rgba(7, 9, 13, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(c.x, c.y, rad * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      isAlive = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      io.disconnect();
      unsubscribe();
    };
  }, [reducedMotion, subscribeBeat]);

  if (reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden opacity-60"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}

export default AmbientBloodCells;
