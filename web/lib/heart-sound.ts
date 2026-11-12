/**
 * Realistic heart-sound synthesis (no audio files).
 *
 * A real "lub-dub" is two valve-closure events, each made of two slightly offset
 * closures (S1 = mitral + tricuspid, S2 = aortic + pulmonic — the physiological "split").
 * Each closure rings the chest as a few damped low-frequency resonances plus a short
 * burst of band-limited tissue noise. We render a handful of slightly different
 * variants once, then pick one per beat so no two beats are identical.
 */

export type HeartSoundKind = "s1" | "s2";

interface Mode {
  freq: number; // Hz
  amp: number;
  tau: number; // decay time constant, seconds
}

interface Closure {
  offset: number; // seconds from sound onset
  gain: number;
}

interface SoundSpec {
  duration: number;
  closures: Closure[];
  modes: Mode[];
  glide: number; // fractional pitch drop over the sound (valve tension release)
  attack: number;
  noiseGain: number;
  noiseTau: number;
}

const SPECS: Record<HeartSoundKind, SoundSpec> = {
  // S1 "lub": longer, deeper, dull thud
  s1: {
    duration: 0.24,
    closures: [
      { offset: 0, gain: 1 },
      { offset: 0.024, gain: 0.62 },
    ],
    modes: [
      { freq: 40, amp: 1.0, tau: 0.05 },
      { freq: 66, amp: 0.62, tau: 0.034 },
      { freq: 104, amp: 0.34, tau: 0.02 },
      { freq: 152, amp: 0.14, tau: 0.011 },
    ],
    glide: 0.18,
    attack: 0.005,
    noiseGain: 0.28,
    noiseTau: 0.022,
  },
  // S2 "dub": shorter, a little higher and crisper
  s2: {
    duration: 0.17,
    closures: [
      { offset: 0, gain: 1 },
      { offset: 0.03, gain: 0.55 },
    ],
    modes: [
      { freq: 56, amp: 1.0, tau: 0.032 },
      { freq: 90, amp: 0.7, tau: 0.022 },
      { freq: 138, amp: 0.4, tau: 0.013 },
      { freq: 205, amp: 0.16, tau: 0.007 },
    ],
    glide: 0.12,
    attack: 0.003,
    noiseGain: 0.22,
    noiseTau: 0.015,
  },
};

/** Small deterministic PRNG so variants are stable between page loads. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Renders one heart sound into raw samples (peak-normalised to 0.9). */
export function renderHeartSound(kind: HeartSoundKind, sampleRate: number, seed: number): Float32Array {
  const spec = SPECS[kind];
  const rand = mulberry32(seed);
  const length = Math.round(spec.duration * sampleRate);
  const out = new Float32Array(length);

  // Per-variant natural spread: ±4% resonance, ±10% closure gap
  const freqScale = 1 + (rand() - 0.5) * 0.08;
  const splitScale = 1 + (rand() - 0.5) * 0.2;

  // Band-limited tissue noise: one-pole lowpass (~190 Hz) minus a slower one (~28 Hz)
  const noise = new Float32Array(length);
  const lpA = 1 - Math.exp((-2 * Math.PI * 190) / sampleRate);
  const hpA = 1 - Math.exp((-2 * Math.PI * 28) / sampleRate);
  let lp = 0;
  let hp = 0;
  for (let i = 0; i < length; i++) {
    lp += lpA * (rand() * 2 - 1 - lp);
    hp += hpA * (lp - hp);
    noise[i] = (lp - hp) * 3;
  }

  for (const closure of spec.closures) {
    const start = Math.round(closure.offset * splitScale * sampleRate);
    const phases = spec.modes.map(() => rand() * Math.PI * 0.25);
    for (let i = start; i < length; i++) {
      const t = (i - start) / sampleRate;
      const attack = 1 - Math.exp(-t / spec.attack);
      const glide = 1 - spec.glide * Math.min(t / spec.duration, 1);
      let s = 0;
      spec.modes.forEach((m, k) => {
        phases[k] += (2 * Math.PI * m.freq * freqScale * glide) / sampleRate;
        s += m.amp * Math.exp(-t / m.tau) * Math.sin(phases[k]);
      });
      s += spec.noiseGain * Math.exp(-t / spec.noiseTau) * noise[i];
      out[i] += closure.gain * attack * s;
    }
  }

  // Gentle fade-out to avoid clicks, then normalise
  const fade = Math.round(0.02 * sampleRate);
  for (let i = 0; i < fade; i++) out[length - 1 - i] *= i / fade;
  let peak = 0;
  for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0) for (let i = 0; i < length; i++) out[i] = (out[i] / peak) * 0.9;
  return out;
}

/** Soft chest ambience: deep brown noise, loopable (heard mostly on headphones). */
export function renderChestBed(sampleRate: number, seconds = 3): Float32Array {
  const rand = mulberry32(7);
  const length = Math.round(seconds * sampleRate);
  const out = new Float32Array(length);
  const a = 1 - Math.exp((-2 * Math.PI * 70) / sampleRate);
  let brown = 0;
  let lp = 0;
  for (let i = 0; i < length; i++) {
    brown = (brown + (rand() * 2 - 1) * 0.02) * 0.998;
    lp += a * (brown - lp);
    out[i] = lp;
  }
  // Crossfade the loop seam
  const xf = Math.round(0.25 * sampleRate);
  for (let i = 0; i < xf; i++) {
    const w = i / xf;
    out[i] = out[i] * w + out[length - xf + i] * (1 - w);
  }
  let peak = 0;
  for (let i = 0; i < length - xf; i++) peak = Math.max(peak, Math.abs(out[i]));
  const trimmed = out.slice(0, length - xf);
  if (peak > 0) for (let i = 0; i < trimmed.length; i++) trimmed[i] /= peak;
  return trimmed;
}
