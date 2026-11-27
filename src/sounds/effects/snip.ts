import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// The material: centre and Q of the shear band, and whether the shear crunches (amplitude jitter every 2–4 ms).
const STOFF = {
  thread: { hz: 6400, q: 2.2, rau: false },
  cloth: { hz: 1500, q: 1.4, rau: true },
  paper: { hz: 3900, q: 1.8, rau: true },
} as const;

// The click stands this far above the loudest 20 ms of its shear (dB), measured on 20 ms windows
const ABSTAND = 7;

const rmsMax = (x: ArrayLike<number>, from: number, to: number) => {
  const w = Math.round(0.02 * RATE);
  let best = 0;
  for (let a = from; a < to; a += w >> 2) {
    let q = 0;
    for (let i = a; i < a + w && i < x.length; i++) q += x[i] * x[i];
    best = Math.max(best, Math.sqrt(q / w));
  }
  return best;
};

export const snip = defineSound({
  id: "snip", category: "effects",
  title: { de: "Schnitt", en: "Snip" },
  description: {
    de: "Eine Schere bei der Arbeit: die Klingen gleiten schabend durch Faden, Stoff oder Papier und schließen mit einem metallischen Klicken. Für Nähen, Weben, Basteln und Papiermenüs.",
    en: "Scissors at work: the blades slide scraping through thread, cloth or paper and close with a metallic click. For sewing, weaving, crafts and paper menus.",
  },
  params: {
    cuts: { type: "integer", min: 1, max: 4, default: 1, label: { de: "Schnitte", en: "Cuts" },
      describe: { de: "Schnitte in Folge: 1 ein einzelner Schnitt, 2–4 ein Zurechtschneiden.", en: "Cuts in a row: 1 a single snip, 2–4 trimming." } },
    length: { type: "number", min: 0.03, max: 0.2, step: 0.01, default: 0.08, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Wie lange die Klingen gleiten: 0,04 s ein Faden, 0,1 s Stoff, 0,18 s ein langer Schnitt durch Papier.", en: "How long the blades slide: 0.04 s a thread, 0.1 s cloth, 0.18 s a long cut through paper." } },
    material: { type: "choice", options: ["thread", "cloth", "paper"], default: "thread", label: { de: "Material", en: "Material" },
      labels: { thread: { de: "Faden", en: "Thread" }, cloth: { de: "Stoff", en: "Cloth" }, paper: { de: "Papier", en: "Paper" } },
      describe: { de: "Was geschnitten wird: Faden ein dünnes, hohes Zischen um 5–7 kHz, Stoff ein dumpfes Knirschen um 1–3 kHz, Papier ein knackiges Raspeln um 3–5 kHz.", en: "What is cut: thread a thin high hiss around 5–7 kHz, cloth a dull crunch around 1–3 kHz, paper a crisp rasp around 3–5 kHz." } },
    ring: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Nachklang", en: "Ring" },
      describe: { de: "Wie sehr die Klingen beim Schließen klingen, zwei Teiltöne um 3–6 kHz: 0 dumpf, 0,3 ein kurzes Klingen, 1 eine helle Schere.", en: "How much the blades ring when they close, two partials around 3–6 kHz: 0 dull, 0.3 a short ring, 1 bright shears." } },
  },
  presets: {
    thread: { label: { de: "Faden", en: "Thread" }, values: { length: 0.04 } },
    trim: { label: { de: "Zurechtschneiden", en: "Trim" }, values: { cuts: 4, material: "cloth", length: 0.1 } },
    paper: { label: { de: "Papier", en: "Paper" }, values: { material: "paper", length: 0.18, ring: 0.15 } },
  },
  loop: false, maxSeconds: 2,
  build(p, seed) {
    const r = rng(seed), n = p.cuts, stoff = STOFF[p.material as keyof typeof STOFF];
    // Each cut: its length ±10 %, its level ±1.5 dB; the blades open again in 0.15–0.25 s of silence
    const lang = Array.from({ length: n }, () => p.length * (1 + (r() - 0.5) * 0.2));
    const laut = Array.from({ length: n }, () => 10 ** ((r() * 3 - 1.5) / 20));
    const start = [0];
    for (let k = 1; k < n; k++) start.push(start[k - 1] + lang[k - 1] + 0.15 + 0.1 * r());
    const s = buffer(start[n - 1] + lang[n - 1] + 0.2), fade = 0.003, nachher = Math.round(0.18 * RATE);
    for (let k = 0; k < n; k++) {
      const i0 = Math.round(start[k] * RATE), m = Math.round(lang[k] * RATE);
      // Shear: band-passed noise rising from 0 to full, rough materials jittered every 2–4 ms, 3 ms fade at its end
      const schere = new Float32Array(m);
      const bp = new Biquad("bandpass", stoff.hz * (0.95 + 0.1 * r()), stoff.q), pair = new Biquad("bandpass", stoff.hz, stoff.q);
      let jitter = 1, naechster = 0;
      for (let i = 0; i < m; i++) {
        if (stoff.rau && i >= naechster) { jitter = 0.15 + 0.85 * r(); naechster = i + Math.round((0.002 + 0.002 * r()) * RATE); }
        const t = i / RATE, aus = Math.min(1, (lang[k] - t) / fade);
        schere[i] = pair.run(bp.run(white(r) * jitter)) * (i / m) * aus;
      }
      // Close click: a band-passed burst around 3–4 kHz and a ring of two partials between 3 and 6 kHz
      const klick = new Float32Array(nachher);
      const kb = new Biquad("bandpass", 3200 + 700 * r(), 1.5), kp = new Biquad("bandpass", 3500, 1.5);
      const decay = 0.003 + 0.003 * r(), tau = 0.03 + 0.03 * r(), ende = p.ring > 0 ? Math.min(5 * tau, 0.18) : 0.02;
      const f1 = 3300 + 700 * r(), f2 = 5000 + 900 * r(), a = new Osc("sine", r()), b = new Osc("sine", r());
      for (let i = 0; i < ende * RATE && i < nachher; i++) {
        const t = i / RATE, rest = (1 - t / ende) ** 2;
        let x = kp.run(kb.run(white(r))) * envelope(t, 0.0003, decay);
        if (p.ring > 0) x += (a.next(f1) * 0.12 + b.next(f2) * 0.08) * p.ring * envelope(t, 0.0005, tau);
        klick[i] = x * rest;
      }
      // The click's loudest 20 ms sits ABSTAND dB above the loudest 20 ms of the shear
      const ziel = rmsMax(schere, 0, Math.max(1, m - Math.round(0.02 * RATE) + 1)) * 10 ** (ABSTAND / 20);
      const g = ziel / Math.max(1e-9, rmsMax(klick, 0, Math.round(0.01 * RATE)));
      for (let i = 0; i < m && i0 + i < s.length; i++) s[i0 + i] += schere[i] * laut[k];
      for (let i = 0; i < nachher && i0 + m + i < s.length; i++) s[i0 + m + i] += klick[i] * g * laut[k];
    }
    return s;
  },
});
