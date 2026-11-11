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
  toggleSound: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  triggerRumble: () => void;
}

const HeartContext = createContext<HeartContextValue | null>(null);

// Create gentle waveshaper curve for warm 100 to 300 Hz harmonics
function makeHarmonicDistortionCurve(): Float32Array {
  const n = 512;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; ++i) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.tanh(1.6 * x);
  }
  return curve;
}

// Create 80ms chest-cavity impulse response
function createChestImpulse(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.round((sampleRate * 80) / 1000);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.022);
  }
  return buffer;
}

function getInitialVolume(): number {
  if (typeof window === "undefined") return 0.6;
  try {
    const storedVol = localStorage.getItem("pulseos_volume");
    if (storedVol !== null) {
      const parsed = parseFloat(storedVol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }
  } catch {}
  return 0.6;
}

export function HeartProvider({ children }: { children: React.ReactNode }) {
  const [bpm, setBpm] = useState<number>(72);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(getInitialVolume);

  const listenersRef = useRef<Set<BeatListener>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const masterLowpassRef = useRef<BiquadFilterNode | null>(null);
  const waveshaperRef = useRef<WaveShaperNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);

  const schedulerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const bpmRef = useRef<number>(72);
  const volumeRef = useRef<number>(0.6);
  const soundEnabledRef = useRef<boolean>(false);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Initialize or retrieve Web Audio Context graph
  const getOrCreateAudioGraph = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return null;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // 1. Limiter / Compressor (peak under 0.95, zero clipping)
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-6, ctx.currentTime);
      compressor.knee.setValueAtTime(6, ctx.currentTime);
      compressor.ratio.setValueAtTime(8, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.1, ctx.currentTime);
      compressorRef.current = compressor;

      // 2. Master Gain with smooth volume control
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGainRef.current = masterGain;

      // 3. Master Lowpass around 220 Hz
      const masterLowpass = ctx.createBiquadFilter();
      masterLowpass.type = "lowpass";
      masterLowpass.frequency.setValueAtTime(220, ctx.currentTime);
      masterLowpass.Q.setValueAtTime(1.0, ctx.currentTime);
      masterLowpassRef.current = masterLowpass;

      // 4. Waveshaper adding 100 to 300 Hz harmonics for phone speakers
      const waveshaper = ctx.createWaveShaper();
      waveshaper.curve = makeHarmonicDistortionCurve() as unknown as Float32Array<ArrayBuffer>;
      waveshaper.oversample = "2x";
      waveshaperRef.current = waveshaper;

      // 5. Chest-cavity reverb (80ms impulse) at 12% wet
      const convolver = ctx.createConvolver();
      convolver.buffer = createChestImpulse(ctx);
      convolverRef.current = convolver;

      const dryGain = ctx.createGain();
      dryGain.gain.setValueAtTime(0.88, ctx.currentTime);
      dryGainRef.current = dryGain;

      const wetGain = ctx.createGain();
      wetGain.gain.setValueAtTime(0.12, ctx.currentTime);
      wetGainRef.current = wetGain;

      // Graph wiring:
      // Sources -> waveshaper -> [dryGain, convolver -> wetGain] -> masterLowpass -> compressor -> masterGain -> destination
      waveshaper.connect(dryGain);
      waveshaper.connect(convolver);
      convolver.connect(wetGain);

      dryGain.connect(masterLowpass);
      wetGain.connect(masterLowpass);

      masterLowpass.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }, []);

  // Synthesize individual S1 or S2 pulse at specified AudioContext time
  const schedulePulse = useCallback(
    (
      time: number,
      isDub: boolean,
      strength = 1.0,
      amplitudeVariance = 1.0
    ) => {
      const ctx = audioCtxRef.current;
      const shaper = waveshaperRef.current;
      if (!ctx || !shaper) return;

      const safeTime = Math.max(ctx.currentTime, time);

      if (!isDub) {
        // S1 (lub): 100 to 140 ms, 75 Hz -> 38 Hz, attack 6 ms
        const duration = 0.12;
        const amp = 0.88 * strength * amplitudeVariance;

        // Sine component
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(75, safeTime);
        osc.frequency.exponentialRampToValueAtTime(38, safeTime + duration);

        oscGain.gain.setValueAtTime(0.0001, safeTime);
        oscGain.gain.linearRampToValueAtTime(amp, safeTime + 0.006);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, safeTime + duration);

        osc.connect(oscGain);
        oscGain.connect(shaper);
        osc.start(safeTime);
        osc.stop(safeTime + duration);

        // Lowpassed noise burst (cutoff 120 Hz)
        const noiseBuffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.06), ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = Math.random() * 2 - 1;
        }
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "lowpass";
        noiseFilter.frequency.setValueAtTime(120, safeTime);
        noiseFilter.Q.setValueAtTime(1.5, safeTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0001, safeTime);
        noiseGain.gain.linearRampToValueAtTime(amp * 0.32, safeTime + 0.004);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, safeTime + 0.055);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(shaper);
        noiseSrc.start(safeTime);
        noiseSrc.stop(safeTime + 0.06);
      } else {
        // S2 (dub): 70 to 100 ms, 95 Hz -> 55 Hz, ~65% amp
        const duration = 0.085;
        const amp = 0.88 * 0.65 * strength * amplitudeVariance;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(95, safeTime);
        osc.frequency.exponentialRampToValueAtTime(55, safeTime + duration);

        oscGain.gain.setValueAtTime(0.0001, safeTime);
        oscGain.gain.linearRampToValueAtTime(amp, safeTime + 0.004);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, safeTime + duration);

        osc.connect(oscGain);
        oscGain.connect(shaper);
        osc.start(safeTime);
        osc.stop(safeTime + duration);

        // Subtle noise transient
        const noiseBuffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.04), ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "lowpass";
        noiseFilter.frequency.setValueAtTime(140, safeTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0001, safeTime);
        noiseGain.gain.linearRampToValueAtTime(amp * 0.22, safeTime + 0.003);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, safeTime + 0.038);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(shaper);
        noiseSrc.start(safeTime);
        noiseSrc.stop(safeTime + 0.04);
      }
    },
    []
  );

  // Notify all visual subscribers (ElectricLogo, ECG Strip, Ambient Cells)
  const notifyListeners = useCallback((strength = 1, isDub = false) => {
    listenersRef.current.forEach((fn) => {
      try {
        fn(strength, isDub);
      } catch {}
    });
  }, []);

  const subscribeBeat = useCallback((listener: BeatListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  // Trigger low rumble (e.g., hold-to-charge release)
  const triggerRumble = useCallback(() => {
    const ctx = audioCtxRef.current;
    const shaper = waveshaperRef.current;
    if (!ctx || !shaper || !soundEnabledRef.current) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(45, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.5);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(shaper);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }, []);

  // Lookahead Scheduler (100ms lookahead, 25ms tick)
  useEffect(() => {
    if (!soundEnabled) {
      if (schedulerTimerRef.current) {
        clearInterval(schedulerTimerRef.current);
        schedulerTimerRef.current = null;
      }
      return;
    }

    const ctx = getOrCreateAudioGraph();
    if (!ctx) return;

    nextBeatTimeRef.current = ctx.currentTime + 0.05;

    schedulerTimerRef.current = setInterval(() => {
      const currentCtx = audioCtxRef.current;
      if (!currentCtx || !soundEnabledRef.current) return;

      const lookahead = 0.1; // 100 ms lookahead
      const now = currentCtx.currentTime;

      while (nextBeatTimeRef.current < now + lookahead) {
        const s1Time = nextBeatTimeRef.current;
        const currentBpm = bpmRef.current;

        // Natural variation: ±3% timing, ±8% amplitude
        const timingJitter = 1 + (Math.random() * 0.06 - 0.03);
        const ampJitter = 1 + (Math.random() * 0.16 - 0.08);

        // Anatomical systole interval (nearly constant, ~300ms at 72 BPM)
        const s1ToS2 = (0.300 * Math.pow(72 / currentBpm, 0.22));
        const s2Time = s1Time + s1ToS2;

        // Total cycle duration
        const cycleSec = (60 / currentBpm) * timingJitter;

        // Schedule S1 (lub)
        schedulePulse(s1Time, false, 1.0, ampJitter);

        // Schedule S2 (dub)
        schedulePulse(s2Time, true, 0.65, ampJitter);

        // Synchronize visual beat callback with scheduled audio time (accounting for latency)
        const outputLatency = currentCtx.outputLatency || 0;
        const baseLatency = currentCtx.baseLatency || 0;
        const latencyOffset = outputLatency + baseLatency;

        const s1DelayMs = Math.max(0, (s1Time - currentCtx.currentTime - latencyOffset) * 1000);
        const s2DelayMs = Math.max(0, (s2Time - currentCtx.currentTime - latencyOffset) * 1000);

        setTimeout(() => notifyListeners(1.0, false), s1DelayMs);
        setTimeout(() => notifyListeners(0.65, true), s2DelayMs);

        // Advance to next cycle
        nextBeatTimeRef.current += cycleSec;
      }
    }, 25);

    return () => {
      if (schedulerTimerRef.current) {
        clearInterval(schedulerTimerRef.current);
        schedulerTimerRef.current = null;
      }
    };
  }, [soundEnabled, getOrCreateAudioGraph, schedulePulse, notifyListeners]);

  // Master Gain ramp on volume or toggle changes (50ms ramp prevents all clicks)
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    const targetGain = soundEnabled ? volume : 0;
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.05);
  }, [soundEnabled, volume]);

  // Tab visibility: suspend audio when hidden, resume when visible
  useEffect(() => {
    const handleVisibility = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (document.hidden) {
        if (ctx.state === "running") ctx.suspend().catch(() => {});
      } else {
        if (soundEnabledRef.current && ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // User click toggle handler (Autoplay policy compliant)
  const toggleSound = useCallback(() => {
    const nextState = !soundEnabledRef.current;
    soundEnabledRef.current = nextState;
    setSoundEnabledState(nextState);

    try {
      localStorage.setItem("pulseos_sound_enabled", String(nextState));
    } catch {}

    const ctx = getOrCreateAudioGraph();
    if (!ctx) return;

    if (nextState) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      // Play immediate feedback pulse
      schedulePulse(ctx.currentTime + 0.01, false, 1.0, 1.0);
      notifyListeners(1.0, false);
    }
  }, [getOrCreateAudioGraph, schedulePulse, notifyListeners]);

  // Set sound enabled directly
  const setSoundEnabled = useCallback(
    (enabled: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof enabled === "function" ? enabled(soundEnabledRef.current) : enabled;
      soundEnabledRef.current = resolved;
      setSoundEnabledState(resolved);
      try {
        localStorage.setItem("pulseos_sound_enabled", String(resolved));
      } catch {}
    },
    []
  );

  // Volume setter
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    try {
      localStorage.setItem("pulseos_volume", clamped.toFixed(2));
    } catch {}
  }, []);

  // Public beat function (for manual triggers when sound is muted or active)
  const beat = useCallback(
    (strength = 1, isDub = false) => {
      notifyListeners(strength, isDub);
      if (soundEnabledRef.current) {
        const ctx = audioCtxRef.current;
        if (ctx) {
          schedulePulse(ctx.currentTime, isDub, strength, 1.0);
        }
      }
    },
    [notifyListeners, schedulePulse]
  );

  // Discharge sequence
  const discharge = useCallback(() => {
    beat(2.2, false);
    setTimeout(() => {
      beat(1.6, true);
    }, 240);
    triggerRumble();
  }, [beat, triggerRumble]);

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
        toggleSound,
        volume,
        setVolume,
        triggerRumble,
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
