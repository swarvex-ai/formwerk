import { Biquad, buffer, envelope, grains, LowPass, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const scrub = defineSound({
  id: "scrub", category: "effects",
  title: { de: "Waschbrett schrubben", en: "Scrub on a washboard" },
  description: {
    de: "Nasses Tuch, das auf und ab über die Rillen eines Waschbretts gerieben wird: einige Züge, jeder ein schnelles Rattern, und ein weiches nasses Quatschen an der Wende. Für Waschtage, Bauernhof- und Zeitspiele und Putz-Apps.",
    en: "Wet cloth rubbed up and down over the ripples of a washboard: a few strokes, each a fast rattle, and a soft wet squelch at the turn. For laundry scenes, farm and period games, cleaning in apps.",
  },
  params: {
    strokes: { type: "integer", min: 1, max: 6, default: 4, label: { de: "Züge", en: "Strokes" },
      describe: { de: "Wie viele Züge, einer ab oder auf: 1 ein einzelner Strich, 4 ein paar Züge, 6 eine ganze Wäsche. Bei langsamem Tempo werden lange Läufe verkürzt, damit alles in 2,5 s passt.", en: "How many strokes, one down or one up: 1 a single rub, 4 a few strokes, 6 a whole wash. Slow tempos shorten long runs so everything fits in 2.5 s." } },
    tempo: { type: "number", min: 1.5, max: 4, step: 0.1, default: 2.5, label: { de: "Tempo", en: "Tempo" },
      describe: { de: "Züge pro Sekunde: 1,5 langsam und gründlich, 2,5 gleichmäßig, 4 eilig.", en: "Strokes per second: 1.5 slow and thorough, 2.5 steady, 4 hurried." } },
    board: { type: "choice", options: ["zinc", "wood"], default: "zinc", label: { de: "Brett", en: "Board" },
      labels: { zinc: { de: "Zink", en: "Zinc" }, wood: { de: "Holz", en: "Wood" } },
      describe: { de: "Zink ein helleres, klingendes Rattern mit leichtem Metallklang um 2-4 kHz, Holz ein dumpferes, weicheres Rattern ohne Klang.", en: "Zinc a brighter, ringing rattle with a faint metallic ring around 2-4 kHz, wood a duller, softer rattle without ring." } },
    wetness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Nässe", en: "Wetness" },
      describe: { de: "0 trockenes Tuch, nur das Rattern, 0,6 feucht, 1 klatschnass: ein Quatschen an jeder Wende und ein Wasserzischen unter dem Rattern.", en: "0 dry cloth, only the rattle, 0.6 damp, 1 soaked: a squelch at each turn and a hiss of water under the rattle." } },
    drips: { type: "boolean", default: true, label: { de: "Tropfen", en: "Drips" },
      describe: { de: "Ob nach dem letzten Zug 2-4 Wassertropfen als kleine, hohe Plinks (um 2-4 kHz) fallen.", en: "Whether 2-4 water drips fall as small high plinks (around 2-4 kHz) after the last stroke." } },
  },
  presets: {
    zinc: { label: { de: "Zink", en: "Zinc" }, values: { board: "zinc" } },
    wooden: { label: { de: "Holzbrett", en: "Wooden" }, values: { board: "wood", tempo: 2 } },
    hurried: { label: { de: "Eilig", en: "Hurried" }, values: { tempo: 4, strokes: 6, wetness: 0.3, drips: false } },
    soaked: { label: { de: "Klatschnass", en: "Soaked" }, values: { wetness: 1, strokes: 3, tempo: 1.8 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), zinc = p.board === "zinc";
    // Strokes alone end by 2.1 s (the drips need the rest); the stroke spacing shrinks to fit.
    const per = Math.min(1 / p.tempo, 2.1 / (p.strokes - 0.2)), dur = 0.8 * per;
    const end = (p.strokes - 1) * per + dur;
    const s = buffer(Math.min(2.5, end + (p.drips ? 0.4 : 0.15)));
    const lo = zinc ? 1000 : 500, hi = zinc ? 3000 : 1500, centre = Math.sqrt(lo * hi), q = centre / (hi - lo);
    for (let k = 0; k < p.strokes; k++) {
      const up = k % 2 === 1, loud = up ? 10 ** (-2 / 20) : 1, hz = centre * (up ? 1.05 : 1), at = k * per;
      // About 25 ripples per stroke, loudest in the middle.
      grains(s, r, { start: at, seconds: dur, count: 25, hz, q: q * 1.5, gain: 1.4 * loud, grain: zinc ? 0.0012 : 0.002, shape: "bell" });
      if (zinc) grains(s, r, { start: at, seconds: dur, count: 25, hz: 3000 * (up ? 1.05 : 1), q: 8, gain: 0.5 * loud, grain: 0.001, shape: "bell" });
      const i0 = Math.round(at * RATE), len = Math.round(dur * RATE), hiss = new Biquad("bandpass", 5000, 0.8);
      for (let i = 0; i < len && i0 + i < s.length; i++) s[i0 + i] += hiss.run(white(r)) * Math.sin(Math.PI * i / len) * p.wetness * 0.12 * loud;
      // The soft squelch at the turn (the end of the stroke).
      if (p.wetness > 0) {
        const ms = 0.04 + 0.04 * r(), n = Math.round(ms * RATE), j0 = Math.round((at + dur) * RATE);
        const bp = new Biquad("bandpass", 300 + 300 * r(), 1.2), lp = new LowPass();
        for (let i = 0; i < n && j0 + i < s.length; i++) s[j0 + i] += lp.run(bp.run(white(r)), 700) * Math.sin(Math.PI * i / n) ** 2 * p.wetness * 1.6;
      }
    }
    // Drips after the last stroke, from their own stream.
    if (p.drips) {
      const d = rng(seed + 1), count = 2 + Math.floor(d() * 3);
      for (let c = 0; c < count; c++) {
        const t0 = end + 0.02 + 0.28 * (c + d()) / count, f = 2000 + 2000 * d(), j0 = Math.round(t0 * RATE), amp = 0.02 * (0.7 + 0.3 * d());
        for (let i = 0; j0 + i < s.length && i < 0.06 * RATE; i++) {
          const t = i / RATE;
          s[j0 + i] += Math.sin(2 * Math.PI * f * (1 + 0.5 * t * 20) * t) * envelope(t, 0.001, 0.012) * amp;
        }
      }
    }
    const fade = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < fade; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / fade);
    return s;
  },
});
