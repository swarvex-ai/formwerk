import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Ratios of the partials: a free bar or pipe, a plate (dense and inharmonic), an anvil (a block with bright modes)
const MODEN = { pipe: [1, 2.756, 5.404, 8.933], plate: [1, 1.594, 2.136, 2.296, 2.653, 2.918, 3.156], anvil: [1, 2.31, 3.9, 5.47, 7.12] } as const;

export const clang = defineSound({
  id: "clang", category: "impact",
  title: { de: "Metallschlag", en: "Clang" },
  description: {
    de: "Ein Schlag auf klingendes Metall: Rohr, Blech oder Amboss, kurz gedämpft bis lang nachhallend.",
    en: "A strike on ringing metal: a pipe, a sheet or an anvil, from briefly damped to a long ring.",
  },
  params: {
    pitch: { type: "number", min: 80, max: 1500, step: 1, default: 420, unit: "Hz", label: { de: "Höhe", en: "Pitch" },
      describe: { de: "Grundton: 120 Hz eine Stahltür, 420 Hz ein Rohr, 900 Hz ein Amboss, 1400 Hz ein kleines Werkzeug.", en: "Base tone: 120 Hz a steel door, 420 Hz a pipe, 900 Hz an anvil, 1400 Hz a small tool." } },
    ring: { type: "number", min: 0.1, max: 2.5, step: 0.05, default: 0.8, unit: "s", label: { de: "Nachklang", en: "Ring" },
      describe: { de: "Wie lange es nachklingt: 0,15 s gedämpft, 0,8 s ein Rohr, 2 s ein frei hängendes Stück.", en: "How long it rings: 0.15 s damped, 0.8 s a pipe, 2 s a freely hanging piece." } },
    shape: { type: "choice", options: ["pipe", "plate", "anvil"], default: "pipe", label: { de: "Form", en: "Shape" },
      labels: { pipe: { de: "Rohr", en: "Pipe" }, plate: { de: "Blech", en: "Plate" }, anvil: { de: "Amboss", en: "Anvil" } },
      describe: { de: "Was klingt: ein Rohr klar, ein Blech scheppernd und dicht, ein Amboss hell und hart.", en: "What rings: a pipe clear, a plate clattering and dense, an anvil bright and hard." } },
    hardness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Härte", en: "Hardness" },
      describe: { de: "Womit geschlagen wird: 0,2 ein Gummihammer, 0,5 ein Stock, 1 ein Stahlhammer mit hellem Klick.", en: "What strikes: 0.2 a rubber mallet, 0.5 a stick, 1 a steel hammer with a bright click." } },
  },
  presets: {
    pipe: { label: { de: "Rohr", en: "Pipe" }, values: { pitch: 520, ring: 1, shape: "pipe", hardness: 0.6 } },
    anvil: { label: { de: "Amboss", en: "Anvil" }, values: { pitch: 900, ring: 1.8, shape: "anvil", hardness: 0.9 } },
    "steel-door": { label: { de: "Stahltür", en: "Steel door" }, values: { pitch: 120, ring: 0.45, shape: "plate", hardness: 0.3 } },
  },
  loop: false, maxSeconds: 4,
  build(p, seed) {
    const r = rng(seed), s = buffer(Math.min(4, p.ring * 4 + 0.1)), moden = MODEN[p.shape as keyof typeof MODEN];
    moden.forEach((v, k) => {
      const f = p.pitch * v;
      if (f > 15000) return;
      // Higher partials ring shorter and speak louder with a harder strike; each one twice, a hair apart, for shimmer
      const a = (k ? (0.25 + 0.6 * p.hardness) / (1 + k * 0.5) : 1) * (0.8 + 0.4 * r()), tau = p.ring / (1 + k * (1.6 - p.hardness * 0.6));
      for (const verstimmt of [1, 1.003 + r() * 0.004]) {
        const o = new Osc("sine", r());
        for (let i = 0; i < s.length; i++) s[i] += o.next(f * verstimmt) * envelope(i / RATE, 0.0008, tau) * a * 0.5;
      }
    });
    // The strike itself: a short click, brighter and louder the harder the hammer
    const hp = new Biquad("highpass", 1000 + p.hardness * 4000, 0.7), klick = 0.002 + 0.004 * (1 - p.hardness);
    for (let i = 0; i < klick * 8 * RATE; i++) s[i] += hp.run(white(r)) * envelope(i / RATE, 0.0003, klick) * (0.3 + p.hardness * 1.2);
    return s;
  },
});
