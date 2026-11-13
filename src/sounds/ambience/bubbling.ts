import { Biquad, buffer, envelope, LOOP_TAIL, LowPass, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const bubbling = defineSound({
  id: "bubbling", category: "ambience",
  title: { de: "Blubbern", en: "Bubbling" },
  description: {
    de: "Eine blubbernde Flüssigkeit als nahtlose Schleife: ein kochender Topf, ein Hexenkessel oder ein Sumpf, viele runde Blasen, die aufsteigend platzen, über einem leisen tiefen Brodeln.",
    en: "A bubbling liquid as a seamless loop: a boiling pot, a witch's cauldron or a swamp, many round bubbles that burst with a rising blup, over a soft low rumble.",
  },
  params: {
    boil: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Kochen", en: "Boil" },
      describe: { de: "Wie stark es kocht: 0,1 ein träges Simmern, 0,5 kochend, 1 sprudelnd und dicht.", en: "How hard it boils: 0.1 a lazy simmer, 0.5 boiling, 1 a rolling boil." } },
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Blasengröße", en: "Bubble size" },
      describe: { de: "Größe der Blasen: 0 kleine hohe Blips um 1400 Hz, 1 große tiefe Blups um 300 Hz.", en: "Size of the bubbles: 0 small high blips around 1400 Hz, 1 big deep blups around 300 Hz." } },
    thick: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Zähigkeit", en: "Thickness" },
      describe: { de: "Wie zäh die Flüssigkeit ist: 0 Wasser, 0,5 Suppe oder Zaubertrank, 1 Brei oder Sumpfschlamm.", en: "How thick the liquid is: 0 water, 0.5 soup or potion, 1 porridge or swamp mud." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 6, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist kurz, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is short, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    pot: { label: { de: "Kochtopf", en: "Cooking pot" }, values: { boil: 0.6, size: 0.3, thick: 0 } },
    cauldron: { label: { de: "Hexenkessel", en: "Cauldron" }, values: { boil: 0.5, size: 0.7, thick: 0.5 } },
    swamp: { label: { de: "Sumpf", en: "Swamp" }, values: { boil: 0.15, size: 0.9, thick: 0.9 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge), n = s.length;
    // The bubbles: short sines whose pitch rises as the bubble bursts (running phase, no chirp)
    const blasen = buffer(laenge), count = Math.round(laenge * (3 + 37 * p.boil));
    for (let k = 0; k < count; k++) {
      // Never right at the loop's seam (the end of the loop runs on into its start there)
      let at = Math.round(r() * (laenge - 0.06) * RATE);
      if (Math.abs(at - p.seconds * RATE) < 0.06 * RATE) at -= Math.round(0.12 * RATE);
      at = Math.max(0, at);
      const f0 = (1400 - 1100 * p.size) * (0.8 + 0.4 * r()), f1 = f0 * (1.3 + 0.4 * r());
      const dauer = 0.012 + 0.03 * p.thick + 0.02 * r(), laut = 0.4 + 0.6 * r(), o = new Osc("sine");
      for (let i = 0, m = Math.round(dauer * RATE); i < m && at + i < n; i++) {
        const t = i / RATE;
        blasen[at + i] += o.next(f0 + (f1 - f0) * (t / dauer)) * envelope(t, 0.001, dauer * 0.4) * laut;
      }
    }
    // Thick liquids are duller
    const dumpf = new LowPass();
    // The rumble: low noise that flickers slowly, stronger in a hard boil
    const flackern = smooth(r, laenge, 0.4), lp = new Biquad("lowpass", 120 + 200 * p.boil, 0.8), pegel = 0.15 + 0.35 * p.boil;
    for (let i = 0; i < n; i++) {
      const b = p.thick > 0 ? dumpf.run(blasen[i], 4000 - 2500 * p.thick) : blasen[i];
      s[i] = b + lp.run(white(r)) * pegel * (0.5 + flackern(i / RATE));
    }
    return s;
  },
});
