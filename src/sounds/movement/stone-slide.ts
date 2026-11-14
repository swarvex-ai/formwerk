import { Biquad, buffer, envelope, grains, LowPass, RATE, smooth, white, type Samples } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const stoneSlide = defineSound({
  id: "stone-slide", category: "movement",
  title: { de: "Steinschieben", en: "Stone slide" },
  description: {
    de: "Ein schwerer Stein schleift über Stein: eine Geheimtür, ein Sargdeckel, ein Block, der verschoben wird. Ein tiefes Mahlen mit knirschendem Sand, das ruckt und stockt; auf Wunsch schlägt der Stein zum Schluss an.",
    en: "A heavy stone grinding over stone: a secret door, a tomb lid, a block being pushed. A low grinding with crunching grit that judders and sticks; if you like, the stone knocks home at the end.",
  },
  params: {
    duration: { type: "number", min: 0.4, max: 1.2, step: 0.05, default: 0.9, unit: "s", label: { de: "Dauer", en: "Duration" },
      describe: { de: "Wie lang der Stein gleitet: 0,4 s ein kurzer Ruck, 0,9 s eine Geheimtür, 1,2 s ein Sargdeckel, der langsam aufgeschoben wird.", en: "How long the stone slides: 0.4 s a short shove, 0.9 s a secret door, 1.2 s a tomb lid pushed slowly open." } },
    weight: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Gewicht", en: "Weight" },
      describe: { de: "Wie schwer der Stein ist: 0 ein Pflasterstein (heller, um 600 Hz), 0,6 eine Steinplatte, 1 ein Torblock (tiefes Mahlen um 120 Hz).", en: "How heavy the stone is: 0 a cobble (brighter, around 600 Hz), 0.6 a stone slab, 1 a gate block (a deep grind around 120 Hz)." } },
    grit: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Sand", en: "Grit" },
      describe: { de: "Wie viel Sand und Splitt dazwischen knirscht: 0 glatt geschliffener Stein, 0,5 ein alter Gang, 1 voller Schutt.", en: "How much sand and grit crunches in between: 0 smooth polished stone, 0.5 an old corridor, 1 full of rubble." } },
    judder: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Rucken", en: "Judder" },
      describe: { de: "Wie sehr der Stein hakt und stockt: 0 gleichmäßig gleitend, 0,5 ein paar Rucke, 1 ruckweise, als schöbe jemand mit aller Kraft.", en: "How much the stone catches and sticks: 0 sliding evenly, 0.5 a few jolts, 1 in fits and starts, as if someone pushes with all their strength." } },
    stop: { type: "boolean", default: true, label: { de: "Anschlag", en: "Stop" },
      describe: { de: "Zum Schluss schlägt der Stein dumpf an, wie eine Tür, die einrastet.", en: "At the end the stone knocks home with a dull thud, like a door locking into place." } },
  },
  presets: {
    "secret-door": { label: { de: "Geheimtür", en: "Secret door" }, values: { duration: 0.9, weight: 0.7, judder: 0.4, stop: true } },
    "tomb-lid": { label: { de: "Sargdeckel", en: "Tomb lid" }, values: { duration: 1.2, weight: 0.85, grit: 0.7, judder: 0.7, stop: false } },
    block: { label: { de: "Steinblock", en: "Stone block" }, values: { duration: 0.5, weight: 0.4, judder: 0.2, stop: true } },
  },
  loop: false, maxSeconds: 1.5,
  build(p, seed) {
    const r = rng(seed), d = p.duration, schlag = p.stop ? 0.22 : 0, s = buffer(d + schlag + 0.06);
    const tief = 600 * (1 - p.weight) + 120 * p.weight;
    // The grind: low noise through a resonance of the stone, its speed wandering; judder cuts it into jolts
    const mahlen = new Biquad("bandpass", tief, 1.2), dumpf = new Biquad("lowpass", tief * 3), unter = new Biquad("lowpass", 140 + 120 * (1 - p.weight)), tempo = smooth(r, d + 0.1, 0.05 + 0.15 * (1 - p.judder));
    for (let i = 0; i < d * RATE; i++) {
      const t = i / RATE, x = t / d, bogen = Math.min(1, x / 0.12) * Math.min(1, (1 - x) / 0.1);
      const v = 1 - p.judder * 0.85 * Math.max(0, 1 - 2.2 * tempo(t));
      const n = white(r);
      s[i] += (dumpf.run(mahlen.run(n)) * 2 + unter.run(n) * 0.6) * bogen * v;
    }
    // Grit crunching under the stone: tiny cracks spread over the whole slide
    grains(s, r, { start: 0.03, seconds: d - 0.06, count: Math.round(d * (20 + 260 * p.grit)), hz: 1800 + 1400 * (1 - p.weight), q: 1.5, gain: 0.25 + 0.35 * p.grit, grain: 0.003, shape: "even" });
    if (p.stop) {
      // The stone knocks home: a low thump and a short dusty rattle
      const at = Math.round(d * RATE), lp = new LowPass();
      for (let i = 0; at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += Math.sin(2 * Math.PI * (55 + 40 * (1 - p.weight)) * t) * envelope(t, 0.003, 0.07) * 1.2 + lp.run(white(r), 1200) * envelope(t, 0.001, 0.03) * 1.2;
      }
    }
    return s as Samples;
  },
});
