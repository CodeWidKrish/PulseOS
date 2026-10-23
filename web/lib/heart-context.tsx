"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";

export type BeatListener = (strength: number, isDub?: boolean) => void;

interface HeartContextValue {
  bpm: number;
  setBpm: (bpm: number | ((prev: number) => number)) => void;
  beat: (strength?: number, isDub?: boolean) => void;
  discharge: () => void;
  subscribeBeat: (listener: BeatListener) => () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
}

const HeartContext = createContext<HeartContextValue | null>(null);

export function HeartProvider({ children }: { children: React.ReactNode }) {
  const [bpm, setBpm] = useState<number>(72);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const listenersRef = useRef<Set<BeatListener>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize realistic acoustic heart sound via Web Audio API (zero audio files)
  const playHeartTone = useCallback(
    (frequency: number, duration: number, volume: number) => {
      if (!soundEnabled || typeof window === "undefined") return;

      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioContextClass) return;

        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          frequency * 0.6,
          ctx.currentTime + duration
        );

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + duration
        );

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {
        // Silently ignore audio context errors
      }
    },
    [soundEnabled]
  );

  const subscribeBeat = useCallback((listener: BeatListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const beat = useCallback(
    (strength = 1, isDub = false) => {
      // 1. Notify all subscribers (ElectricLogo, ECG Strip, Ambient Cells)
      listenersRef.current.forEach((fn) => {
        try {
          fn(strength, isDub);
        } catch {
          // Keep loop resilient
        }
      });

      // 2. Play acoustic synthesized lub-dub if unmuted
      if (isDub) {
        // "dub" is slightly higher pitch and shorter
        playHeartTone(68, 0.1, 0.15 * Math.min(strength, 1.5));
      } else {
        // "lub" is deeper and punchier
        playHeartTone(52, 0.13, 0.22 * Math.min(strength, 1.5));
      }
    },
    [playHeartTone]
  );

  const discharge = useCallback(() => {
    beat(2.2, false);
    setTimeout(() => {
      beat(1.6, true);
    }, 240);
  }, [beat]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <HeartContext.Provider
      value={{
        bpm,
        setBpm,
        beat,
        discharge,
        subscribeBeat,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </HeartContext.Provider>
  );
}

export function useHeart(): HeartContextValue {
  const context = useContext(HeartContext);
  if (!context) {
    throw new Error("useHeart must be used within a HeartProvider");
  }
  return context;
}
