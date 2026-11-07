// Sound as numbers: building blocks for the sounds of the catalogue (oscillators, noise, envelopes, filters), the
// finishing steps every sound goes through (DC, edges, loop seam, level), WAV files, measurements and the spectrogram
// that shows a sound as an image (for reviews: agents cannot listen). Pure TypeScript: no Web Audio, no DOM, so the
// tests run it in Node and every machine computes the same samples.

/** One rate for everything: 48 kHz mono. */
export const RATE = 48000;
/** Peak level of every finished sound: −1 dBFS. */
export const PEAK = 0.891;
/** A loop renders this much more than its length; the finish folds it into the start, so the seam is inaudible. */
export const LOOP_TAIL = 0.5;

export type Samples = Float32Array<ArrayBuffer>;
export type Wave = "sine" | "triangle" | "square" | "saw";

/** An empty buffer of the given length in seconds. */
export const buffer = (seconds: number): Samples => new Float32Array(Math.max(1, Math.round(seconds * RATE)));
/** Frequency of a note `semitones` above `hz`. */
export const semitones = (hz: number, n: number) => hz * 2 ** (n / 12);
export const dB = (x: number) => 20 * Math.log10(Math.max(x, 1e-9));

// PolyBLEP: removes the aliasing of square and saw at high pitches (the naive versions sound harsh and buzz)
const blep = (t: number, dt: number) => {
  if (t < dt) { const x = t / dt; return x + x - x * x - 1; }
  if (t > 1 - dt) { const x = (t - 1) / dt; return x * x + x + x + 1; }
  return 0;
};

/** An oscillator with its own phase: call `next(hz)` once per sample. The frequency may change every sample. */
export class Osc {
  private phase: number;
  constructor(private wave: Wave = "sine", phase = 0) { this.phase = phase; }
  next(hz: number): number {
    const dt = Math.min(0.5, Math.abs(hz) / RATE), p = this.phase;
    this.phase = (p + dt) % 1;
    switch (this.wave) {
      case "sine": return Math.sin(2 * Math.PI * p);
      case "saw": return 2 * p - 1 - blep(p, dt);
      case "square": return (p < 0.5 ? 1 : -1) + blep(p, dt) - blep((p + 0.5) % 1, dt);
      // Starts at 0 like the sine; its overtones fall fast, so aliasing stays inaudible
      case "triangle": return 4 * Math.abs(((p + 0.75) % 1) - 0.5) - 1;
    }
  }
}

/** White noise in [−1, 1) from a seeded generator. */
export const white = (r: () => number) => r() * 2 - 1;

/** Smooth random curve in [0, 1] through one random point every `period` seconds (wind, gusts, flicker). */
export function smooth(r: () => number, seconds: number, period: number): (t: number) => number {
  const punkte = Array.from({ length: Math.ceil(seconds / period) + 3 }, () => r());
  return (t: number) => {
    const x = Math.max(0, t / period), i = Math.floor(x), f = x - i;
    const a = punkte[Math.min(i, punkte.length - 1)], b = punkte[Math.min(i + 1, punkte.length - 1)];
    const g = f * f * (3 - 2 * f);
    return a + (b - a) * g;
  };
}

/** Attack (linear, seconds) then exponential decay with time constant `decay` (after 5 × decay it is −43 dB). */
export const envelope = (t: number, attack: number, decay: number) =>
  t < 0 ? 0 : t < attack ? t / attack : Math.exp(-(t - attack) / decay);

/** One-pole low-pass: soft, cheap, for taking the edge off. */
export class LowPass {
  private y = 0;
  run(x: number, hz: number): number {
    const a = 1 - Math.exp((-2 * Math.PI * Math.min(hz, RATE * 0.45)) / RATE);
    this.y += a * (x - this.y);
    return this.y;
  }
}

/** Biquad filter after the Audio EQ Cookbook (R. Bristow-Johnson): low-pass, high-pass or band-pass with a Q.
 *  `set()` may be called every sample for sweeps; it is cheap enough at these lengths. */
