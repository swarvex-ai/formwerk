import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Ratios of the modes of a dry bone struck against another: a hollow tube, so the overtones lie close and die fast
const MODI = [1, 1.58, 2.37];

export const bones = defineSound({
  id: "bones", category: "impact",
  title: { de: "Knochen", en: "Bones" },
  description: {
    de: "Trockene Knochen klappern: ein Skelett, das sich ruckend bewegt, ein Knochenhaufen, der zusammenfällt, ein Amulett aus kleinen Knochen.",
    en: "Dry bones clattering: a skeleton moving in jerks, a heap of bones collapsing, a charm of small bones.",
  },
  params: {
    clacks: { type: "integer", min: 3, max: 24, default: 10, label: { de: "Schläge", en: "Clacks" },
      describe: { de: "Wie oft Knochen hörbar aneinanderschlagen: 4 ein kurzes Klappern, 10 üblich, 24 ein ganzer Haufen.", en: "How many times bones audibly strike each other: 4 a short clatter, 10 usual, 24 a whole heap." } },
    duration: { type: "number", min: 0.15, max: 0.9, step: 0.05, default: 0.45, unit: "s", label: { de: "Dauer", en: "Duration" },
      describe: { de: "Wie lange das Klappern dauert: 0,2 s ein Ruck, 0,45 s ein Schritt, 0,9 s ein langer Einsturz.", en: "How long the clatter lasts: 0.2 s a jerk, 0.45 s a step, 0.9 s a long collapse." } },
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Größe", en: "Size" },
      describe: { de: "Größe der Knochen: 0 Fingerknöchel (um 2400 Hz, ein helles Klicken), 0,5 Rippen, 1 Oberschenkel (um 600 Hz, ein hohles Pochen).", en: "Size of the bones: 0 knuckle bones (around 2400 Hz, a bright click), 0.5 ribs, 1 thigh bones (around 600 Hz, a hollow knock)." } },
    motion: { type: "choice", options: ["rattle", "collapse"], default: "rattle", label: { de: "Bewegung", en: "Motion" },
      labels: { rattle: { de: "Klappern", en: "Rattle" }, collapse: { de: "Einsturz", en: "Collapse" } },
      describe: { de: "Wie sie sich bewegen: Klappern (Schläge in drei Stößen, wie ein Skelett beim Gehen) oder Einsturz (erst dicht, dann immer seltener, mit einem dumpfen Aufschlag am Anfang).", en: "How they move: rattle (strikes in three bursts, like a skeleton walking) or collapse (dense at first, then ever sparser, with a dull thump at the start)." } },
  },
  presets: {
    walk: { label: { de: "Skelett geht", en: "Skeleton walks" }, values: { clacks: 9, duration: 0.45, size: 0.5, motion: "rattle" } },
    collapse: { label: { de: "Zusammenbruch", en: "Collapse" }, values: { clacks: 22, duration: 0.85, size: 0.7, motion: "collapse" } },
    charm: { label: { de: "Knochenamulett", en: "Bone charm" }, values: { clacks: 7, duration: 0.3, size: 0.1, motion: "rattle" } },
  },
  loop: false, maxSeconds: 1.5,
  build(p, seed) {
    const r = rng(seed), f0 = 2400 * (600 / 2400) ** p.size, tau = 0.006 + 0.014 * p.size;
    // When each bone strikes: three bursts for a rattle, falling off like a bouncing heap for a collapse
    const zeiten: number[] = [];
    for (let k = 0; k < p.clacks; k++) {
      const u = (k + r() * 0.7) / p.clacks;
      zeiten.push(p.duration * (p.motion === "rattle" ? Math.floor(u * 3) / 3 + (u * 3 - Math.floor(u * 3)) * 0.15 : u * u));
    }
    const erst = Math.min(...zeiten), letzt = Math.max(...zeiten) - erst;
    const s = buffer(letzt + tau * 8 + 0.03);
    for (const t0 of zeiten.map((z) => z - erst)) {
      const at = Math.round(t0 * RATE), f = f0 * (0.8 + r() * 0.4), laut = 0.5 + 0.5 * r(), oscs = MODI.map(() => new Osc("sine", r()));
      // the dry knock of the bodies, and a woody click of the contact over it
      const klick = new Biquad("bandpass", Math.min(f * 2.5, 9000), 2);
      for (let i = 0; i < tau * 8 * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        let v = 0;
        for (let m = 0; m < MODI.length; m++) v += oscs[m].next(f * MODI[m]) * envelope(t, 0.0002, tau / (1 + m * 0.6)) / (1 + m * 0.7);
        if (t < 0.003) v += klick.run(white(r)) * envelope(t, 0.0001, 0.0008) * 1.5;
        s[at + i] += v * laut * 0.5;
      }
    }
    // Collapse: the heap hits the floor first, a dull thump under the first clacks
    if (p.motion === "collapse") {
      const o = new Osc("sine", 0.25), g = 90 + 70 * (1 - p.size), lp = new Biquad("lowpass", 400, 0.7);
      for (let i = 0; i < 0.15 * RATE && i < s.length; i++) { const t = i / RATE; s[i] += (o.next(g * (1 + 0.4 * Math.exp(-t / 0.008))) + lp.run(white(r)) * 0.5) * envelope(t, 0.001, 0.03) * (0.3 + 0.4 * p.size); }
    }
    // The tail falls silent on its own: a raised cosine over the last 20 ms
    const ende = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < ende; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ende);
    return s;
  },
});
