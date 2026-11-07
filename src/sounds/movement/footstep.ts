import { Biquad, buffer, envelope, grains, Osc, RATE, white, type Samples } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

const DAUER = { stone: 0.06, wood: 0.09, grass: 0.16, gravel: 0.18, snow: 0.22 } as const;

export const footstep = defineSound({
  id: "footstep", category: "movement",
  title: { de: "Schritt", en: "Footstep" },
  description: {
    de: "Ein Schritt mit Ferse und Ballen auf Stein, Holz, Gras, Kies oder Schnee. Jeder Seed ist ein anderer Schritt: für eine Laufschleife mehrere Seeds abwechseln.",
    en: "One step, heel and ball, on stone, wood, grass, gravel or snow. Every seed is a different step: alternate a few seeds for a walk.",
  },
  params: {
    surface: { type: "choice", options: ["stone", "wood", "grass", "gravel", "snow"], default: "stone", label: { de: "Boden", en: "Surface" },
      labels: { stone: { de: "Stein", en: "Stone" }, wood: { de: "Holz", en: "Wood" }, grass: { de: "Gras", en: "Grass" }, gravel: { de: "Kies", en: "Gravel" }, snow: { de: "Schnee", en: "Snow" } },
      describe: { de: "Worauf man geht: Stein klackt, Holz poltert, Gras raschelt, Kies knirscht, Schnee knarzt.", en: "What you walk on: stone clacks, wood knocks, grass rustles, gravel crunches, snow creaks." } },
    weight: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Gewicht", en: "Weight" },
      describe: { de: "Wer geht: 0,2 ein Kind oder Schleichen, 0,5 ein Mensch, 1 ein Ritter in Rüstung oder ein Riese.", en: "Who walks: 0.2 a child or sneaking, 0.5 a person, 1 a knight in armour or a giant." } },
    hardness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Sohle", en: "Sole" },
      describe: { de: "Wie hart die Sohle ist: 0 barfuß oder Turnschuh, 0,5 Lederschuh, 1 Stiefel mit Absatz.", en: "How hard the sole is: 0 barefoot or trainers, 0.5 leather shoes, 1 heeled boots." } },
    roll: { type: "number", min: 0.02, max: 0.12, step: 0.005, default: 0.06, unit: "s", label: { de: "Abrollen", en: "Roll" },
      describe: { de: "Zeit von der Ferse zum Ballen: 0,03 s beim Rennen, 0,06 s beim Gehen, 0,1 s beim Schleichen.", en: "Time from heel to ball: 0.03 s running, 0.06 s walking, 0.1 s sneaking." } },
  },
  presets: {
    sneak: { label: { de: "Schleichen", en: "Sneak" }, values: { weight: 0.2, hardness: 0.1, roll: 0.1 } },
    boots: { label: { de: "Stiefel auf Stein", en: "Boots on stone" }, values: { surface: "stone", weight: 0.8, hardness: 0.9 } },
    "run-gravel": { label: { de: "Rennen auf Kies", en: "Running on gravel" }, values: { surface: "gravel", weight: 0.7, roll: 0.03 } },
  },
  loop: false, maxSeconds: 0.45,
  build(p, seed) {
    const r = rng(seed), d = DAUER[p.surface], s = buffer(p.roll + d + 0.03);
    // A thump of the body (low sine) and the sound of the surface, once for the heel and once for the ball
    const dumpf = (at: number, amp: number, hz: number, decay: number) => {
      const o = new Osc("sine"), a = Math.round(at * RATE);
      for (let i = 0; i < decay * 5 * RATE && a + i < s.length; i++) s[a + i] += o.next(hz) * envelope(i / RATE, 0.002, decay) * amp;
    };
    const rauschen = (at: number, amp: number, filter: Biquad, decay: number, attack = 0.0005) => {
      const a = Math.round(at * RATE);
      for (let i = 0; i < decay * 5 * RATE && a + i < s.length; i++) s[a + i] += filter.run(white(r)) * envelope(i / RATE, attack, decay) * amp;
    };
    const auftritt = (at: number, amp: number) => {
      const w = p.weight, h = p.hardness, v = 0.9 + 0.2 * r();
      switch (p.surface) {
        case "stone":
          dumpf(at, amp * w, 85 * v, 0.02 * (1 + w));
          rauschen(at, amp * (0.2 + 0.8 * h), new Biquad("highpass", 2000 + 4000 * h), 0.003 + 0.004 * (1 - h));
          rauschen(at + 0.004, amp * 0.15, new Biquad("bandpass", 1500 * v, 1), 0.03);
          break;
        case "wood":
          dumpf(at, amp * (0.5 + 0.5 * w), 135 * v, 0.035);
          rauschen(at, amp * 0.8, new Biquad("bandpass", (300 + 300 * r()), 4), 0.025);
          rauschen(at, amp * h * 0.5, new Biquad("highpass", 2500), 0.003);
          break;
        case "grass":
          dumpf(at, amp * 0.3 * w, 70 * v, 0.03);
          grains(s, r, { start: at, seconds: d * 0.8, count: Math.round(50 + 30 * w), hz: 2600 * v, q: 0.6, gain: amp * 0.7, grain: 0.003, shape: "bell" });
          break;
        case "gravel":
          dumpf(at, amp * 0.3 * w, 75 * v, 0.03);
          grains(s, r, { start: at, seconds: d * 0.8, count: Math.round(90 + 50 * w), hz: 3200 * v, q: 1.2, gain: amp * 0.9, grain: 0.0015, shape: "front" });
          break;
        case "snow":
          dumpf(at, amp * 0.2 * w, 65 * v, 0.03);
          grains(s, r, { start: at, seconds: d * 0.85, count: Math.round(160 + 60 * w), hz: 1200 * v, q: 0.8, gain: amp * 0.6, grain: 0.002, shape: "bell" });
          break;
      }
    };
    auftritt(0, 1);
    auftritt(p.roll, 0.55);
    return s as Samples;
  },
});