export class Biquad {
  private b0 = 1; private b1 = 0; private b2 = 0; private a1 = 0; private a2 = 0;
  private x1 = 0; private x2 = 0; private y1 = 0; private y2 = 0;
  constructor(private type: "lowpass" | "highpass" | "bandpass", hz = 1000, q = 0.707) { this.set(hz, q); }
  set(hz: number, q = 0.707): this {
    const w = (2 * Math.PI * Math.min(Math.max(hz, 10), RATE * 0.45)) / RATE, cos = Math.cos(w), alpha = Math.sin(w) / (2 * q);
    let b0: number, b1: number, b2: number;
    if (this.type === "lowpass") { b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = b0; }
    else if (this.type === "highpass") { b0 = (1 + cos) / 2; b1 = -(1 + cos); b2 = b0; }
    else { b0 = alpha; b1 = 0; b2 = -alpha; }
    const a0 = 1 + alpha;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = (-2 * cos) / a0; this.a2 = (1 - alpha) / a0;
    return this;
  }
  run(x: number): number {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

/** Adds `source × gain` into `target` from sample `at` on (as far as it fits). */
export function mixInto(target: Samples, source: ArrayLike<number>, at = 0, gain = 1): Samples {
  const start = Math.max(0, Math.round(at));
  for (let i = 0; i < source.length && start + i < target.length; i++) target[start + i] += source[i] * gain;
  return target;
}

/** Grains: `count` short noise bursts between `start` and `start + seconds` (in seconds), band-passed at `hz`:
 *  gravel, crackle, rustling grass. `shape` says where they bunch: "even", "front" (most at the start) or "bell"
 *  (most in the middle). `grain` is the length of one burst in seconds. */
export function grains(target: Samples, r: () => number, o: { start: number; seconds: number; count: number; hz: number; q?: number; gain?: number; grain?: number; shape?: "even" | "front" | "bell" }): Samples {
  const korn = o.grain ?? 0.002, start = Math.round(o.start * RATE), dauer = o.seconds * RATE;
  const reiz = new Float32Array(Math.round(dauer + korn * RATE * 8));
  for (let g = 0; g < o.count; g++) {
    const u = r(), x = o.shape === "front" ? u * u : o.shape === "bell" ? (u + r()) / 2 : u;
    const at = Math.floor(x * dauer), m = Math.max(4, Math.round(korn * RATE * (0.5 + r())));
    const a = (0.3 + 0.7 * r()) * (o.shape === "front" ? 1 - x * 0.7 : 1);
    for (let j = 0; j < m * 3 && at + j < reiz.length; j++) reiz[at + j] += white(r) * a * Math.exp(-j / m);
  }
  const bp = new Biquad("bandpass", o.hz, o.q ?? 1), gain = o.gain ?? 1;
  for (let i = 0; i < reiz.length && start + i < target.length; i++) target[start + i] += bp.run(reiz[i]) * gain;
  return target;
}

// The finish, in this order: DC out, edges or loop seam, level. Every sound of the catalogue goes through it.

/** Removes DC and rumble below about 20 Hz (a one-pole high-pass). */
export function removeDC(s: Samples): Samples {
  const a = Math.exp((-2 * Math.PI * 20) / RATE);
  let x1 = 0, y1 = 0;
  for (let i = 0; i < s.length; i++) { const y = a * (y1 + s[i] - x1); x1 = s[i]; y1 = y; s[i] = y; }
  return s;
}

/** A one-shot starts and ends at zero: 2 ms fade in, 10 ms fade out (no click at the edges). */
export function fadeEdges(s: Samples, inSeconds = 0.002, outSeconds = 0.01): Samples {
  const a = Math.min(s.length, Math.round(inSeconds * RATE)), b = Math.min(s.length, Math.round(outSeconds * RATE));
  for (let i = 0; i < a; i++) s[i] *= i / a;
  for (let i = 0; i < b; i++) s[s.length - 1 - i] *= i / b;
  return s;
}

/** Removes what DC is left in a short one-shot (too short for the high-pass to settle): subtracts it in the shape of
 *  a Hann window, so the edges stay at zero. */
export function centre(s: Samples): Samples {
  let summe = 0, gewicht = 0;
  const w = (i: number) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / Math.max(1, s.length - 1));
  for (let i = 0; i < s.length; i++) { summe += s[i]; gewicht += w(i); }
  const c = summe / Math.max(1e-9, gewicht);
  for (let i = 0; i < s.length; i++) s[i] -= c * w(i);
  return s;
}

/** A loop: the last `tail` seconds are folded into the start with an equal-power crossfade and cut off, so the end
 *  runs on into the start without a seam. */
export function foldLoop(s: Samples, tail = LOOP_TAIL): Samples {
  const n = Math.round(tail * RATE), laenge = s.length - n;
  if (laenge < n) throw new Error("a loop must be longer than twice its tail");
  const out = s.slice(0, laenge);
  for (let i = 0; i < n; i++) {
    const f = i / n;
    out[i] = s[i] * Math.sin((f * Math.PI) / 2) + s[laenge + i] * Math.cos((f * Math.PI) / 2);
  }
  return out;
}

/** Scales the sound so its loudest sample is at `peak`. A silent sound stays silent. */
export function normalize(s: Samples, peak = PEAK): Samples {
  let m = 0;
  for (let i = 0; i < s.length; i++) m = Math.max(m, Math.abs(s[i]));
  if (m > 1e-9) for (let i = 0; i < s.length; i++) s[i] *= peak / m;
  return s;
}

/** Measurements of a finished sound. `endDb`: the last 50 ms (or tenth) against the loudest window, in dB; a one-shot
 *  that decays on its own ends far below its loudest moment. `seam`: the step from the last to the first sample, in
 *  units of the typical step between neighbouring samples (a loop without a seam stays near 1, a click is far above). */
export function metrics(s: ArrayLike<number>) {
  let peak = 0, sum = 0, sq = 0, schritte = 0;
  for (let i = 0; i < s.length; i++) {
    const x = s[i];
    peak = Math.max(peak, Math.abs(x)); sum += x; sq += x * x;
    if (i) schritte += (x - s[i - 1]) ** 2;
  }
  const fenster = Math.max(1, Math.min(Math.round(0.05 * RATE), Math.floor(s.length / 10)));
  let lautestes = 0;
  for (let a = 0; a + fenster <= s.length; a += Math.max(1, fenster >> 1)) lautestes = Math.max(lautestes, rms(s, a, a + fenster));
  const ende = rms(s, s.length - fenster, s.length);
  return {
    seconds: Math.round((s.length / RATE) * 1000) / 1000,
    peak, peakDb: Math.round(dB(peak) * 10) / 10,
    rmsDb: Math.round(dB(Math.sqrt(sq / Math.max(1, s.length))) * 10) / 10,
    dc: sum / Math.max(1, s.length),
    endDb: Math.round((dB(ende) - dB(lautestes)) * 10) / 10,
    first: s[0] ?? 0, last: s[s.length - 1] ?? 0,
    seam: Math.abs((s[0] ?? 0) - (s[s.length - 1] ?? 0)) / Math.max(1e-9, Math.sqrt(schritte / Math.max(1, s.length - 1))),
  };
}
function rms(s: ArrayLike<number>, a: number, b: number) {
  let q = 0;
  for (let i = Math.max(0, a); i < b; i++) q += s[i] * s[i];
  return Math.sqrt(q / Math.max(1, b - a));
}

/** A WAV file: 16-bit PCM, mono. Godot, Blender, Audacity and every engine import it as it is. */
export function toWav(s: ArrayLike<number>, rate = RATE): Uint8Array<ArrayBuffer> {
  const daten = s.length * 2, out = new Uint8Array(44 + daten), v = new DataView(out.buffer);
  const text = (at: number, t: string) => { for (let i = 0; i < t.length; i++) out[at + i] = t.charCodeAt(i); };
  text(0, "RIFF"); v.setUint32(4, 36 + daten, true); text(8, "WAVE");
  text(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  text(36, "data"); v.setUint32(40, daten, true);
  for (let i = 0; i < s.length; i++) v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, s[i])) * 32767), true);
  return out;
}

