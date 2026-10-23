"use client";

import React, { useEffect, useRef } from "react";
import { useHeart } from "@/lib/heart-context";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function LiveEcgStrip() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { subscribeBeat } = useHeart();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (reducedMotion) {
      // Static clinical baseline under reduced motion
      const drawStatic = () => {
        const w = (canvas.width = canvas.clientWidth);
        const h = (canvas.height = canvas.clientHeight);
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.strokeStyle = "rgba(255, 77, 94, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      drawStatic();
      window.addEventListener("resize", drawStatic);
      return () => window.removeEventListener("resize", drawStatic);
    }

    let isAlive = true;
    let rafId = 0;
    let width = (canvas.width = canvas.clientWidth || 800);
    let height = (canvas.height = canvas.clientHeight || 48);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Array of y-offsets representing the waveform history
    const totalPoints = Math.ceil(width / 2) + 20;
    const history: number[] = new Array(totalPoints).fill(0);

    // Queue of pending PQRST wave points to inject
    const pendingPoints: number[] = [];

    const unsubscribe = subscribeBeat((strength = 1, isDub = false) => {
      const isDischarge = strength > 1.8;
      const s = isDischarge ? 1.6 : Math.min(strength, 1.4);

      if (!isDub) {
        // Full PQRST waveform
        const pqrst = [
          // Baseline buffer
          0, 0, 0.5,
          // P Wave (Atrial depolarization)
          2 * s, 4.5 * s, 6 * s, 4.5 * s, 1.5 * s, 0,
          // PR Segment
          0, 0, -1 * s,
          // Q Wave
          -4 * s,
          // R Wave (Ventricular depolarization spike)
          14 * s, 26 * s, isDischarge ? 38 : 28 * s, 12 * s,
          // S Wave
          -8 * s, -12 * s, -4 * s, 0,
          // ST Segment & T Wave (Ventricular repolarization)
          0, 1 * s, 3.5 * s, 7 * s, 8.5 * s, 7 * s, 3 * s, 0, 0, 0, 0
        ];
        pendingPoints.push(...pqrst);
      } else {
        // Minor secondary dub wave
        const dubWave = [0, 1.5 * s, 3 * s, 2 * s, 0, 0];
        pendingPoints.push(...dubWave);
      }
    });

    const step = () => {
      if (!isAlive) return;

      // Extract next point or subtle physiological baseline noise
      let nextY = 0;
      if (pendingPoints.length > 0) {
        nextY = pendingPoints.shift() ?? 0;
      } else {
        nextY = (Math.random() - 0.5) * 0.7;
      }

      history.push(nextY);
      if (history.length > totalPoints) {
        history.shift();
      }

      ctx.clearRect(0, 0, width, height);

      const midY = height / 2;
      const stepX = width / (history.length - 1);

      ctx.beginPath();
      for (let i = 0; i < history.length; i++) {
        const x = i * stepX;
        const y = midY - history[i];
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = "rgba(255, 77, 94, 0.6)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#FF4D5E";
      ctx.shadowBlur = 6;
      ctx.stroke();

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      isAlive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      unsubscribe();
    };
  }, [reducedMotion, subscribeBeat]);

  return (
    <div
      className="w-full max-w-[900px] mx-auto h-12 flex items-center justify-center opacity-70 pointer-events-none"
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

export default LiveEcgStrip;
