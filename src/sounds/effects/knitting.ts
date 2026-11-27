import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// The needles: centre and Q of the click band, its decay, and the ring (metal only: two partials, decay range).
const NADEL = {
  metal: { hz: 5500, q: 1.2, klick: 0.0012, ring: true },
  bamboo: { hz: 1500, q: 1.4, klick: 0.007, ring: false },
} as const;

export const knitting = defineSound({
  id: "knitting", category: "effects",
  title: { de: "Stricken", en: "Knitting" },
  description: {
    de: "Zwei Stricknadeln bei der Arbeit: bei jeder Masche ein Klicken, wenn die rechte Nadel in die Masche fährt, ein leiseres beim Umschlagen und ein weiches Ziehen des Garns. Für Häuschen, gemütliche Stuben und Handarbeit.",
    en: "Two knitting needles at work: each stitch a click as the right needle slides in, a softer one as the yarn is wrapped, and a soft pull of yarn. For cottages, cosy rooms and crafts.",
  },
  params: {
    stitches: { type: "integer", min: 1, max: 12, default: 6, label: { de: "Maschen", en: "Stitches" },
      describe: { de: "Maschen in Folge: 1 eine einzelne Masche, 6 ein kurzes Stück, 12 eine fleißige Reihe.", en: "Stitches in a row: 1 a single stitch, 6 a short burst, 12 a busy row." } },
    pace: { type: "number", min: 2, max: 6, step: 0.25, default: 3.5, unit: "Hz", label: { de: "Tempo", en: "Pace" },
      describe: { de: "Maschen pro Sekunde: 2 langsam und sorgfältig, 3,5 gleichmäßig, 6 eine flinke Strickerin. Passt die Reihe nicht in 2,5 s, rücken die Maschen zusammen.", en: "Stitches per second: 2 slow and careful, 3.5 steady, 6 a fast knitter. If the row does not fit in 2.5 s, the stitches move closer." } },
    needles: { type: "choice", options: ["metal", "bamboo"], default: "metal", label: { de: "Nadeln", en: "Needles" },
      labels: { metal: { de: "Metall", en: "Metal" }, bamboo: { de: "Bambus", en: "Bamboo" } },
      describe: { de: "Die Nadeln: Metall ein helles Ticken um 4–7 kHz mit kurzem Nachklingen um 5–8 kHz, Bambus ein dumpfes Tocken um 1–2 kHz ohne Nachklang.", en: "The needles: metal a bright tick around 4–7 kHz with a short ring around 5–8 kHz, bamboo a dull tock around 1–2 kHz without ring." } },
    yarn: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Garn", en: "Yarn" },
      describe: { de: "Das weiche Ziehen des Garns nach jeder Masche, ein Rauschen um 2–5 kHz: 0 keines, 0,4 leise, 1 deutlich.", en: "The soft pull of yarn after each stitch, a hiss around 2–5 kHz: 0 none, 0.4 soft, 1 clear." } },
  },
  presets: {
    granny: { label: { de: "Großmutter", en: "Granny" }, values: { pace: 2.5, needles: "bamboo", yarn: 0.5 } },
    fast: { label: { de: "Flink", en: "Fast" }, values: { stitches: 12, pace: 5.5 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), garn = rng(seed + 1), n = p.stitches, nadel = NADEL[p.needles as keyof typeof NADEL];
    // Gaps varied ±10 %, shrunk together when the row would not fit in 2.5 s with its 0.3 s tail
    const gaps = Array.from({ length: n - 1 }, () => (1 / p.pace) * (1 + (r() - 0.5) * 0.2));
    const summe = gaps.reduce((a, b) => a + b, 0), passt = summe > 2.2 ? 2.2 / summe : 1;
    const start = [0];
    for (const g of gaps) start.push(start[start.length - 1] + g * passt);
    const s = buffer(start[n - 1] + 0.3);
    // One click: a band-passed noise burst, for metal with a short ring of two partials, tapered to zero after 5 decays
    const klick = (at: number, laut: number) => {
      const i0 = Math.round(at * RATE), bp = new Biquad("bandpass", nadel.hz * (0.95 + 0.1 * r()), nadel.q);
      const pair = new Biquad("bandpass", nadel.hz, nadel.q);
      const tau = 0.02 + 0.02 * r(), lang = nadel.ring ? 5 * tau : 8 * nadel.klick + 0.01;
      const f1 = 5200 + 600 * r(), f2 = 7000 + 800 * r(), a = new Osc("sine", r()), b = new Osc("sine", r());
      for (let i = 0; i < lang * RATE && i0 + i < s.length; i++) {
        const t = i / RATE, rest = (1 - t / lang) ** 2;
        let x = pair.run(bp.run(white(r))) * envelope(t, 0.0003, nadel.klick) * 6;
        if (nadel.ring) x += (a.next(f1) * 0.25 + b.next(f2) * 0.15) * envelope(t, 0.0005, tau);
        s[i0 + i] += x * laut * rest;
      }
    };
    for (let k = 0; k < n; k++) {
      const insert = 10 ** ((r() * 3 - 1.5) / 20), wrap = insert * 10 ** (-(4 + 2 * r()) / 20) * 10 ** ((r() * 3 - 1.5) / 20);
      const wann = start[k] + 0.05 + 0.03 * r();
      klick(start[k], insert);
      klick(wann, wrap);
      // The pull of yarn: soft noise around 2–5 kHz, rising then falling over 60–120 ms
      const dauer = 0.06 + 0.06 * r(), j0 = Math.round((wann + 0.004) * RATE), m = Math.round(dauer * RATE);
      const bp = new Biquad("bandpass", 3200 + 400 * r(), 0.7), pair = new Biquad("bandpass", 3200, 0.7);
      for (let i = 0; i < m && j0 + i < s.length && p.yarn > 0; i++) {
        const u = i / m, form = u < 0.35 ? Math.sin((Math.PI / 2) * u / 0.35) ** 2 : Math.cos((Math.PI / 2) * (u - 0.35) / 0.65) ** 2;
        s[j0 + i] += pair.run(bp.run(white(garn))) * form * p.yarn * 0.5;
      }
    }
    return s;
  },
});
