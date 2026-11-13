import { Biquad, buffer, envelope, grains, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Ratios of the partials of a steel pick head: inharmonic modes, the high ones ringing shortest
const MODEN = [1, 2.31, 3.87, 5.61];

export const pickaxe = defineSound({
  id: "pickaxe", category: "impact",
  title: { de: "Spitzhacke", en: "Pickaxe" },
  description: {
    de: "Ein Schlag einer Stahlspitzhacke in Fels: erst der helle Tink des Kopfes, dann das Beißen im Stein, zum Schluss rieselnde Krümel.",
    en: "One blow of a steel pickaxe into rock: first the bright tink of the head, then the bite into the stone, at the end crumbs trickling down.",
  },
  params: {
    hardness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.7, label: { de: "Härte", en: "Hardness" },
      describe: { de: "Wie hart der Fels ist: 0,2 Ton oder Erde (dumpfer Schlag, kurzer Klang), 0,7 Stein, 1 Granit (heller Knacks, langer Klang).", en: "How hard the rock is: 0.2 clay or earth (dull thud, short ring), 0.7 stone, 1 granite (bright crack, long ring)." } },
    pitch: { type: "number", min: 1200, max: 4000, step: 10, default: 2200, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Grundton des Pickkopfes: 1500 Hz eine schwere Spitzhacke, 2200 Hz üblich, 3500 Hz ein kleiner Handhammer.", en: "Main tone of the pick head: 1500 Hz a heavy pick, 2200 Hz usual, 3500 Hz a small hammer." } },
    ring: { type: "number", min: 0.05, max: 1, step: 0.01, default: 0.3, unit: "s", label: { de: "Klang", en: "Ring" },
      describe: { de: "Wie lange der Kopf nachklingt: 0,1 s weicher Stein, 0,3 s üblich, 0,8 s eine Erzader.", en: "How long the head rings out: 0.1 s soft stone, 0.3 s usual, 0.8 s an ore vein." } },
    debris: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Krümel", en: "Crumbs" },
      describe: { de: "Wie viel Gries nach dem Schlag nachrieselt: 0 nichts, 0,5 ein kurzer Regen aus Krümeln, 1 ein langer Nachhall abbröckelnder Steine.", en: "How many crumbs fall after the strike: 0 none, 0.5 a short rain of crumbs, 1 a long trickle of crumbling stone." } },
  },
  presets: {
    stone: { label: { de: "Stein", en: "Stone" }, values: { hardness: 0.7 } },
    granite: { label: { de: "Granit", en: "Granite" }, values: { hardness: 1, ring: 0.6, debris: 0.3 } },
    clay: { label: { de: "Ton", en: "Clay" }, values: { hardness: 0.2, ring: 0.08, debris: 0.8, pitch: 1500 } },
    "ore-vein": { label: { de: "Erzader", en: "Ore vein" }, values: { ring: 0.7, pitch: 3000, debris: 0.6 } },
  },
  loop: false, maxSeconds: 1.6,
  build(p, seed) {
    const r = rng(seed);
    const h = p.hardness;
    const tau = (p.ring * (0.3 + 0.7 * h)) / 6.9;
    const fallen = 0.15 + p.debris * 0.6;
    const s = buffer(Math.max(tau * 7, 0.02 + fallen + 0.1) + 0.05);
    // The pick head: inharmonic steel modes, each a hair off tune; hard rock lets all of them speak louder and longer
    MODEN.forEach((ratio, k) => {
      const f = p.pitch * ratio * (0.98 + r() * 0.04);
      if (f > 15000) return;
      const laut = (k ? 0.5 / (1 + k) : 1) * (0.3 + 0.7 * h) * 0.6, klang = tau / (1 + k * 0.8);
      const o = new Osc("sine", r());
      for (let i = 0; i < klang * 7 * RATE && i < s.length; i++) s[i] += o.next(f) * envelope(i / RATE, 0.0005, klang) * laut;
    });
    // The bite: a bright klick of the tip and the dull crush of the stone giving way under the blow
    const klick = 0.003 + (1 - h) * 0.012;
    const hp = new Biquad("highpass", 600 + h * 3400, 0.7), lp = new LowPass();
    for (let i = 0; i < klick * 8 * RATE && i < s.length; i++) {
      const t = i / RATE;
      s[i] += hp.run(white(r)) * envelope(t, 0.0003, klick) * (0.4 + h);
      s[i] += lp.run(white(r), 300) * envelope(t, 0.001, 0.02 + (1 - h) * 0.03) * (1.2 - h * 0.6);
    }
    // The crumbs: bright grains trickling down after the strike, most of them right away
    if (p.debris > 0) grains(s, r, { start: 0.02, seconds: fallen, count: Math.round(p.debris * 60), hz: 1500 + h * 2500, q: 1.2, gain: 0.5, grain: 0.0015, shape: "front" });
    // The tail falls silent on its own: a raised cosine over the last 20 ms, so the edge fade is not what stops it
    const ende = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < ende; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ende);
    return s;
  },
});
