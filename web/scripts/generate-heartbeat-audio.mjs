import fs from "fs";
import path from "path";

// 44.1 kHz mono 16-bit PCM WAV writer
function writeWav(filePath, floatSamples, sampleRate = 44100) {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = floatSamples.length * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < floatSamples.length; i++) {
    let s = Math.max(-1, Math.min(1, floatSamples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    buffer.writeInt16LE(Math.round(intSample), offset);
    offset += 2;
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, buffer);
  return buffer.length;
}

// Biquad lowpass filter implementation (Direct Form II Transposed)
class LowpassFilter {
  constructor(cutoff, sampleRate = 44100, q = 1.0) {
    const w0 = (2 * Math.PI * cutoff) / sampleRate;
    const alpha = Math.sin(w0) / (2 * q);
    const cosw0 = Math.cos(w0);

    const b0 = (1 - cosw0) / 2;
    const b1 = 1 - cosw0;
    const b2 = (1 - cosw0) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cosw0;
    const a2 = 1 - alpha;

    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = a1 / a0;
    this.a2 = a2 / a0;

    this.z1 = 0;
    this.z2 = 0;
  }

  process(sample) {
    const out = this.b0 * sample + this.z1;
    this.z1 = this.b1 * sample - this.a1 * out + this.z2;
    this.z2 = this.b2 * sample - this.a2 * out;
    return out;
  }
}

// Chest cavity impulse reverb (80ms exponential decay noise burst)
class ChestReverb {
  constructor(sampleRate = 44100, lengthMs = 80, wet = 0.12) {
    this.length = Math.round((sampleRate * lengthMs) / 1000);
    this.wet = wet;
    this.impulse = new Float32Array(this.length);
    for (let i = 0; i < this.length; i++) {
      const t = i / sampleRate;
      this.impulse[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.025);
    }
    // Normalize impulse
    let sum = 0;
    for (let i = 0; i < this.length; i++) sum += Math.abs(this.impulse[i]);
    if (sum > 0) for (let i = 0; i < this.length; i++) this.impulse[i] /= sum;

    this.buffer = new Float32Array(this.length);
    this.pos = 0;
  }

  process(sample) {
    this.buffer[this.pos] = sample;
    let rev = 0;
    let idx = this.pos;
    for (let i = 0; i < this.length; i += 4) {
      rev += this.buffer[idx] * this.impulse[i];
      idx = (idx - 4 + this.length) % this.length;
    }
    this.pos = (this.pos + 1) % this.length;
    return sample * (1 - this.wet) + rev * 4 * this.wet;
  }
}

// Waveshaper adding gentle 100 to 300 Hz warm harmonics
function warmWaveshaper(x) {
  // Soft saturation tanh-like curve
  return Math.tanh(1.8 * x) * 0.85;
}

// Single S1 or S2 pulse synthesizer
function synthesizePulse({
  startFreq,
  endFreq,
  durationMs,
  attackMs,
  amplitude,
  noiseCutoff,
  noiseAmp,
  sampleRate = 44100,
}) {
  const totalSamples = Math.round((durationMs * sampleRate) / 1000);
  const attackSamples = Math.round((attackMs * sampleRate) / 1000);
  const buffer = new Float32Array(totalSamples);
  const filter = new LowpassFilter(noiseCutoff, sampleRate, 1.4);

  let phase = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / totalSamples; // 0 to 1
    // Exponential pitch drop
    const currentFreq = startFreq * Math.pow(endFreq / startFreq, t);
    phase += (2 * Math.PI * currentFreq) / sampleRate;

    // Amplitude envelope
    let env = 0;
    if (i < attackSamples) {
      env = (i / attackSamples) * amplitude;
    } else {
      const decayT = (i - attackSamples) / (totalSamples - attackSamples);
      env = amplitude * Math.exp(-decayT * 5.5);
    }

    const sine = Math.sin(phase) * env;

    // Filtered noise burst
    const rawNoise = (Math.random() * 2 - 1) * noiseAmp * env;
    const filteredNoise = filter.process(rawNoise);

    buffer[i] = sine + filteredNoise;
  }
  return buffer;
}

