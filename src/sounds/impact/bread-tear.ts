import { Biquad, buffer, envelope, grains, LowPass, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const breadTear = defineSound({
  id: "bread-tear", category: "impact",
  title: { de: "Brot reißen", en: "Bread tear" },
  description: {
    de: "Ein frischer Laib wird von Hand aufgerissen: erst knistert die Kruste in einem trockenen Schwall, dann dehnt sich die weiche Krume und reißt mit einem gedämpften Ratschen, am Ende ticken ein paar Krümel aufs Brett.",
    en: "A fresh loaf torn open by hand: first the crust crackles in a dry burst, then the soft crumb stretches and parts with a muffled rip, at the end a few crumbs tick onto the board.",
  },
  params: {
    crust: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Kruste", en: "Crust" },
      describe: { de: "Wie knusprig die Kruste ist: 0 ein weiches Brötchen ohne Knistern, 0,6 ein Bauernbrot, 1 ein Baguette mit dichtem hellem Knistern.", en: "How crisp the crust is: 0 a soft roll with no crackle, 0.6 a farmhouse loaf, 1 a baguette with a dense bright crackle." } },
    pull: { type: "number", min: 0.2, max: 1, step: 0.05, default: 0.5, unit: "s", label: { de: "Zug", en: "Pull" },
      describe: { de: "Wie lange sich die Krume dehnt, bevor sie reißt: 0,2 s ein schneller Bruch, 0,5 s normal, 1 s ein langsames Reißen eines weichen Laibs.", en: "How long the crumb stretches before it parts: 0.2 s a quick break, 0.5 s normal, 1 s a slow tear of a soft loaf." } },
    size: { type: "number", min: 0.5, max: 1.5, step: 0.05, default: 1, label: { de: "Größe", en: "Size" },
      describe: { de: "Größe des Brots: 0,5 ein Brötchen (kürzer, höher), 1 ein Laib, 1,5 ein großer runder Laib (voller, tiefer).", en: "Size of the loaf: 0.5 a bread roll (shorter, higher), 1 a loaf, 1.5 a big round loaf (fuller, lower)." } },
    crumbs: { type: "boolean", default: true, label: { de: "Krümel", en: "Crumbs" },
      describe: { de: "Ob am Ende 3 bis 6 winzige Krümel aufs Brett ticken.", en: "Whether 3 to 6 tiny crumbs tick onto the board at the end." } },
  },
  presets: {
    loaf: { label: { de: "Laib", en: "Loaf" }, values: { crust: 0.6 } },
    baguette: { label: { de: "Baguette", en: "Baguette" }, values: { crust: 0.95, pull: 0.3, size: 0.7 } },
    "soft-roll": { label: { de: "Weiches Brötchen", en: "Soft roll" }, values: { crust: 0.1, pull: 0.6, size: 0.5, crumbs: false } },
    "big-loaf": { label: { de: "Großer Laib", en: "Big loaf" }, values: { size: 1.4, pull: 0.8 } },
  },
  loop: false, maxSeconds: 2,
  build(p, seed) {
    const r = rng(seed);
    const knistern = 0.05 + 0.25 * p.crust, t0 = knistern, ende = t0 + p.pull;
    const s = buffer(ende + 0.5);
    // The crackle: a dense train of tiny bright grains, more and brighter with the crust
    if (p.crust > 0) {
      grains(s, r, { start: 0, seconds: knistern, count: Math.round(10 + p.crust * 70), hz: 2000 + p.crust * 2000 / p.size ** 0.3, q: 1.2, gain: 0.8 + 1.6 * p.crust, grain: 0.0008, shape: "front" });
    }
    // The pull: dull noise that swells slowly towards the point where the crumb parts, then drops within 50 ms
    const lp = new LowPass(), lp2 = new LowPass(), wob = smooth(r, p.pull, 0.04), cut = 900 / p.size;
    for (let i = Math.round(t0 * RATE); i < s.length; i++) {
      const t = Math.max(0, i / RATE - t0), u = Math.min(1, t / p.pull);
      const env = t < p.pull ? 0.08 + 0.92 * u ** 2.5 : Math.exp(-(t - p.pull) / 0.012);
      const n = lp2.run(lp.run(white(r), cut * (0.7 + 0.5 * u)), cut * 1.4);
      s[i] += n * env * (0.6 + 0.8 * wob(t)) * 3 * (0.7 + 0.3 * p.size);
    }
    // The fibres: sparse soft grains inside the pull
    grains(s, r, { start: t0, seconds: p.pull, count: Math.round(12 + p.pull * 50), hz: 900 / p.size ** 0.3, q: 0.8, gain: 0.35, grain: 0.004, shape: "bell" });
    // A short rip as the crumb parts
    const bp = new Biquad("bandpass", 1100 / p.size, 0.8);
    for (let i = Math.round(ende * RATE); i < Math.round((ende + 0.08) * RATE) && i < s.length; i++) {
      s[i] += bp.run(white(r)) * envelope(i / RATE - ende, 0.002, 0.012) * 1.2;
    }
    // The crumbs: own random stream, so switching them off changes nothing else
    if (p.crumbs) {
      const c = rng(seed + 1), n = 3 + Math.floor(c() * 4), cb = new Biquad("bandpass", 3200, 2);
      let at = ende + 0.05 + c() * 0.2;
      const ticks = new Float32Array(s.length);
      for (let k = 0; k < n; k++) {
        const a = Math.round(at * RATE), len = 24 + Math.floor(c() * 24), laut = 0.25 + 0.5 * c();
        for (let j = 0; j < len * 4 && a + j < ticks.length; j++) ticks[a + j] += white(c) * Math.exp(-j / len) * laut;
        at += 0.02 + c() * 0.06;
      }
      for (let i = 0; i < s.length; i++) s[i] += cb.run(ticks[i]) * 5;
    }
    const f = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < f; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / f);
    return s;
  },
});
