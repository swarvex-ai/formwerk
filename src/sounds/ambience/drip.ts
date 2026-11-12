import { buffer, envelope, LOOP_TAIL, LowPass, Osc, RATE } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Fixed loop length: the drops repeat every six seconds, the tail is folded into the start by the finish
const SECONDS = 6;

export const drip = defineSound({
  id: "drip", category: "ambience",
  title: { de: "Wassertropfen", en: "Water drip" },
  description: {
    de: "Wassertropfen als nahtlose Schleife: einzelne Tropfen in einer Höhle, einem Keller oder von einem leckenden Dach, jeder mit einem kurzen aufsteigenden Plink und seinem Echo.",
    en: "Water drops as a seamless loop: single drips in a cave, a cellar or from a leaking roof, each with a short rising plink and its echo.",
  },
  params: {
    rate: { type: "number", min: 0.3, max: 4, step: 0.1, default: 1.2, label: { de: "Tropfen pro Sekunde", en: "Drops per second" },
      describe: { de: "Wie oft es tropft: 0,3 alle paar Sekunden, 1,2 etwa jede Sekunde, 4 ein schnelles Tropfen.", en: "How often it drips: 0.3 every few seconds, 1.2 about once a second, 4 a fast drip." } },
    pitch: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Klang des Tropfens: 0 ein tiefer schwerer um 600 Hz, 0,5 mittig, 1 ein kleiner heller um 2500 Hz.", en: "Sound of the drop: 0 a low heavy one around 600 Hz, 0.5 middle, 1 a small bright one around 2500 Hz." } },
    cave: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Hall", en: "Echo" },
      describe: { de: "Nachhall: 0 trocken im Freien, 0,4 ein Keller, 0,8 eine weite Höhle, 1 ein langes Echo.", en: "Reverb tail: 0 dry outdoors, 0.4 a cellar, 0.8 a wide cave, 1 a long echo." } },
    spread: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Streuung", en: "Spread" },
      describe: { de: "Wie stark die Tonhöhe von Tropfen zu Tropfen schwankt: 0 immer gleich, 0,5 deutlich, 1 weit von tief bis hoch.", en: "How much the pitch varies from drop to drop: 0 always the same, 0.5 clearly, 1 far from low to high." } },
  },
  presets: {
    cave: { label: { de: "Höhle", en: "Cave" }, values: { cave: 0.8 } },
    cellar: { label: { de: "Keller", en: "Cellar" }, values: { rate: 0.6, cave: 0.4, pitch: 0.4 } },
    leak: { label: { de: "Undichtes Dach", en: "Leaking roof" }, values: { rate: 2.5, pitch: 0.8, cave: 0.1 } },
  },
  loop: true, maxSeconds: SECONDS,
  build(p, seed) {
    const r = rng(seed), laenge = SECONDS + LOOP_TAIL, s = buffer(laenge), n = s.length;
    const echoes = Math.round(p.cave * 4), verzoegerung = [0.11, 0.23, 0.38, 0.56];
    // The drops: a short sine plink that rises by a few semitones as the bubble closes, fast attack, then decay
    const count = Math.max(1, Math.round(p.rate * SECONDS));
    for (let k = 0; k < count; k++) {
      const at = Math.round(r() * (n - 0.1 * RATE));
      const basis = 600 * (2500 / 600) ** p.pitch * 2 ** (((r() * 2 - 1) * p.spread * 10) / 12);
      const dauer = 0.03 + r() * 0.05, steig = 3 + r() * 5, laut = 0.5 + r() * 0.5, anschlag = 0.001 + r() * 0.002;
      const m = Math.round(dauer * RATE);
      const o = new Osc("sine");
      for (let i = 0; i < m && at + i < n; i++) {
        const t = i / RATE;
        s[at + i] += o.next(basis * 2 ** ((steig * (t / dauer)) / 12)) * envelope(t, anschlag, dauer * 0.2) * laut;
      }
      // The echo: the same drop a little later, quieter and darker, further away in a bigger cave
      for (let e = 0; e < echoes; e++) {
        const spaet = Math.round(verzoegerung[e] * (0.75 + 0.5 * p.cave) * RATE), lp = new LowPass();
        const grenze = Math.max(500, basis * (0.9 - 0.12 * e) * (1 - 0.35 * p.cave)), gain = p.cave * (0.55 - 0.1 * e);
        const echo = new Osc("sine");
        for (let i = 0; i < m && at + spaet + i < n; i++) {
          const t = i / RATE;
          s[at + spaet + i] += lp.run(echo.next(basis * 2 ** ((steig * (t / dauer)) / 12)), grenze) * envelope(t, anschlag, dauer * 0.2) * laut * gain;
        }
      }
    }
    return s;
  },
});