// Render Heartbeat Audio (durationSec, bpm)
export function renderHeartbeat(durationSec = 10, bpm = 72, sampleRate = 44100) {
  const totalSamples = Math.round(durationSec * sampleRate);
  const rawBuffer = new Float32Array(totalSamples);

  const cycleSamples = Math.round((60 / bpm) * sampleRate);
  const s1ToS2Samples = Math.round((0.300 * Math.pow(72 / bpm, 0.22)) * sampleRate);

  let currentSample = 0;

  while (currentSample < totalSamples) {
    // S1 (lub): 120 ms, 75 Hz -> 38 Hz, attack 6 ms
    const s1 = synthesizePulse({
      startFreq: 75,
      endFreq: 38,
      durationMs: 120,
      attackMs: 6,
      amplitude: 0.88,
      noiseCutoff: 120,
      noiseAmp: 0.28,
      sampleRate,
    });

    for (let i = 0; i < s1.length && currentSample + i < totalSamples; i++) {
      rawBuffer[currentSample + i] += s1[i];
    }

    // S2 (dub): 85 ms, 95 Hz -> 55 Hz, attack 4 ms, ~65% of S1 amp
    const s2Time = currentSample + s1ToS2Samples;
    const s2 = synthesizePulse({
      startFreq: 95,
      endFreq: 55,
      durationMs: 85,
      attackMs: 4,
      amplitude: 0.88 * 0.65,
      noiseCutoff: 140,
      noiseAmp: 0.18,
      sampleRate,
    });

    for (let i = 0; i < s2.length && s2Time + i < totalSamples; i++) {
      rawBuffer[s2Time + i] += s2[i];
    }

    currentSample += cycleSamples;
  }

  // Post-processing chain: Waveshaper -> Chest Reverb -> Master 220Hz Lowpass -> Limiter
  const reverb = new ChestReverb(sampleRate, 80, 0.12);
  const masterLowpass = new LowpassFilter(220, sampleRate, 1.0);
  const processed = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const shaped = warmWaveshaper(rawBuffer[i]);
    const reverbed = reverb.process(shaped);
    const filtered = masterLowpass.process(reverbed);
    processed[i] = filtered;
  }

  // Peak limiter / normalization: peak < 0.95
  let maxPeak = 0;
  for (let i = 0; i < totalSamples; i++) {
    const abs = Math.abs(processed[i]);
    if (abs > maxPeak) maxPeak = abs;
  }

  const targetPeak = 0.88; // safely under 0.95
  const gain = maxPeak > 0 ? targetPeak / maxPeak : 1;
  for (let i = 0; i < totalSamples; i++) {
    processed[i] *= gain;
  }

  return processed;
}

// Generate single lub-dub cycle trimmed for public/audio/heartbeat.wav
export function renderSingleCycle(bpm = 72, sampleRate = 44100) {
  const cycleSec = 60 / bpm; // ~0.833 sec
  return renderHeartbeat(cycleSec, bpm, sampleRate);
}

// Fast Discrete Fourier Transform / Band Energy verification
function measureEnergyBand(samples, sampleRate, minFreq, maxFreq) {
  // Measure power in frequency band via autocorrelation / bandpass or sub-sampled Goertzel
  // Using Welch-style DFT power spectrum
  const N = 4096;
  const numWindows = Math.min(10, Math.floor(samples.length / N));
  let inBandPower = 0;
  let totalPower = 0;

  for (let w = 0; w < numWindows; w++) {
    const offset = w * N;
    // Compute power across frequencies 10Hz to 2000Hz (step 5Hz)
    for (let f = 10; f <= 2000; f += 5) {
      let real = 0;
      let imag = 0;
      const omega = (2 * Math.PI * f) / sampleRate;
      for (let n = 0; n < N; n += 2) {
        // Hanning window
        const win = 0.5 * (1 - Math.cos((2 * Math.PI * n) / N));
        const val = samples[offset + n] * win;
        real += val * Math.cos(omega * n);
        imag -= val * Math.sin(omega * n);
      }
      const p = real * real + imag * imag;
      totalPower += p;
      if (f >= minFreq && f <= maxFreq) {
        inBandPower += p;
      }
    }
  }

  return totalPower > 0 ? inBandPower / totalPower : 0;
}

