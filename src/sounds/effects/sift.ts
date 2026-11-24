import { Biquad, buffer, grains, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const sift = defineSound({
  id: "sift", category: "effects",
  title: { de: "Mehl sieben", en: "Sift flour" },
  description: {
    de: "Ein rundes Holzsieb wird geschüttelt, damit feines Mehl durchs Maschen fällt: ein weiches, mehliges Rauschen bei jedem Schlag, und der Siebrand klopft leicht gegen die Hand, für Bäckereien, Küchen und Kochspiele.",
    en: "A round wooden sieve shaken so fine flour falls through the mesh: a soft mealy hiss at every stroke, and the wooden rim tapping lightly against the hand, for bakeries, kitchens and cooking games.",
  },
  params: {
    strokes: { type: "integer", min: 2, max: 8, default: 4, label: { de: "Schläge", en: "Strokes" },
      describe: { de: "Wie viele Schüttbewegungen das Sieb macht: 2 ein vorsichtiges Sieben, 4 üblich, 8 so viele wie in 1,7 s bei dem gewählten Tempo hineinpassen.", en: "How many shaking strokes the sieve makes: 2 a careful sift, 4 usual, 8 as many as fit in 1.7 s at the chosen tempo." } },
    tempo: { type: "number", min: 2, max: 6, step: 0.5, default: 3.5, unit: "s", label: { de: "Tempo", en: "Tempo" },
      describe: { de: "Wie schnell das Sieb geschüttelt wird: 2 langsam und vorsichtig, 3,5 üblich, 6 ein schnelles Schütteln, in Schlägen pro Sekunde.", en: "How fast the sieve is shaken: 2 slow and careful, 3.5 usual, 6 a quick shake, in strokes per second." } },
    fineness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.7, label: { de: "Feinheit", en: "Fineness" },
      describe: { de: "Wie fein das gemahlene Getreide ist: 0 grobe Mahlung oder Zucker mit einzelnen hörbaren Körnern um 2 kHz, 1 feines Mehl, ein weiches atemhaftes Rauschen oberhalb von etwa 4 kHz.", en: "How fine the ground grain is: 0 coarse meal or sugar with sparse audible grains around 2 kHz, 1 fine flour, a soft breathy hiss above about 4 kHz." } },
    rim: { type: "boolean", default: true, label: { de: "Brand", en: "Rim" },
      describe: { de: "Ob der hölzerne Siebrand bei jeder Wendung leicht gegen die Hand klopft: ein kurzer, gedämpfter Holzschlag um 1-1,5 kHz, der innerhalb von 30 ms abklingt.", en: "Whether the wooden sieve rim taps lightly against the hand at each turn: a short muted wood knock around 1-1.5 kHz that decays within 30 ms." } },
  },
  presets: {
    flour: { label: { de: "Mehl", en: "Flour" }, values: { fineness: 0.7 } },
    sugar: { label: { de: "Zucker", en: "Sugar" }, values: { fineness: 0.15, tempo: 4.5 } },
    "slow-dust": { label: { de: "Langsamer Staub", en: "Slow dust" }, values: { tempo: 2, strokes: 3, fineness: 0.95, rim: false } },
    quick: { label: { de: "Schnell", en: "Quick" }, values: { tempo: 6, strokes: 8 } },
  },
  loop: false, maxSeconds: 2,
  build(p, seed) {
    const r = rng(seed);
    const period = 1 / p.tempo;
    const nStrokes = Math.min(p.strokes, Math.floor(1.7 * p.tempo));
    const activeTime = nStrokes * period;
    const tailTime = 0.25;
    const totalTime = Math.min(2, activeTime + tailTime);
    const s = buffer(totalTime);
    const n = s.length;

    const attack = 0.3 * period;
    const decay = 0.3 * period;
    const leise = 10 ** (-2 / 20); // jeder zweite Schlag 2 dB leiser

    const hpf = new Biquad("highpass", 4200, 0.707);
    const lpf = new Biquad("lowpass", 8000, 0.707);
    const hiss = (w: number) => lpf.run(hpf.run(w));

    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      const schlag = Math.floor(t / period);
      if (schlag >= nStrokes) break;
      const tr = t - schlag * period;
      let env = 0;
      if (tr < attack) env = tr / attack;
      else env = Math.exp(-(tr - attack) / decay);
      if (env <= 0) continue;
      const laut = ((schlag & 1) ? leise : 1) * env;
      s[i] += hiss(white(r)) * p.fineness * laut * 0.55;
    }

    // Sparse grains for the coarse meal, a continuous stream at fineness 0, almost none at fineness 1
    const korn = Math.round((1 - p.fineness) * 90 * activeTime);
    if (korn > 0) {
      grains(s, r, { start: 0, seconds: activeTime, count: korn, hz: 2000, q: 1.2, gain: (1 - p.fineness) * 0.7, grain: 0.001, shape: "even" });
    }

    // Tail of falling dust after the last stroke, fading over at most 0.25 s
    const tailStart = nStrokes * period;
    for (let i = Math.round(tailStart * RATE); i < n; i++) {
      const t = i / RATE - tailStart;
      const env = Math.exp(-t / 0.07);
      s[i] += hiss(white(r)) * p.fineness * 0.12 * env;
    }

    // The wooden rim tap at the turn of each stroke, its own random stream so rim off leaves the hiss unchanged
    if (p.rim) {
      const rt = rng(seed + 1);
      const bp = new Biquad("bandpass", 1250, 2.0);
      const tap = Math.round(0.03 * RATE);
      for (let i = 0; i < nStrokes; i++) {
        const at = Math.round(i * period * RATE);
        const laut = ((i & 1) ? leise : 1) * 0.25;
        let phase = 0;
        for (let j = 0; j < tap && at + j < n; j++) {
          const env = Math.exp(-(j / RATE) / 0.015);
          const w = white(rt);
          phase += (2 * Math.PI * 1250) / RATE;
          s[at + j] += (bp.run(w) * 0.6 + Math.sin(phase) * 0.4) * env * laut;
        }
      }
    }

    return s;
  },
});
