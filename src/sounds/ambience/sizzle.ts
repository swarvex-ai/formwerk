import { Biquad, buffer, envelope, grains, LOOP_TAIL, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const sizzle = defineSound({
  id: "sizzle", category: "ambience",
  title: { de: "Brutzeln", en: "Sizzle" },
  description: {
    de: "Essen brutzelt in einer heißen Pfanne als nahtlose Schleife: ein helles Zischen mit feinem Knistern und gelegentlich einem Spritzer Fett.",
    en: "Food frying in a hot pan as a seamless loop: a bright hiss with fine crackling and now and then a spit of fat.",
  },
  params: {
    heat: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Hitze", en: "Heat" },
      describe: { de: "Wie heiß die Pfanne ist: 0,2 leichtes Köcheln, 0,6 Braten, 1 eine sehr heiße Grillplatte (mehr Knistern, helleres Zischen).", en: "How hot the pan is: 0.2 gently simmering, 0.6 frying, 1 a very hot griddle (more crackle, brighter hiss)." } },
    fat: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Fett", en: "Fat" },
      describe: { de: "Wie oft Fett spritzt: 0 nie (gedämpftes Gemüse), 0,4 einige Spritzer, 1 Speck.", en: "How many spits: 0 none (steaming vegetables), 0.4 some, 1 bacon." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 6, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist kurz, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is short, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    bacon: { label: { de: "Speck", en: "Bacon" }, values: { heat: 0.7, fat: 0.9 } },
    simmer: { label: { de: "Köcheln", en: "Simmer" }, values: { heat: 0.2, fat: 0.05 } },
    griddle: { label: { de: "Grillplatte", en: "Griddle" }, values: { heat: 1, fat: 0.4 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    // The hiss: bright band-passed noise whose level flickers slowly
    const flackern = smooth(r, laenge, 0.3), bp = new Biquad("bandpass", 3500 + 4000 * p.heat, 0.7);
    for (let i = 0; i < s.length; i++) s[i] = bp.run(white(r)) * (0.7 + 0.3 * flackern(i / RATE)) * 2;
    // The crackle: very short clicks, nothing below 2 kHz
    grains(s, r, { start: 0, seconds: laenge, count: Math.round(laenge * (80 + 400 * p.heat)), hz: 6000, q: 0.4, gain: 1, grain: 0.002 });
    // The spits: louder, a little lower pops of fat
    const n = Math.round(laenge * p.fat * 6), sp = new Biquad("bandpass", 2500, 1);
    for (let k = 0; k < n; k++) {
      // Never right at the loop's seam (the end of the loop runs on into its start there)
      let at = Math.round(r() * (laenge - 0.06) * RATE);
      if (Math.abs(at - p.seconds * RATE) < 0.06 * RATE) at -= Math.round(0.12 * RATE);
      const laut = 0.8 + 1.2 * r(), tau = 0.005 + 0.01 * r();
      sp.set(1500 + 2500 * r(), 1);
      for (let i = 0; i < 0.05 * RATE && at + i < s.length; i++) s[at + i] += sp.run(white(r)) * 4 * envelope(i / RATE, 0.0003, tau / 2) * laut;
    }
    return s;
  },
});