// Onset detection to count onsets and measure S1->S2 interval
function analyzeOnsets(samples, sampleRate) {
  // Energy envelope in 10ms windows
  const winSize = Math.round((sampleRate * 10) / 1000);
  const hopSize = Math.round((sampleRate * 5) / 1000);
  const energies = [];

  for (let i = 0; i + winSize < samples.length; i += hopSize) {
    let sum = 0;
    for (let j = 0; j < winSize; j++) {
      sum += samples[i + j] * samples[i + j];
    }
    energies.push({ time: (i + winSize / 2) / sampleRate, energy: Math.sqrt(sum / winSize) });
  }

  // Find local peaks above threshold
  let maxE = 0;
  for (const e of energies) if (e.energy > maxE) maxE = e.energy;
  const threshold = maxE * 0.22;

  const onsets = [];
  for (let i = 1; i < energies.length - 1; i++) {
    if (
      energies[i].energy > threshold &&
      energies[i].energy > energies[i - 1].energy &&
      energies[i].energy > energies[i + 1].energy
    ) {
      if (onsets.length === 0 || energies[i].time - onsets[onsets.length - 1].time > 0.12) {
        onsets.push(energies[i]);
      }
    }
  }

  return onsets;
}

// Run Verification Suite
async function main() {
  console.log("=== PulseOS Heartbeat Audio Generator & Verification ===");

  const sampleRate = 44100;
  const tenSec = renderHeartbeat(10, 72, sampleRate);

  // 1. Peak limit check: peak under 0.95
  let peak = 0;
  for (let i = 0; i < tenSec.length; i++) {
    const abs = Math.abs(tenSec[i]);
    if (abs > peak) peak = abs;
  }
  console.log(`[Check 1] Peak Amplitude: ${peak.toFixed(4)} (Required: < 0.95) -> ${peak < 0.95 ? "PASS" : "FAIL"}`);

  // 2. Frequency Energy: at least 70% of energy between 30 and 250 Hz
  const bandRatio = measureEnergyBand(tenSec, sampleRate, 30, 250);
  console.log(`[Check 2] Energy in 30-250 Hz band: ${(bandRatio * 100).toFixed(1)}% (Required: >= 70%) -> ${bandRatio >= 0.7 ? "PASS" : "FAIL"}`);

  // 3. Onsets and S1 -> S2 interval check
  const onsets = analyzeOnsets(tenSec, sampleRate);
  console.log(`[Check 3] Detected Onsets in 10s: ${onsets.length} (Expected ~24 onsets for 12 cycles of 72 BPM)`);

  const intervals = [];
  for (let i = 0; i < onsets.length - 1; i += 2) {
    const s1 = onsets[i].time;
    const s2 = onsets[i + 1].time;
    const dtMs = (s2 - s1) * 1000;
    intervals.push(dtMs);
  }
  const avgS1S2 = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
  console.log(`[Check 4] S1 to S2 Interval: ${avgS1S2.toFixed(1)} ms (Required: 250 to 330 ms) -> ${avgS1S2 >= 250 && avgS1S2 <= 330 ? "PASS" : "FAIL"}`);

  // 4. Save 10-second render to /tmp/heartbeat-72bpm.wav and scratch path
  const tmpWavPath = "C:/tmp/heartbeat-72bpm.wav";
  const scratchWavPath = path.resolve("./public/audio/heartbeat-72bpm.wav");
  writeWav(tmpWavPath, tenSec, sampleRate);
  writeWav(scratchWavPath, tenSec, sampleRate);
  console.log(`[File Saved] 10s Render saved to: ${tmpWavPath} and ${scratchWavPath}`);

  // 5. Generate and save single lub-dub cycle to public/audio/heartbeat.wav
  const singleCycle = renderSingleCycle(72, sampleRate);
  const publicWavPath = path.resolve("./public/audio/heartbeat.wav");
  const cycleBytes = writeWav(publicWavPath, singleCycle, sampleRate);
  console.log(`[File Saved] Single cycle saved to: ${publicWavPath} (${(cycleBytes / 1024).toFixed(1)} KB, limit: 150 KB)`);

  console.log("Audio verification assertions completed!");
}

main().catch(console.error);
