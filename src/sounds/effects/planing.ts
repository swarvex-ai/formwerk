import { Biquad, buffer, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const planing = defineSound({
  id: "planing", category: "effects",
  title: { de: "Hobeln", en: "Planing" },
  description: {
    de: "Ein Handhobel auf einem Brett: einige lange, gleichmäßige Hobelzüge, jeder ein Zischen der Klinge, die einen Span abnimmt, und ein jähes Ende, wenn der Hobel über die Kante läuft. Hartholz klingt heller und dünner als Weichholz, ein Ast lässt die Klinge rattern.",
    en: "A hand plane on a board: a few long, even strokes, each a hiss of the blade taking off a shaving, ending abruptly as the plane leaves the board's end. Hard wood sounds brighter and thinner than soft wood, and a knot makes the blade chatter.",
  },
  params: {
    strokes: { type: "integer", min: 1, max: 4, default: 2, label: { de: "Züge", en: "Strokes" },
      describe: { de: "Wie viele Hobelzüge nacheinander, mit kurzer Pause dazwischen: 1 ein einzelner Zug, 2 ein Brett glätten, 4 eine ganze Reihe. Was nicht in 2,5 s passt, wird kürzer.", en: "How many strokes in a row, with a short pause between them: 1 a single stroke, 2 smoothing a board, 4 a whole run. Strokes that do not fit into 2.5 s get shorter." } },
    length: { type: "number", min: 0.25, max: 0.8, step: 0.05, default: 0.45, unit: "s", label: { de: "Zuglänge", en: "Stroke length" },
      describe: { de: "Dauer eines Zugs in Sekunden: 0,25 s ein kurzer Schnitt über Hirnholz, 0,45 s ein Brett, 0,8 s eine lange Bohle.", en: "Length of one stroke in seconds: 0.25 s a short end-grain trim, 0.45 s a board, 0.8 s a long plank." } },
    wood: { type: "choice", options: ["soft", "hard"], default: "soft", label: { de: "Holz", en: "Wood" },
      labels: { soft: { de: "Weichholz", en: "Soft wood" }, hard: { de: "Hartholz", en: "Hard wood" } },
      describe: { de: "Weichholz wie Kiefer ein warmes Zischen um 2 kHz, Hartholz wie Eiche oder Buche ein helleres, dünneres Zischen um 3,8 kHz.", en: "Soft wood such as pine a warm hiss around 2 kHz, hard wood such as oak or beech a brighter, thinner hiss around 3.8 kHz." } },
    chatter: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Rattern", en: "Chatter" },
      describe: { de: "Wie stark die Klinge an Ästen rattert: 0 glattes Holz ohne Klicks, 0,2 ein Klick hier und da, 1 sechs Klicks pro Zug in astigem Holz.", en: "How much the blade skips on knots: 0 clear wood without clicks, 0.2 a click here and there, 1 six clicks per stroke in knotty wood." } },
  },
  presets: {
    smoothing: { label: { de: "Glätten", en: "Smoothing" }, values: { wood: "soft" } },
    hardwood: { label: { de: "Hartholz", en: "Hardwood" }, values: { wood: "hard", strokes: 3, length: 0.35 } },
    rough: { label: { de: "Grob", en: "Rough" }, values: { chatter: 0.8, length: 0.6 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), c = rng(seed + 1), hard = p.wood === "hard", tail = 0.08;
    // Stroke lengths (±10 %) and gaps (0.12–0.2 s); strokes shrink so everything fits in 2.5 s.
    const lengths = Array.from({ length: p.strokes }, () => p.length * (0.9 + 0.2 * r()));
    const gaps = Array.from({ length: p.strokes - 1 }, () => 0.12 + 0.08 * r());
    const pauses = gaps.reduce((a, b) => a + b, 0), sum = lengths.reduce((a, b) => a + b, 0);
    const fit = Math.min(1, (2.5 - pauses - tail) / sum);
    const s = buffer(sum * fit + pauses + tail);
    const centre = hard ? 3800 : 2000, q = hard ? 1 : 0.8;
    let at = 0;
    for (let k = 0; k < p.strokes; k++) {
      const i0 = Math.round(at * RATE), len = Math.round(lengths[k] * fit * RATE);
      const bite = Math.round((0.03 + 0.02 * r()) * RATE), fall = Math.round(0.02 * RATE);
      const swell = 0.5 + 0.5 * r(), phase = 2 * Math.PI * r();
      const bp = new Biquad("bandpass", centre, q), top = new Biquad("lowpass", centre * 1.8), body = new Biquad("bandpass", 250, 1.2);
      // The blade bites, hisses evenly with a slow swell of ±2 dB, and stops short as the plane leaves the board.
      let sq = 0;
      for (let i = 0; i < len; i++) {
        const n = white(r), u = i / len;
        const rise = i < bite ? Math.sin((Math.PI / 2) * (i / bite)) : 1;
        const end = len - i <= fall ? 0.5 - 0.5 * Math.cos((Math.PI * (len - i)) / fall) : 1;
        const level = 10 ** ((2 * Math.sin(2 * Math.PI * swell * u + phase)) / 20) * rise * end;
        const x = (top.run(bp.run(n)) + body.run(n) * 0.8) * level;
        s[i0 + i] = x; sq += x * x;
      }
      // Chatter on knots: short high-passed clicks about 6 dB above the stroke, from their own stream.
      const rms = Math.sqrt(sq / Math.max(1, len)), clicks = Math.round(6 * p.chatter);
      for (let n = 0; n < clicks; n++) {
        const j0 = i0 + Math.round((0.1 + 0.8 * c()) * len), m = Math.round((0.002 + 0.002 * c()) * RATE);
        const hp = new Biquad("highpass", 4000, 0.707), amp = 2.5 * rms;
        for (let j = 0; j < m; j++) s[j0 + j] += hp.run(white(c)) * Math.sin((Math.PI * j) / m) * amp;
      }
      at += lengths[k] * fit + (gaps[k] ?? 0);
    }
    return s;
  },
});