/** Reads a 16-bit mono WAV written by toWav (for tests and round trips). */
export function fromWav(bytes: Uint8Array): { rate: number; samples: Samples } {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const rate = v.getUint32(24, true), n = v.getUint32(40, true) / 2, s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = v.getInt16(44 + i * 2, true) / 32767;
  return { rate, samples: s };
}

// Spectrogram: time to the right, frequency up (40 Hz to 20 kHz, logarithmic), level as colour (−90 to 0 dB).

function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const w = (-2 * Math.PI) / len, wr = Math.cos(w), wi = Math.sin(w);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

const FARBEN = [[8, 8, 20], [42, 18, 92], [130, 30, 120], [220, 70, 70], [252, 170, 60], [252, 250, 190]];
const farbe = (t: number) => {
  const x = Math.max(0, Math.min(1, t)) * (FARBEN.length - 1), i = Math.min(FARBEN.length - 2, Math.floor(x)), f = x - i;
  return FARBEN[i].map((c, k) => Math.round(c + (FARBEN[i + 1][k] - c) * f));
};

/** RGBA pixels of a spectrogram, `width` × `height`, row 0 at the top (high frequencies). */
export function spectrogram(s: ArrayLike<number>, width: number, height: number): Uint8ClampedArray<ArrayBuffer> {
  const N = 1024, fenster = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
  const out = new Uint8ClampedArray(width * height * 4), re = new Float64Array(N), im = new Float64Array(N);
  const fmin = 40, fmax = 20000, bin = RATE / N, voll = N / 4; // a full-scale sine gives N/4 with a Hann window
  const zeilen = Array.from({ length: height }, (_, y) => {
    const f0 = fmin * (fmax / fmin) ** (1 - (y + 1) / height), f1 = fmin * (fmax / fmin) ** (1 - y / height);
    return [Math.max(1, Math.floor(f0 / bin)), Math.max(1, Math.ceil(f1 / bin))];
  });
  for (let x = 0; x < width; x++) {
    const mitte = Math.round(((x + 0.5) / width) * s.length);
    for (let i = 0; i < N; i++) { const k = mitte - N / 2 + i; re[i] = (k >= 0 && k < s.length ? s[k] : 0) * fenster[i]; im[i] = 0; }
    fft(re, im);
    for (let y = 0; y < height; y++) {
      const [a, b] = zeilen[y];
      let m = 0;
      for (let k = a; k <= b && k < N / 2; k++) m = Math.max(m, Math.hypot(re[k], im[k]));
      const [r, g, bl] = farbe((dB(m / voll) + 90) / 90);
      const o = (y * width + x) * 4;
      out[o] = r; out[o + 1] = g; out[o + 2] = bl; out[o + 3] = 255;
    }
  }
  return out;
}
