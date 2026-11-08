// Voices as numbers: the source-filter model of speech science (after D. Klatt, 1980). A glottis makes a train of air
// pulses at the pitch, the throat and mouth filter them with resonances (formants) that depend on the mouth shape,
// breath goes through the same mouth, a hiss (s, sh) comes from the teeth. A larger body has a longer vocal tract and
// lower formants: `size` turns a child into a giant without other changes. No recordings, no model: an effort, a pain
// cry, a monster or a babbling villager are a few keyframes. Pure TypeScript, deterministic like src/core/audio.ts.
import { Biquad, buffer, RATE, type Samples } from "./audio";

/** Mouth shapes: vowels and the voiced consonants m, n, l (their formants; play those with less `voice`). */
export type Mouth = "a" | "e" | "i" | "o" | "u" | "ae" | "schwa" | "m" | "n" | "l";

/** F1, F2, F3 in Hz of an adult voice (F4 and F5 are fixed); `size` divides all of them. */
export const FORMANTS: Record<Mouth, readonly [number, number, number]> = {
  a: [730, 1090, 2440], e: [400, 2000, 2550], i: [280, 2250, 2890], o: [450, 800, 2620], u: [320, 800, 2240],
  ae: [640, 1190, 2390], schwa: [500, 1500, 2500], m: [280, 1000, 2200], n: [280, 1600, 2600], l: [360, 1100, 2700],
};
const F4 = 3300, F5 = 3750, BANDBREITE = [60, 90, 120, 180, 250];

/** One moment of the voice; between keys every value glides smoothly. */
export type VoiceKey = {
  /** Time in seconds; the first key is at 0, the last one ends the sound. */
  t: number;
  /** Pitch in Hz. */
  f0: number;
  mouth: Mouth;
  /** Voiced loudness, 0 to 1. */
  voice: number;
  /** Breath through the mouth (an h, a sigh), 0 to 1. */
  breath?: number;
  /** Hiss at the teeth (s about 6000 Hz, sh about 2800 Hz, the burst of a b, d or g), 0 to 1, and its centre. */
  hiss?: number;
  hissHz?: number;
};

export type VoiceOptions = {
  /** Length of the vocal tract against an adult: 0.3 a small animal, 0.7 a child, 1 an adult, 3 a giant. */
  size?: number;
  /** How long the glottis stays open per pulse: 0.4 pressed and buzzy, 0.6 normal, 0.75 soft and breathy. */
  open?: number;
  /** Random pitch change per pulse: 0.01 natural, 0.05 strained, 0.1 a monster. */
  jitter?: number;
  /** Random loudness change per pulse. */
  shimmer?: number;
  /** Every other pulse weaker (vocal fry, a cracked or rough voice), 0 to 1. */
  sub?: number;
  /** Flutter of the false vocal folds at about 35 Hz: a growl, 0 to 1. */
  growl?: number;
  /** Vibrato depth in semitones at 5.5 Hz. */
  vibrato?: number;
  /** Soft clipping after levelling: 0 none, 1 warm, 3 a shout through a strained throat. */
  drive?: number;
  /** A plain pulse train instead of a glottis: a machine voice. */
  buzz?: boolean;
};

/** One formant: a two-pole resonator with unity gain at 0 Hz (Klatt's form). */
class Formant {
  private a = 0; private b = 0; private c = 0; private y1 = 0; private y2 = 0;
  set(hz: number, bandwidth: number) {
    const f = Math.min(hz, RATE * 0.45);
    this.c = -Math.exp((-2 * Math.PI * bandwidth) / RATE);
    this.b = 2 * Math.exp((-Math.PI * bandwidth) / RATE) * Math.cos((2 * Math.PI * f) / RATE);
    this.a = 1 - this.b - this.c;
  }
  run(x: number) { const y = this.a * x + this.b * this.y1 + this.c * this.y2; this.y2 = this.y1; this.y1 = y; return y; }
}

