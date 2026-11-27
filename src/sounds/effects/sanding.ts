import { Biquad, buffer, grains, LowPass, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// The paper: centre of the rasp band, its Q, grains per stroke and their gain (fine paper is a smooth hiss).
const PAPIER = {
  coarse: { hz: 2500, q: 1.6, count: 60, gain: 0.9 },
  medium: { hz: 4000, q: 1.2, count: 30, gain: 0.45 },
  fine: { hz: 6500, q: 1.4, count: 0, gain: 0 },
} as const;

export const sanding = defineSound({
  id: "sanding", category: "effects",
  title: { de: "Schleifen", en: "Sanding" },
  description: {
    de: "Ein Brett von Hand schleifen: Schleifpapier um einen Klotz, vor und zurück entlang der Faser gerieben, jeder Zug ein trockenes, gleichmäßiges Raspeln mit kurzer Pause an der Wende. Für Werkstätten, Handwerk und Reparaturen.",
    en: "Sanding a board by hand: sandpaper round a block, rubbed back and forth along the grain, each stroke a dry, even rasp with a short stop at the turn. For workshops, crafts and repair.",
  },
  params: {
    strokes: { type: "integer", min: 1, max: 8, default: 5, label: { de: "Züge", en: "Strokes" },
      describe: { de: "Wie viele Züge, einer vor oder einer zurück: 1 ein einzelnes Reiben, 5 ein paar Züge, 8 ein langes Schleifen.", en: "How many strokes, one forward or one back: 1 a single rub, 5 a few strokes, 8 a long sanding." } },
    tempo: { type: "number", min: 1.5, max: 5, step: 0.1, default: 3, label: { de: "Tempo", en: "Tempo" },
      describe: { de: "Züge pro Sekunde: 1,5 langsam und sorgfältig, 3 gleichmäßig, 5 eilig. Passen die Züge nicht, rücken sie zusammen, bis der letzte bei 2,2 s endet.", en: "Strokes per second: 1.5 slow and careful, 3 steady, 5 hurried. If the strokes do not fit, they move closer so the last one ends by 2.2 s." } },
    grit: { type: "choice", options: ["coarse", "medium", "fine"], default: "medium", label: { de: "Körnung", en: "Grit" },
      labels: { coarse: { de: "Grob", en: "Coarse" }, medium: { de: "Mittel", en: "Medium" }, fine: { de: "Fein", en: "Fine" } },
      describe: { de: "Das Papier: grob (etwa Korn 60) ein raues, körniges Raspeln um 2,5 kHz, mittel (etwa Korn 120) um 4 kHz mit weniger Körnern, fein (etwa Korn 240) ein glattes, hohes Zischen um 6,5 kHz.", en: "The paper: coarse (about 60 grit) a rough, grainy rasp around 2.5 kHz, medium (about 120 grit) around 4 kHz with fewer grains, fine (about 240 grit) a smooth, high hiss around 6.5 kHz." } },
    pressure: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Druck", en: "Pressure" },
      describe: { de: "Wie fest der Klotz drückt: 0,2 leicht, 0,5 normal, 0,9 kräftig; mehr Druck gibt einen tiefen Unterton unter 600 Hz und macht das Raspeln etwas tiefer und lauter.", en: "How hard the block presses: 0.2 light, 0.5 normal, 0.9 hard; more pressure adds a low body below 600 Hz and makes the rasp a little lower and louder." } },
    blow: { type: "boolean", default: false, label: { de: "Staub wegblasen", en: "Blow" },
      describe: { de: "Ob nach dem letzten Zug ein weicher Atemstoß von etwa 0,3 s (um 1,2 kHz) den Staub wegbläst.", en: "Whether a soft puff of breath of about 0.3 s (around 1.2 kHz) blows the dust away after the last stroke." } },
  },
  presets: {
    rough: { label: { de: "Grob vorschleifen", en: "Rough" }, values: { grit: "coarse", pressure: 0.8, tempo: 3.5 } },
    finish: { label: { de: "Feinschliff", en: "Finish" }, values: { grit: "fine", pressure: 0.3, tempo: 2.5, strokes: 6 } },
    "dust-off": { label: { de: "Staub wegblasen", en: "Dust off" }, values: { strokes: 3, blow: true } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), paper = PAPIER[p.grit as keyof typeof PAPIER];
    // The stroke spacing shrinks so the last stroke ends by 2.2 s.
    const per = Math.min(1 / p.tempo, 2.2 / (p.strokes - 0.2)), dur = 0.8 * per;
    const end = (p.strokes - 1) * per + dur;
    const s = buffer(Math.min(2.5, end + (p.blow ? 0.4 : 0.1)));
    const loud = 0.7 + 0.6 * p.pressure, centre = paper.hz * (1.06 - 0.12 * p.pressure);
    const len = Math.round(dur * RATE), rise = 0.015 * RATE, fall = 0.025 * RATE;
    const korn = new Float32Array(len);
    for (let k = 0; k < p.strokes; k++) {
      const back = k % 2 === 1, amp = loud * (back ? 10 ** (-2 / 20) : 1), hz = centre * (back ? 1.05 : 1);
      const i0 = Math.round(k * per * RATE);
      korn.fill(0);
      if (paper.count) grains(korn, r, { start: 0, seconds: dur, count: paper.count, hz, q: 2, gain: paper.gain, grain: 0.0013 });
      const bp = new Biquad("bandpass", hz, paper.q), pair = new Biquad("bandpass", hz, paper.q), body = new LowPass(), body2 = new LowPass();
      for (let i = 0; i < len && i0 + i < s.length; i++) {
        // 15 ms linear rise, a flat body swelling by ±1 dB, a 25 ms cosine fall to zero.
        const swell = 10 ** (Math.sin(2 * Math.PI * i / len - Math.PI / 2) / 20);
        const edge = i < rise ? i / rise : i > len - fall ? 0.5 + 0.5 * Math.cos(Math.PI * (i - (len - fall)) / fall) : 1;
        const low = body2.run(body.run(white(r), 500), 500) * 0.4 * p.pressure;
        s[i0 + i] += (bp.run(pair.run(white(r))) * 0.5 + korn[i] + low) * edge * swell * amp;
      }
    }
    // A puff of breath blowing the dust away, from its own stream.
    if (p.blow) {
      const d = rng(seed + 1), a = Math.round((end + 0.02) * RATE);
      const n = Math.min(Math.round((0.25 + 0.1 * d()) * RATE), s.length - a - Math.round(0.02 * RATE));
      const bz = 1100 + 200 * d(), bp = new Biquad("bandpass", bz, 1.5), pair = new Biquad("bandpass", bz, 1.5);
      for (let i = 0; i < n; i++) s[a + i] += bp.run(pair.run(white(d))) * Math.sin(Math.PI * i / n) ** 2 * 0.35;
    }
    return s;
  },
});
