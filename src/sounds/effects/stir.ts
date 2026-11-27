import { Biquad, buffer, envelope, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Swirl centre and tap ping per vessel: the tap rings at hz with a second partial at 2.76 × hz and dies in `decay` s.
const GEFAESS = {
  cup: { swirl: 800, hz: 2400, decay: 0.08 },
  pot: { swirl: 400, hz: 900, decay: 0.15 },
} as const;
const TAIL = 0.15, OVERLAP = 0.25, TAP_DB = 6;

export const stir = defineSound({
  id: "stir", category: "effects",
  title: { de: "Umrühren", en: "Stir" },
  description: {
    de: "Ein Löffel rührt in einer Tasse, einem Trankglas oder einem Kochtopf: zwei bis fünf Runden eines Flüssigkeitswirbels, ab und zu tippt der Löffel an die Wand, für Küchen, Tavernen, Apotheken und Handwerksmenüs.",
    en: "A spoon stirring in a cup, a potion glass or a cooking pot: two to five circles of a liquid swirl, the spoon tapping the wall now and then, for kitchens, taverns, apothecaries and crafting menus.",
  },
  params: {
    circles: { type: "integer", min: 2, max: 5, default: 3, label: { de: "Runden", en: "Circles" },
      describe: { de: "Runden des Löffels: 2 ein kurzes Umrühren, 3 eine Tasse Tee, 5 gründliches Rühren im Topf.", en: "Circles of the spoon: 2 a quick stir, 3 a cup of tea, 5 thorough stirring in a pot." } },
    tempo: { type: "number", min: 1, max: 3, step: 0.1, default: 2, label: { de: "Tempo", en: "Tempo" },
      describe: { de: "Runden pro Sekunde: 1 langsam und bedächtig, 2 normales Umrühren, 3 schnell und eilig.", en: "Circles per second: 1 slow and careful, 2 ordinary stirring, 3 quick and hurried." } },
    vessel: { type: "choice", options: ["cup", "pot"], default: "cup", label: { de: "Gefäß", en: "Vessel" },
      labels: { cup: { de: "Tasse", en: "Cup" }, pot: { de: "Topf", en: "Pot" } },
      describe: { de: "Das Gefäß: Tasse mit hellem Ping um 2400 Hz (80 ms) und Wirbel um 800 Hz, Topf mit dumpfem Ping um 900 Hz (150 ms) und Wirbel um 400 Hz.", en: "The vessel: cup with a bright ping near 2400 Hz (80 ms) and a swirl near 800 Hz, pot with a dull ping near 900 Hz (150 ms) and a swirl near 400 Hz." } },
    taps: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Anschläge", en: "Taps" },
      describe: { de: "Wahrscheinlichkeit, dass der Löffel in einer Runde an die Wand tippt: 0 nie, 0,6 meistens, 1 in jeder Runde.", en: "Chance that the spoon taps the wall in a circle: 0 never, 0.6 most circles, 1 every circle." } },
    liquid: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Flüssigkeit", en: "Liquid" },
      describe: { de: "Wie stark sich die Flüssigkeit bewegt: 0 ein dünner sanfter Wirbel, 0,5 Tee, 1 ein volles Schwappen (lauter, breiteres Band).", en: "How much the liquid moves: 0 a thin gentle swirl, 0.5 tea, 1 a full slosh (louder, wider band)." } },
  },
  presets: {
    tea: { label: { de: "Tee", en: "Tea" }, values: { vessel: "cup" } },
    potion: { label: { de: "Zaubertrank", en: "Potion" }, values: { vessel: "cup", taps: 1, tempo: 2.6 } },
    stew: { label: { de: "Eintopf", en: "Stew" }, values: { vessel: "pot", liquid: 0.9, tempo: 1.2, circles: 4 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), g = GEFAESS[p.vessel as keyof typeof GEFAESS] ?? GEFAESS.cup;
    // One circle lasts 1 / tempo, but at most 2.3 / (circles + 0.25): circles plus overlap stay within 2.3 s, tail included 2.45 s
    const d = Math.min(1 / p.tempo, 2.3 / (p.circles + OVERLAP)), w = d * (1 + OVERLAP);
    const s = buffer((p.circles + OVERLAP) * d + TAIL), n = s.length;

    // 1. Swirl: low band-passed noise, swelling once per circle (sine window), the centre gliding up a little as the
    //    spoon goes round, then a low-pass takes the hiss off; more liquid is louder and wider.
    const bp = new Biquad("bandpass", g.swirl, 1), lp = new Biquad("lowpass", g.swirl * (2 + 2 * p.liquid), 0.7), wobble = smooth(r, n / RATE, 0.12);
    const q = 1.3 - 0.6 * p.liquid, laut = 0.4 + 0.6 * p.liquid;
    const versatz = Array.from({ length: p.circles }, () => 0.9 + 0.2 * r());
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      let env = 0, hz = g.swirl;
      for (let c = 0; c < p.circles; c++) {
        const x = (t - c * d) / w;
        if (x <= 0 || x >= 1) continue;
        env += Math.sin(Math.PI * x);
        hz = g.swirl * versatz[c] * (0.85 + 0.3 * x);
      }
      bp.set(hz * (0.9 + 0.2 * wobble(t)), q);
      s[i] = lp.run(bp.run(white(r))) * env * laut;
    }

    // 2. Taps from their own stream: whether a circle taps and where (second half of the circle). Each ping peaks
    //    about 11–13 dB above the swirl's RMS around it (TAP_DB on its amplitude, the partials add the rest), two sine
    //    partials (1 and 2.76, half as loud), 3 ms attack.
    const rt = rng(seed + 1), tau = g.decay / 5;
    for (let c = 0; c < p.circles; c++) {
      const tapt = rt() < p.taps, wo = 0.5 + 0.45 * rt(), detune = 0.97 + 0.06 * rt();
      if (!tapt) continue;
      const at = Math.round((c + wo) * d * RATE), rad = Math.round(0.03 * RATE);
      let sq = 0, cnt = 0;
      for (let i = Math.max(0, at - rad); i < Math.min(n, at + rad); i++) { sq += s[i] * s[i]; cnt++; }
      const amp = Math.sqrt(sq / Math.max(1, cnt)) * 10 ** (TAP_DB / 20) / 1.25;
      const a = new Osc("sine"), b = new Osc("sine"), f = g.hz * detune, len = Math.min(n - at, Math.round(g.decay * 1.6 * RATE));
      for (let i = 0; i < len; i++) {
        const e = envelope(i / RATE, 0.003, tau);
        s[at + i] += (a.next(f) + 0.5 * b.next(f * 2.76)) * e * amp;
      }
    }
    return s;
  },
});
