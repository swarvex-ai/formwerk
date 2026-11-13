import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const woodpecker = defineSound({
  id: "woodpecker", category: "impact",
  title: { de: "Specht", en: "Woodpecker" },
  description: {
    de: "Ein Specht trommelt auf Holz: ein schneller Wirbel kurzer, hohler Schläge, der zum Ende hin langsamer und leiser wird.",
    en: "A woodpecker drumming on wood: a fast roll of short, hollow taps that slows down and softens towards the end.",
  },
  params: {
    strikes: { type: "integer", min: 4, max: 24, default: 14, label: { de: "Schläge", en: "Strikes" },
      describe: { de: "Wie viele Schläge der Wirbel hat: 5 kurzes Picken, 14 beim Buntspecht, 24 der lange Wirbel des Schwarzspechts.", en: "How many taps the roll has: 5 short pecking, 14 a great spotted woodpecker, 24 a black woodpecker's long roll." } },
    rate: { type: "number", min: 10, max: 25, step: 0.5, default: 18, unit: "Hz", label: { de: "Tempo", en: "Rate" },
      describe: { de: "Schläge pro Sekunde am Anfang: 10 gemächlich, 18 beim Buntspecht, 24 ein surrender Wirbel.", en: "Strikes per second at the start: 10 leisurely, 18 a great spotted woodpecker, 24 a buzzing roll." } },
    pitch: { type: "number", min: 300, max: 2000, step: 10, default: 900, unit: "Hz", label: { de: "Holz", en: "Wood" },
      describe: { de: "Ton des getroffenen Holzes: 400 Hz ein dicker hohler Stamm, 900 Hz ein Ast, 1600 Hz ein dünnes trockenes Reisig.", en: "Tone of the struck wood: 400 Hz a thick hollow trunk, 900 Hz a branch, 1600 Hz a thin dry twig." } },
    ring: { type: "number", min: 0.005, max: 0.06, step: 0.001, default: 0.02, unit: "s", label: { de: "Nachklang", en: "Ring" },
      describe: { de: "Wie lange jeder Schlag nachklingt: 0,008 s grünes Holz, 0,02 s üblich, 0,05 s totes hohles Holz.", en: "How long each tap rings: 0.008 s green wood, 0.02 s usual, 0.05 s dead hollow wood." } },
    fade: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Ausklang", en: "Fade" },
      describe: { de: "Wie sehr der Wirbel zum Ende hin langsamer und leiser wird: 0 gleichmäßig, 0,5 üblich, 1 deutlich verklingend.", en: "How much the roll slows and softens towards the end: 0 even, 0.5 usual, 1 clearly dying away." } },
  },
  presets: {
    "great-spotted": { label: { de: "Buntspecht", en: "Great spotted" }, values: { strikes: 14, rate: 18 } },
    black: { label: { de: "Schwarzspecht", en: "Black woodpecker" }, values: { strikes: 24, rate: 15, pitch: 500, ring: 0.04, fade: 0.3 } },
    pecking: { label: { de: "Picken", en: "Pecking" }, values: { strikes: 5, rate: 10, pitch: 1400, ring: 0.008, fade: 0 } },
  },
  loop: false, maxSeconds: 3.5,
  build(p, seed) {
    const r = rng(seed), n = p.strikes, schritt = 1 / p.rate;
    // The gap grows by up to 40 % over the roll with fade
    const zeiten: number[] = [0];
    for (let k = 1; k < n; k++) zeiten.push(zeiten[k - 1] + schritt * (1 + p.fade * 0.4 * (k / (n - 1))) * (0.97 + r() * 0.06));
    const tau = p.ring, s = buffer(zeiten[n - 1] + tau * 7 + 0.05);
    for (let k = 0; k < n; k++) {
      const at = Math.round(zeiten[k] * RATE), u = k / (n - 1), laut = (1 - p.fade * 0.6 * u * u) * (0.85 + 0.15 * r());
      // The wood: two modes of the struck trunk and a hard click of the bill
      const f = p.pitch * (0.98 + r() * 0.04), a = new Osc("sine", r()), b = new Osc("sine", r()), bp = new Biquad("bandpass", 3000, 1);
      for (let i = 0; i < tau * 7 * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += (a.next(f) * envelope(t, 0.0005, tau) + b.next(f * 2.7) * envelope(t, 0.0003, tau * 0.4) * 0.45) * laut;
        if (t < 0.006) s[at + i] += bp.run(white(r)) * envelope(t, 0.0002, 0.0012) * 0.6 * laut;
      }
    }
    // The tail falls silent on its own: a raised cosine over the last 20 ms
    const ende = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < ende; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ende);
    return s;
  },
});
