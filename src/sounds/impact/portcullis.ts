import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Ratios of the partials of the iron grid when it strikes: dense and inharmonic like a plate, so it clangs, not chimes
const GITTER = [1, 1.594, 2.136, 2.653, 3.156];

export const portcullis = defineSound({
  id: "portcullis", category: "impact",
  title: { de: "Fallgitter", en: "Portcullis" },
  description: {
    de: "Ein eisernes Fallgitter: es rasselt über die Sperrklinke herab und schlägt dröhnend auf, oder es wird Zahn um Zahn hochgekurbelt, bis die Klinke einrastet.",
    en: "An iron portcullis: it rattles down over its ratchet and slams shut with a booming clang, or it is winched up tooth by tooth until the pawl locks.",
  },
  params: {
    travel: { type: "number", min: 0.3, max: 2, step: 0.05, default: 0.9, unit: "s", label: { de: "Fahrt", en: "Travel" },
      describe: { de: "Wie lange das Gitter fährt: 0,3 s ein Gitter, das jäh herabfällt, 0,9 s üblich, 2 s ein langsames Hochkurbeln.", en: "How long the gate moves: 0.3 s a grate crashing down at once, 0.9 s usual, 2 s a slow winch upwards." } },
    weight: { type: "number", min: 0, max: 1, step: 0.05, default: 0.7, label: { de: "Gewicht", en: "Weight" },
      describe: { de: "Wie schwer das Gitter ist: 0 ein leichtes Kellergitter (Aufschlag um 220 Hz, kurz), 0,7 ein Burgtor, 1 ein riesiges Festungsgitter (um 70 Hz, dröhnt lange).", en: "How heavy the gate is: 0 a light cellar grate (impact around 220 Hz, short), 0.7 a castle gate, 1 a huge fortress gate (around 70 Hz, booms long)." } },
    teeth: { type: "integer", min: 6, max: 40, default: 18, unit: "/s", label: { de: "Zähne", en: "Teeth" },
      describe: { de: "Wie oft die Sperrklinke pro Sekunde über einen Zahn klickt: 6 ein langsames Klacken, 18 üblich, 40 ein schnelles Rasseln.", en: "How often per second the pawl clicks over a tooth: 6 a slow clack, 18 usual, 40 a fast rattle." } },
    motion: { type: "choice", options: ["drop", "raise"], default: "drop", label: { de: "Richtung", en: "Motion" },
      labels: { drop: { de: "Herablassen", en: "Drop" }, raise: { de: "Hochkurbeln", en: "Raise" } },
      describe: { de: "Was geschieht: Herablassen (die Klicks werden schneller, am Ende ein schwerer Aufschlag) oder Hochkurbeln (gleichmäßige Klicks, am Ende rastet die Klinke ein).", en: "What happens: drop (the clicks speed up, a heavy slam at the end) or raise (even clicks, at the end the pawl locks)." } },
  },
  presets: {
    "castle-gate": { label: { de: "Burgtor", en: "Castle gate" }, values: { travel: 0.9, weight: 0.7, teeth: 18, motion: "drop" } },
    winch: { label: { de: "Hochkurbeln", en: "Winch up" }, values: { travel: 1.8, weight: 0.8, teeth: 8, motion: "raise" } },
    "cell-grate": { label: { de: "Kerkergitter", en: "Cell grate" }, values: { travel: 0.35, weight: 0.15, teeth: 30, motion: "drop" } },
  },
  loop: false, maxSeconds: 3.5,
  build(p, seed) {
    const r = rng(seed), fall = p.motion === "drop", ring = fall ? 0.25 + 0.75 * p.weight : 0.15;
    const s = buffer(p.travel + ring * 1.4 + 0.06);
    // The ratchet: a click for every tooth, ever faster while it falls, even while it is winched up
    const n = Math.max(2, Math.round(p.teeth * p.travel)), hell = 2600 - 1200 * p.weight;
    for (let k = 0; k < n; k++) {
      const u = (k + 0.3 * r()) / n, at = Math.round(p.travel * (fall ? Math.sqrt(u) : u) * RATE);
      const bp = new Biquad("bandpass", hell * (0.9 + 0.2 * r()), 4), o = new Osc("sine", r()), laut = (0.7 + 0.5 * r()) * (fall ? 0.6 + 0.4 * u : 1);
      for (let i = 0; i < 0.03 * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += (bp.run(white(r)) * envelope(t, 0.0002, 0.002) * 2 + o.next(hell * 0.5) * envelope(t, 0.0005, 0.006)) * laut;
      }
    }
    // The bars grinding in their grooves: a low rumble under the clicks, swelling while it falls
    const rumpeln = new Biquad("bandpass", 110 + 90 * (1 - p.weight), 0.9), m = Math.round(p.travel * RATE);
    for (let i = 0; i < m; i++) { const x = i / m; s[i] += rumpeln.run(white(r)) * Math.min(1, x / 0.1) * (fall ? 0.25 + 0.5 * x : 0.3) * (0.4 + 0.6 * p.weight); }
    // The end: the iron grid slams onto the stone and booms, its bars clanging bright and short over the boom;
    // or the pawl locks with one hard clunk
    const at = m, f0 = 220 * (70 / 220) ** p.weight;
    for (const [hoch, gain, kurz] of fall ? [[1, 1, 1], [5.5, 0.6, 0.3]] : [[4, 0.35, 1]])
      GITTER.forEach((v, k) => {
        const o = new Osc("sine", r()), a = gain / (1 + k * 0.6), tau = (ring * kurz) / (1 + k * 0.7);
        for (let i = 0; at + i < s.length; i++) s[at + i] += o.next(f0 * v * hoch) * envelope(i / RATE, 0.001, tau) * a;
      });
    const dumpf = new Osc("sine", 0.25);
    for (let i = 0; at + i < s.length; i++) { const t = i / RATE; s[at + i] += dumpf.next(45 + 30 * (1 - p.weight)) * envelope(t, 0.002, fall ? 0.09 : 0.03) * (fall ? 1.3 : 0.6); }
    // The tail falls silent on its own: a raised cosine over the last 20 ms
    const ende = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < ende; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ende);
    return s;
  },
});
