import { Biquad, buffer, envelope, grains, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const kneading = defineSound({
  id: "kneading", category: "effects",
  title: { de: "Teig kneten", en: "Kneading" },
  description: {
    de: "Ein Bäcker knetet Teig auf einem bemehlten Holzbrett: weiche, dumpfe Drücke mit kurzem klebrigem Schmatzen, am Ende ein Klatschen, wenn der Teig gefaltet und aufs Brett geworfen wird. Für Bäckereien, Küchen und Kochspiele.",
    en: "A baker kneading dough on a floured wooden board: soft muffled presses with a short sticky squelch, at the end a slap as the dough is folded and thrown down. For bakeries, kitchens and cooking games.",
  },
  params: {
    strokes: { type: "integer", min: 2, max: 6, default: 3, label: { de: "Striche", en: "Strokes" },
      describe: { de: "Wie oft geknetet wird: 2 ein schnelles Falten, 3 üblich, 6 langes Kneten.", en: "How many kneading strokes: 2 a quick fold, 3 usual, 6 a long knead." } },
    tempo: { type: "number", min: 0.25, max: 0.5, step: 0.05, default: 0.4, unit: "s", label: { de: "Tempo", en: "Tempo" },
      describe: { de: "Zeit von einem Strich zum nächsten: 0,25 s schnell, 0,4 s üblich, 0,5 s langsam und schwer.", en: "Time from one stroke to the next: 0.25 s fast, 0.4 s usual, 0.5 s slow and heavy." } },
    wetness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Feuchte", en: "Wetness" },
      describe: { de: "Wie klebrig der Teig ist: 0 ein trockener fester Teig, nur dumpfe Drücke; 1 ein nasser Teig mit langem klebrigem Schmatzen nach jedem Druck.", en: "How sticky the dough is: 0 a dry stiff dough, only dull presses; 1 a wet dough with a long sticky squelch after each press." } },
    slap: { type: "boolean", default: true, label: { de: "Klatschen", en: "Slap" },
      describe: { de: "Der letzte Strich ist ein Falten und Aufklatschen: ein lauterer dumpfer Schlag mit kurzem tiefem Körper (Teig aufs Brett geworfen).", en: "The last stroke is a fold-and-slap: a louder dull thump with a short low body (dough thrown on the board)." } },
  },
  presets: {
    bread: { label: { de: "Brot", en: "Bread" }, values: { strokes: 3, tempo: 0.4, wetness: 0.5, slap: true } },
    "quick-fold": { label: { de: "Schnell falten", en: "Quick fold" }, values: { strokes: 2, tempo: 0.25 } },
    "wet-dough": { label: { de: "Nasser Teig", en: "Wet dough" }, values: { wetness: 0.9, slap: false } },
    "stiff-dough": { label: { de: "Fester Teig", en: "Stiff dough" }, values: { wetness: 0.1, strokes: 5, tempo: 0.45 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed);
    // The last stroke's tail: press and squelch, or the slap; the spacing shrinks so that all fits in 2.4 s.
    const tail = 0.42, tempo = Math.min(p.tempo, (2.4 - tail) / (p.strokes - 1));
    const s = buffer((p.strokes - 1) * tempo + tail);
    for (let k = 0; k < p.strokes; k++) {
      const at = (k + (k > 0 ? (r() - 0.5) * 0.08 : 0)) * tempo + 0.005, slap = p.slap && k === p.strokes - 1;
      const start = Math.round(at * RATE);
      if (slap) {
        // The slap: noise through a low-pass at 300 Hz and a falling low sine, about 80 ms.
        const lp = new Biquad("lowpass", 300 + r() * 60, 0.9), body = new Osc("sine", 0.25), f = 90 + r() * 30;
        for (let i = 0; i < 0.3 * RATE && start + i < s.length; i++) {
          const t = i / RATE, e = envelope(t, 0.002, 0.03);
          s[start + i] += lp.run(white(r)) * e * 3.2 + body.next(f * (1 + 0.3 * Math.exp(-t / 0.02))) * envelope(t, 0.002, 0.035) * 0.9;
        }
      } else {
        // The press: low-passed noise with a soft attack, 60–120 ms.
        const level = 0.75 + r() * 0.25, cut = 400 + r() * 400, rise = 0.015 + r() * 0.01, hold = 0.02 + r() * 0.02 + p.tempo * 0.04;
        const lp = new Biquad("lowpass", cut, 0.8), lp2 = new Biquad("lowpass", cut * 1.2, 0.7);
        for (let i = 0; i < 0.25 * RATE && start + i < s.length; i++) {
          const t = i / RATE, e = t < rise ? Math.sin((t / rise) * Math.PI / 2) : Math.exp(-(t - rise) / hold);
          s[start + i] += lp2.run(lp.run(white(r))) * e * 1.8 * level;
        }
      }
      // The squelch: a train of tiny grains around 1–2 kHz after the press, longer when the dough is wet.
      const count = Math.round(p.wetness * (14 + r() * 8));
      if (count > 0) grains(s, r, { start: at + (slap ? 0.05 : 0.06 + r() * 0.02), seconds: 0.03 + p.wetness * 0.2, count, hz: 1000 + r() * 1000, q: 2.5, gain: 0.35 * (slap ? 0.7 : 1), grain: 0.003, shape: "front" });
    }
    return s;
  },
});
