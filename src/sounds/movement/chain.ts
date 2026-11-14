import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Ratios of the modes of a struck metal link (like a small free bar): inharmonic, so it rings like metal, not like a note
const MODI = [1, 2.76, 5.4];

export const chain = defineSound({
  id: "chain", category: "movement",
  title: { de: "Kette", en: "Chain" },
  description: {
    de: "Eine Kette klirrt: ein Schlüsselbund wird geschüttelt, Fesseln schleifen über den Boden, eine schwere Ankerkette fällt auf einen Haufen.",
    en: "A chain rattling: a bunch of keys shaken, shackles dragged across the floor, a heavy anchor chain dropping onto a pile.",
  },
  params: {
    links: { type: "integer", min: 4, max: 30, default: 14, label: { de: "Glieder", en: "Links" },
      describe: { de: "Wie viele Glieder hörbar aneinanderschlagen: 6 ein kurzes Klimpern, 14 üblich, 30 eine lange Kette.", en: "How many links audibly strike each other: 6 a short jingle, 14 usual, 30 a long chain." } },
    duration: { type: "number", min: 0.2, max: 1, step: 0.05, default: 0.5, unit: "s", label: { de: "Dauer", en: "Duration" },
      describe: { de: "Wie lange die Bewegung dauert: 0,25 s ein kurzes Rucken, 0,5 s ein Schütteln, 1 s ein langes Schleifen.", en: "How long the movement lasts: 0.25 s a short jerk, 0.5 s a shake, 1 s a long drag." } },
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Größe", en: "Size" },
      describe: { de: "Größe der Glieder: 0 ein Schlüsselring (um 4500 Hz, kurz), 0,4 eine Hundekette, 1 eine schwere Eisenkette (um 700 Hz, klingt länger).", en: "Size of the links: 0 a key ring (around 4500 Hz, short), 0.4 a dog chain, 1 a heavy iron chain (around 700 Hz, rings longer)." } },
    motion: { type: "choice", options: ["shake", "drag", "drop"], default: "shake", label: { de: "Bewegung", en: "Motion" },
      labels: { shake: { de: "Schütteln", en: "Shake" }, drag: { de: "Schleifen", en: "Drag" }, drop: { de: "Fallen", en: "Drop" } },
      describe: { de: "Wie sie sich bewegt: Schütteln (Schläge in zwei Stößen), Schleifen (gleichmäßig, mit Kratzen am Boden) oder Fallen (dichter werdend, mit einem dumpfen Aufschlag am Ende).", en: "How it moves: shake (strikes in two bursts), drag (even, with a scrape along the floor) or drop (getting denser, with a dull thud at the end)." } },
  },
  presets: {
    keys: { label: { de: "Schlüsselbund", en: "Keys" }, values: { links: 12, duration: 0.4, size: 0.1, motion: "shake" } },
    shackles: { label: { de: "Fesseln", en: "Shackles" }, values: { links: 18, duration: 0.9, size: 0.6, motion: "drag" } },
    anchor: { label: { de: "Ankerkette", en: "Anchor chain" }, values: { links: 26, duration: 0.8, size: 1, motion: "drop" } },
  },
  loop: false, maxSeconds: 1.5,
  build(p, seed) {
    const r = rng(seed), f0 = 4500 * (700 / 4500) ** p.size, tau = 0.012 + 0.04 * p.size;
    // When each link strikes: two bursts for a shake, even for a drag, ever denser for a drop
    const zeiten: number[] = [];
    for (let k = 0; k < p.links; k++) {
      const u = (k + r() * 0.8) / p.links;
      zeiten.push(p.duration * (p.motion === "shake" ? (u < 0.5 ? u * 0.7 : 0.5 + (u - 0.5) * 0.7) : p.motion === "drop" ? Math.sqrt(u) : u));
    }
    // The first link strikes at once
    const erst = Math.min(...zeiten), letzt = Math.max(...zeiten) - erst;
    // Long enough for the last ring, the whole scrape or the thud
    const s = buffer(Math.max(letzt + tau * 6, p.motion === "drop" ? p.duration + 0.25 : p.motion === "drag" ? p.duration + 0.05 : 0) + 0.02);
    for (const t0 of zeiten.map((z) => z - erst)) {
      const at = Math.round(t0 * RATE), f = f0 * (0.85 + r() * 0.3), laut = 0.5 + 0.5 * r(), oscs = MODI.map(() => new Osc("sine", r()));
      const klick = new Biquad("bandpass", Math.min(f * 2, 9000), 1.5);
      for (let i = 0; i < tau * 6 * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        let v = 0;
        for (let m = 0; m < MODI.length; m++) v += oscs[m].next(f * MODI[m]) * envelope(t, 0.0003, tau / (1 + m * 0.8)) / (1 + m);
        if (t < 0.004) v += klick.run(white(r)) * envelope(t, 0.0002, 0.001) * 1.2;
        s[at + i] += v * laut * 0.5;
      }
    }
    // Drag: a low scrape of iron on the floor under the strikes; drop: a dull thud where the pile lands
    if (p.motion === "drag") {
      const bp = new Biquad("bandpass", 600 + 900 * (1 - p.size), 0.8), n = Math.round(p.duration * RATE);
      for (let i = 0; i < n; i++) s[i] += bp.run(white(r)) * Math.sin((Math.PI * i) / n) * 0.35;
    }
    if (p.motion === "drop") {
      const at = Math.round(p.duration * RATE), o = new Osc("sine", 0.25), g = 60 + 60 * (1 - p.size);
      for (let i = 0; at + i < s.length; i++) { const t = i / RATE; s[at + i] += o.next(g * (1 + 0.3 * Math.exp(-t / 0.01))) * envelope(t, 0.002, 0.04) * (0.4 + 0.5 * p.size); }
    }
    // The tail falls silent on its own: a raised cosine over the last 20 ms
    const ende = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < ende; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ende);
    return s;
  },
});
