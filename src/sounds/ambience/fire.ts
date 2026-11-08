import { Biquad, buffer, envelope, grains, LOOP_TAIL, LowPass, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const fire = defineSound({
  id: "fire", category: "ambience",
  title: { de: "Feuer", en: "Fire" },
  description: {
    de: "Ein Feuer als nahtlose Schleife: Kaminfeuer, Lagerfeuer oder großes Freudenfeuer, mit Knistern, Knacken und dem Rauschen der Flammen.",
    en: "A fire as a seamless loop: a fireplace, a campfire or a big bonfire, with crackling, snapping and the roar of the flames.",
  },
  params: {
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß das Feuer ist: 0,2 ein Kamin, 0,5 ein Lagerfeuer, 1 ein Freudenfeuer, das tief rauscht.", en: "How big the fire is: 0.2 a fireplace, 0.5 a campfire, 1 a bonfire with a deep roar." } },
    crackle: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Knistern", en: "Crackle" },
      describe: { de: "Feines Knistern: 0,2 ruhige Glut, 0,5 üblich, 1 frisches, harziges Holz.", en: "Fine crackling: 0.2 calm embers, 0.5 usual, 1 fresh, resinous wood." } },
    pops: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Knacken", en: "Pops" },
      describe: { de: "Einzelne laute Knacker, wenn Holz platzt: 0 keine, 0,3 einige, 1 viele.", en: "Single loud snaps when wood bursts: 0 none, 0.3 some, 1 many." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist klein, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is small, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    fireplace: { label: { de: "Kamin", en: "Fireplace" }, values: { size: 0.2, crackle: 0.6, pops: 0.2 } },
    campfire: { label: { de: "Lagerfeuer", en: "Campfire" }, values: { size: 0.5, crackle: 0.5, pops: 0.35 } },
    bonfire: { label: { de: "Freudenfeuer", en: "Bonfire" }, values: { size: 1, crackle: 0.7, pops: 0.6 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    // The roar: low noise that flickers, deeper and louder for a bigger fire
    const flackern = smooth(r, laenge, 0.25), lp = new Biquad("lowpass", 160 + (1 - p.size) * 400, 0.8), zisch = new Biquad("highpass", 5000, 0.7);
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, n = white(r);
      s[i] = lp.run(n) * (0.4 + 1.6 * p.size) * (0.6 + 0.6 * flackern(t)) + zisch.run(n) * 0.04;
    }
    // Crackling: bursts of tiny clicks
    grains(s, r, { start: 0, seconds: laenge, count: Math.round(laenge * (20 + p.crackle * 220)), hz: 2800, q: 1.2, gain: 1.2, grain: 0.0005 });
    // Snaps: a sharp burst with a short ring
    const n = Math.round(laenge * p.pops * 2.5), bp = new Biquad("bandpass", 1800, 2), nach = new LowPass();
    for (let k = 0; k < n; k++) {
      // Never right at the loop's seam (the end of the loop runs on into its start there)
      let at = Math.round(r() * (laenge - 0.06) * RATE);
      if (Math.abs(at - p.seconds * RATE) < 0.06 * RATE) at -= Math.round(0.12 * RATE);
      const laut = 0.8 + 1.2 * r();
      bp.set(1200 + r() * 1800, 2);
      for (let i = 0; i < 0.05 * RATE && at + i < s.length; i++) s[at + i] += (bp.run(white(r)) * 3 + nach.run(white(r), 3000)) * envelope(i / RATE, 0.0002, 0.006) * laut;
    }
    return s;
  },
});
