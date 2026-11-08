import { Biquad, buffer, envelope, grains, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const glass = defineSound({
  id: "glass", category: "impact",
  title: { de: "Glas", en: "Glass" },
  description: {
    de: "Glas klingt an oder zerbricht: vom Anstoßen zweier Gläser über eine Flasche bis zur Fensterscheibe, mit Scherben, die nachrieseln.",
    en: "Glass clinks or breaks: from two glasses touching over a bottle to a window pane, with shards trickling after.",
  },
  params: {
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß das Glas ist: 0,1 ein Weinglas, 0,4 eine Flasche, 1 eine Fensterscheibe.", en: "How big the glass is: 0.1 a wine glass, 0.4 a bottle, 1 a window pane." } },
    pitch: { type: "number", min: 1500, max: 5000, step: 10, default: 2800, unit: "Hz", label: { de: "Höhe", en: "Pitch" },
      describe: { de: "Grundton des Glases: 1800 Hz dickes Glas, 2800 Hz eine Flasche, 4500 Hz dünnes Kristall.", en: "Base tone of the glass: 1800 Hz thick glass, 2800 Hz a bottle, 4500 Hz thin crystal." } },
    shatter: { type: "boolean", default: true, label: { de: "Zerbrechen", en: "Shatter" },
      describe: { de: "Zerbrechen mit Scherben; aus ist es ein helles Anklingen ohne Bruch.", en: "Breaking with shards; off it is a bright clink without a break." } },
    shards: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Scherben", en: "Shards" },
      describe: { de: "Wie viele Scherben nachrieseln und wie lange: 0,2 wenige, 0,5 eine Flasche, 1 ein ganzer Haufen.", en: "How many shards trickle after and for how long: 0.2 a few, 0.5 a bottle, 1 a whole heap." } },
  },
  presets: {
    clink: { label: { de: "Anstoßen", en: "Clink" }, values: { shatter: false, size: 0.1, pitch: 3600 } },
    bottle: { label: { de: "Flasche", en: "Bottle" }, values: { shatter: true, size: 0.4, pitch: 2600, shards: 0.5 } },
    window: { label: { de: "Fensterscheibe", en: "Window" }, values: { shatter: true, size: 1, pitch: 2000, shards: 1 } },
  },
  loop: false, maxSeconds: 3,
  build(p, seed) {
    const r = rng(seed);
    const klang = p.shatter ? 0.12 + p.size * 0.3 : 0.25 + (1 - p.size) * 0.35, rieseln = p.shatter ? 0.3 + p.shards * (0.5 + p.size * 0.8) : 0;
    const s = buffer(Math.min(3, Math.max(klang * 6, 0.05 + rieseln + 0.3)));
    // The ring: inharmonic partials like a glass, the higher ones fading faster
    [1, 2.32, 4.25, 6.63, 9.38].forEach((v, k) => {
      const f = p.pitch * v * (1 + (r() - 0.5) * 0.02);
      if (f > 16000) return;
      const o = new Osc("sine", r()), a = (p.shatter ? 0.35 : 0.6) / (k + 1), tau = klang / (1 + k * 0.6);
      for (let i = 0; i < s.length; i++) s[i] += o.next(f) * envelope(i / RATE, 0.0005, tau) * a;
    });
    if (p.shatter) {
      // The break: a bright crack of noise, then shards that trickle, most right after it
      const hp = new Biquad("highpass", 1500 + p.pitch * 0.3, 0.7), knack = 0.01 + p.size * 0.05;
      for (let i = 0; i < knack * 8 * RATE && i < s.length; i++) s[i] += hp.run(white(r)) * envelope(i / RATE, 0.0005, knack) * (1.2 + p.size);
      const n = Math.round(10 + p.shards * (30 + p.size * 90));
      for (let k = 0; k < n; k++) {
        const u = r(), at = Math.round((0.01 + u * u * rieseln) * RATE), f = p.pitch * (0.8 + r() * 2.2), o = new Osc("sine", r());
        const laut = (0.15 + 0.35 * r()) * (1 - u * 0.7), tau = 0.004 + r() * 0.02;
        if (f < 18000) for (let i = 0; i < tau * 6 * RATE && at + i < s.length; i++) s[at + i] += o.next(f) * envelope(i / RATE, 0.0003, tau) * laut;
      }
      grains(s, r, { start: 0.005, seconds: rieseln, count: Math.round(40 + p.shards * 160), hz: 6000, q: 0.8, gain: 0.6, grain: 0.0008, shape: "front" });
    }
    return s;
  },
});
