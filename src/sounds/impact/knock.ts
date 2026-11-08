import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const knock = defineSound({
  id: "knock", category: "impact",
  title: { de: "Klopfen", en: "Knock" },
  description: {
    de: "Klopfen auf Holz: an die Tür, auf den Tisch, auf einen hohlen Baumstamm, ein- bis fünfmal.",
    en: "Knocking on wood: on a door, on a table, on a hollow log, one to five times.",
  },
  params: {
    knocks: { type: "integer", min: 1, max: 5, default: 3, label: { de: "Schläge", en: "Knocks" },
      describe: { de: "Wie oft geklopft wird: 1 ein einzelnes Pochen, 3 an der Tür, 5 ungeduldig.", en: "How many knocks: 1 a single rap, 3 at a door, 5 impatient." } },
    spacing: { type: "number", min: 0.1, max: 0.4, step: 0.01, default: 0.19, unit: "s", label: { de: "Abstand", en: "Spacing" },
      describe: { de: "Zeit zwischen den Schlägen: 0,12 s schnell und dringend, 0,2 s üblich, 0,35 s zögernd.", en: "Time between the knocks: 0.12 s fast and urgent, 0.2 s usual, 0.35 s hesitant." } },
    pitch: { type: "number", min: 80, max: 600, step: 1, default: 170, unit: "Hz", label: { de: "Holz", en: "Wood" },
      describe: { de: "Ton des Holzes: 110 Hz ein hohler Stamm, 170 Hz eine Tür, 400 Hz eine Tischplatte.", en: "Tone of the wood: 110 Hz a hollow log, 170 Hz a door, 400 Hz a table top." } },
    hardness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Härte", en: "Hardness" },
      describe: { de: "Womit geklopft wird: 0,2 mit der Faust, 0,5 mit den Knöcheln, 1 mit einem harten Gegenstand.", en: "What knocks: 0.2 a fist, 0.5 knuckles, 1 something hard." } },
  },
  presets: {
    door: { label: { de: "Tür", en: "Door" }, values: { knocks: 3, spacing: 0.19, pitch: 170, hardness: 0.5 } },
    table: { label: { de: "Tisch", en: "Table" }, values: { knocks: 1, pitch: 400, hardness: 0.8 } },
    "hollow-log": { label: { de: "Hohler Stamm", en: "Hollow log" }, values: { knocks: 2, spacing: 0.3, pitch: 110, hardness: 0.3 } },
  },
  loop: false, maxSeconds: 2.2,
  build(p, seed) {
    const r = rng(seed), s = buffer((p.knocks - 1) * p.spacing * 1.05 + 0.4);
    for (let k = 0; k < p.knocks; k++) {
      const at = Math.round(k * p.spacing * (1 + (r() - 0.5) * 0.1) * RATE), laut = (0.75 + 0.25 * r()) * (k === p.knocks - 1 && k > 1 ? 0.85 : 1);
      // The panel: two modes with a slight drop in pitch as the strike lets go, and a click of the knuckle
      const f = p.pitch * (0.97 + r() * 0.06), a = new Osc("sine", 0.25), b = new Osc("sine", r()), bp = new Biquad("bandpass", 1200 + p.hardness * 2500, 1.2);
      const tau = 0.05 - p.hardness * 0.02;
      for (let i = 0; i < 0.35 * RATE && at + i < s.length; i++) {
        const t = i / RATE, fall = 1 + 0.12 * Math.exp(-t / 0.01);
        s[at + i] += (a.next(f * fall) * envelope(t, 0.001, tau) + b.next(f * 2.31 * fall) * envelope(t, 0.0008, tau * 0.45) * 0.5) * laut;
        if (t < 0.02) s[at + i] += bp.run(white(r)) * envelope(t, 0.0003, 0.002 + 0.002 * (1 - p.hardness)) * (0.4 + p.hardness) * laut;
      }
    }
    return s;
  },
});
