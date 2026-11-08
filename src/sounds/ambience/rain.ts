import { Biquad, buffer, envelope, grains, LOOP_TAIL, LowPass, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// What the rain falls on: the band of the drops and of the rushing bed under them
const FLAECHE = {
  ground: { tropfen: 2600, q: 0.7, bett: 1800 },
  roof: { tropfen: 1300, q: 2.5, bett: 900 },
  window: { tropfen: 4200, q: 1.6, bett: 2600 },
  leaves: { tropfen: 3400, q: 0.9, bett: 3800 },
} as const;

export const rain = defineSound({
  id: "rain", category: "ambience",
  title: { de: "Regen", en: "Rain" },
  description: {
    de: "Regen als nahtlose Schleife: Nieselregen bis Wolkenbruch, auf Boden, Dach, Fenster oder Blätter, mit einzelnen dicken Tropfen.",
    en: "Rain as a seamless loop: from drizzle to a downpour, on the ground, a roof, a window or leaves, with single heavy drops.",
  },
  params: {
    intensity: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Stärke", en: "Intensity" },
      describe: { de: "Wie viel Regen: 0,15 Nieseln, 0,5 Regen, 1 Wolkenbruch.", en: "How much rain: 0.15 drizzle, 0.5 rain, 1 a downpour." } },
    surface: { type: "choice", options: ["ground", "roof", "window", "leaves"], default: "ground", label: { de: "Fläche", en: "Surface" },
      labels: { ground: { de: "Boden", en: "Ground" }, roof: { de: "Dach", en: "Roof" }, window: { de: "Fenster", en: "Window" }, leaves: { de: "Blätter", en: "Leaves" } },
      describe: { de: "Worauf er fällt: Boden rauschend, Dach dumpf trommelnd, Fenster hell prasselnd, Blätter fein raschelnd.", en: "What it falls on: the ground rushing, a roof drumming dull, a window pattering bright, leaves rustling fine." } },
    drips: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Tropfen", en: "Drips" },
      describe: { de: "Einzelne dicke Tropfen aus Rinne und Ästen: 0 keine, 0,3 einige, 1 viele.", en: "Single heavy drops from gutters and branches: 0 none, 0.3 some, 1 many." } },
    distance: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Entfernung", en: "Distance" },
      describe: { de: "Wie gedämpft: 0 mitten im Regen, 0,5 unter einem Vordach, 1 drinnen hinter dicken Wänden.", en: "How muffled: 0 out in it, 0.5 under a porch, 1 indoors behind thick walls." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist klein, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is small, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    drizzle: { label: { de: "Nieselregen", en: "Drizzle" }, values: { intensity: 0.15, drips: 0.1 } },
    downpour: { label: { de: "Wolkenbruch", en: "Downpour" }, values: { intensity: 1, drips: 0.5 } },
    "on-a-roof": { label: { de: "Auf dem Dach", en: "On a roof" }, values: { surface: "roof", intensity: 0.6, distance: 0.4 } },
    "on-a-window": { label: { de: "Am Fenster", en: "On a window" }, values: { surface: "window", intensity: 0.5, drips: 0.6, distance: 0.5 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge), f = FLAECHE[p.surface as keyof typeof FLAECHE];
    // The bed: rushing noise in the surface's band, breathing a little
    const welle = smooth(r, laenge, 1.5), hp = new Biquad("highpass", 250, 0.7), lp = new Biquad("lowpass", f.bett, 0.6);
    for (let i = 0; i < s.length; i++) s[i] = lp.run(hp.run(white(r))) * (0.15 + 0.5 * p.intensity) * (0.85 + 0.3 * welle(i / RATE));
    // The drops: countless tiny ticks
    grains(s, r, { start: 0, seconds: laenge, count: Math.round(laenge * (150 + p.intensity * 1800)), hz: f.tropfen, q: f.q, gain: 0.9, grain: 0.0007 });
    // Heavy drops: a small plop each, the tone rising as the drop's crater closes
    const n = Math.round(laenge * p.drips * 4);
    for (let k = 0; k < n; k++) {
      const at = Math.round(r() * (laenge - 0.1) * RATE), f0 = 700 + r() * 1000, o = new Osc("sine");
      for (let i = 0; i < 0.08 * RATE && at + i < s.length; i++) { const t = i / RATE; s[at + i] += o.next(f0 * (1 + 4 * t)) * envelope(t, 0.001, 0.015) * 0.5; }
    }
    // Distance: walls and windows take the highs away
    const dumpf = new LowPass(), grenze = 12000 * (1 - p.distance) ** 2 + 900;
    for (let i = 0; i < s.length; i++) s[i] = dumpf.run(s[i], grenze);
    return s;
  },
});
