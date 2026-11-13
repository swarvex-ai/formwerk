import { Biquad, buffer, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// The tool: centre of the scratch band, its width, how coarse the grain of the paper comes through, the band of a tap
const WERKZEUG = {
  pencil: { band: 4300, q: 0.9, korn: 0.011, tipp: 5000, klicken: false },
  quill: { band: 7000, q: 1.4, korn: 0.007, tipp: 8200, klicken: false },
  chalk: { band: 2500, q: 0.75, korn: 0.019, tipp: 3400, klicken: true },
} as const;

// The effects budget is 2.5 s: writing wished longer holds as many strokes as fit into it.
const LAENGSTE = 2.45;

type Strich = { at: number; len: number; amp: number; hz: number; an: number; aus: number; q: number };

export const writing = defineSound({
  id: "writing", category: "effects",
  title: { de: "Schreiben", en: "Writing" },
  description: {
    de: "Mit der Hand schreiben: Strich für Strich auf Papier, mit Wortpausen, Punkten und beim Federkiel dem kurzen Dippen in die Tinte; für Notizen, Schulen, Büros und Questlogs.",
    en: "Writing by hand: stroke after stroke on paper, with word gaps, dots and, on a quill, the short dip into the ink; for notes, schools, offices and quest logs.",
  },
  params: {
    seconds: { type: "number", min: 0.5, max: 3, step: 0.1, default: 1.5, unit: "s", label: { de: "Schreibzeit", en: "Writing time" },
      describe: { de: "Wie lange geschrieben wird: 0,6 s ein Wort, 1,5 s ein kurzer Satz, 3 s eine lange Zeile; über 2,4 s passen nur so viele Striche in den Klang, wie in 2,4 s passen.", en: "How long the writing goes on: 0.6 s a word, 1.5 s a short sentence, 3 s a long line; past 2.4 s only the strokes that fit into 2.4 s are written." } },
    tool: { type: "choice", options: ["pencil", "quill", "chalk"], default: "pencil", label: { de: "Stift", en: "Tool" },
      labels: { pencil: { de: "Bleistift", en: "Pencil" }, quill: { de: "Federkiel", en: "Quill" }, chalk: { de: "Kreide", en: "Chalk" } },
      describe: { de: "Der Stift: Bleistift ein weiches trockenes Kratzen um 4 kHz, Federkiel dünner und kratziger um 7 kHz mit Dippen zum Tintenholen, Kreide tiefer und körniger um 2,5 kHz mit winzigen Klicks.", en: "The pen: pencil a soft dry scratch around 4 kHz, quill thinner and scratchier around 7 kHz with a dip for ink, chalk lower and grainier around 2.5 kHz with tiny clicks." } },
    speed: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Schreibtempo", en: "Writing speed" },
      describe: { de: "Striche pro Sekunde: 0 sorgfältige Schrift (etwa 3), 0,5 flüssige Handschrift (etwa 6), 1 hastige Krakelei (etwa 9); schnelle Hände machen kürzere Striche.", en: "Strokes per second: 0 careful handwriting (about 3), 0.5 a fluent hand (about 6), 1 a hasty scribble (about 9); a fast hand takes shorter strokes." } },
    pressure: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Druck", en: "Pressure" },
      describe: { de: "Wie fest der Stift aufsitzt: 0,2 leichtes Kritzeln, 0,5 normale Hand, 0,9 starkes Aufdrücken; mehr Druck macht es lauter und heller.", en: "How hard the pen sits on the paper: 0.2 light scribbling, 0.5 a normal hand, 0.9 pressing hard; more pressure makes it louder and brighter." } },
  },
  presets: {
    "pencil-note": { label: { de: "Bleistiftnotiz", en: "Pencil note" }, values: { tool: "pencil", speed: 0.5 } },
    "quill-letter": { label: { de: "Federkielbrief", en: "Quill letter" }, values: { tool: "quill", speed: 0.35, seconds: 2.5 } },
    chalkboard: { label: { de: "Tafel", en: "Chalkboard" }, values: { tool: "chalk", pressure: 0.7 } },
    scribble: { label: { de: "Krakelei", en: "Scribble" }, values: { speed: 1, seconds: 0.8 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), w = WERKZEUG[p.tool as keyof typeof WERKZEUG];
    const ende = Math.min(p.seconds, LAENGSTE), s = buffer(ende);
    const laut = 0.5 + 0.9 * p.pressure, hell = 0.88 + 0.24 * p.pressure, zyklus = 1 / (3 + 6 * p.speed);
    const koerner = smooth(r, ende + 0.05, w.korn);
    // The rhythm first: stroke, gap, a longer gap when a word is done, now and then a tap for a dot or a full stop,
    // and on the quill the lift to the ink. Every stroke keeps its own band, accent, attack and release.
    const striche: Strich[] = [], tips: Strich[] = [];
    let zeit = 0.012, worter = 0, naechstesWort = 4 + Math.floor(r() * 4), tippBei = 5 + Math.floor(r() * 6), dippeBei = 5 + Math.floor(r() * 5);
    for (let n = 0; ; n++) {
      const len = Math.min(0.25, Math.max(0.06, zyklus * (0.6 + 0.24 * r())));
      if (zeit + len > ende - 0.05) break;
      const heben = p.tool === "quill" && n >= dippeBei;
      striche.push({ at: zeit, len, amp: laut * (0.65 + 0.55 * r()) * (heben ? 0.75 : 1), hz: w.band * (0.85 + 0.3 * r()) * hell, an: 0.005 + 0.01 * r(), aus: (0.005 + 0.01 * r()) * (heben ? 2.4 : 1), q: w.q });
      if (n >= tippBei && zeit + len + 0.03 < ende - 0.05) {
        tips.push({ at: zeit + len + 0.01 + 0.025 * r(), len: 0.012, amp: laut * (1.1 + 0.35 * r()), hz: w.tipp * (0.9 + 0.25 * r()) * hell, an: 0.005, aus: 0.006, q: 1.7 });
        tippBei = n + 6 + Math.floor(r() * 7);
      }
      let luecke = zyklus * (0.24 + 0.14 * r());
      if (worter++ >= naechstesWort) { luecke = Math.max(luecke, 0.1 + 0.1 * r()); worter = 0; naechstesWort = 4 + Math.floor(r() * 4); }
      if (heben) { luecke = 0.12 + 0.09 * r(); dippeBei = n + 6 + Math.floor(r() * 5); }
      zeit += len + luecke;
    }
    // One stroke: white noise through two band-passes of the tool's band (the pair keeps the hiss far above it out),
    // the grain of the paper wobbling through it, gently attacked and released over 5 to 15 ms.
    // Chalk carries a tiny click of dust every 15 to 35 ms.
    const malen = (e: Strich) => {
      const bp = new Biquad("bandpass", e.hz, e.q), paar = new Biquad("bandpass", e.hz, e.q);
      const hk = new Biquad("bandpass", w.tipp, 1.8);
      const a = Math.round(e.at * RATE), n = Math.round(e.len * RATE);
      const abstand = 700 + Math.floor(950 * r()), tau = 0.0013 * RATE;
      let start = -1, kraft = 0;
      for (let j = 0; j < n && a + j < s.length; j++) {
        const u = j / RATE, hue = Math.min(1, u / e.an, (e.len - u) / e.aus);
        if (hue <= 0) continue;
        let x = bp.run(paar.run(white(r))) * hue * (0.35 + 0.95 * koerner(e.at + u)) * e.amp;
        if (w.klicken) {
          if (j % abstand === abstand - 1) { start = j; kraft = 0.4 + 0.4 * r(); }
          const seither = j - start;
          if (seither >= 0 && seither < 400) x += hk.run(white(r)) * kraft * Math.min(1, seither / 80) * Math.exp(-seither / tau) * e.amp * 0.7;
        }
        s[a + j] += x;
      }
    };
    for (const e of striche) malen(e);
    for (const e of tips) malen(e);
    return s;
  },
});