/** Renders the keys into samples (not yet levelled or faded: the sound's finish does that). */
export function voice(keys: VoiceKey[], r: () => number, o: VoiceOptions = {}): Samples {
  const size = o.size ?? 1, open = o.open ?? 0.6, jitter = o.jitter ?? 0.01, shimmer = o.shimmer ?? 0.04;
  const sub = o.sub ?? 0, growl = o.growl ?? 0, vibrato = o.vibrato ?? 0, drive = o.drive ?? 0;
  const s = buffer(keys[keys.length - 1].t);
  const trakt = [new Formant(), new Formant(), new Formant(), new Formant(), new Formant()];
  const zisch = new Biquad("bandpass", 6000, 1.5);
  let phase = 0, vorher = 0, puls = 0, zittern = 0, schwanken = 1, k = 0;
  let f0 = keys[0].f0, laut = 0, hauch = 0, hiss = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / RATE;
    while (k < keys.length - 2 && keys[k + 1].t <= t) k++;
    const a = keys[k], b = keys[k + 1] ?? a;
    const x = Math.min(1, Math.max(0, (t - a.t) / Math.max(1e-6, b.t - a.t))), g = x * x * (3 - 2 * x);
    const mix = (p: number, q: number) => p + (q - p) * g;
    if (i % 16 === 0) {
      const fa = FORMANTS[a.mouth], fb = FORMANTS[b.mouth], breit = 1 + growl * 0.6;
      for (let j = 0; j < 3; j++) trakt[j].set(mix(fa[j], fb[j]) / size, BANDBREITE[j] * breit);
      trakt[3].set(F4 / size, BANDBREITE[3]); trakt[4].set(F5 / size, BANDBREITE[4]);
      f0 = mix(a.f0, b.f0); laut = mix(a.voice, b.voice); hauch = mix(a.breath ?? 0, b.breath ?? 0);
      hiss = mix(a.hiss ?? 0, b.hiss ?? 0);
      zisch.set(mix(a.hissHz ?? 6000, b.hissHz ?? 6000) / Math.sqrt(size), 1.5);
    }
    const hz = f0 * (1 + zittern) * 2 ** ((vibrato * Math.sin(2 * Math.PI * 5.5 * t)) / 12);
    phase += hz / RATE;
    if (phase >= 1) {
      phase -= 1; puls++;
      zittern = (r() * 2 - 1) * jitter;
      schwanken = 1 + (r() * 2 - 1) * shimmer;
    }
    // Glottal air flow (a smooth pulse while open, nothing while closed); its change excites the tract and includes
    // the radiation at the lips
    let fluss: number;
    if (o.buzz) fluss = phase < 0.5 ? 1 : 0;
    else { const y = phase / open; fluss = y < 1 ? 6.75 * y * y * (1 - y) : 0; }
    if (sub > 0 && puls % 2 === 1) fluss *= 1 - sub;
    const anregung = (fluss - vorher) * schwanken; vorher = fluss;
    const flattern = growl > 0 ? 1 + growl * Math.sin(2 * Math.PI * 35 * t + 3 * Math.sin(2 * Math.PI * 6 * t)) : 1;
    const rauschen = r() * 2 - 1;
    let y = anregung * laut * flattern * 6 + rauschen * hauch * (phase < open ? 1 : 0.5) * 0.08;
    for (const f of trakt) y = f.run(y);
    s[i] = y + zisch.run(rauschen) * hiss * 0.5;
  }
  let spitze = 0;
  for (const v of s) spitze = Math.max(spitze, Math.abs(v));
  if (spitze > 0) for (let i = 0; i < s.length; i++) s[i] = drive > 0 ? Math.tanh((s[i] / spitze) * drive) / Math.tanh(drive) : s[i] / spitze;
  return s;
}

/** Turns a choice like "ah" into a mouth shape. */
export const MOUTH_OF = { ah: "a", eh: "e", ee: "i", oh: "o", oo: "u", uh: "ae" } as const satisfies Record<string, Mouth>;
