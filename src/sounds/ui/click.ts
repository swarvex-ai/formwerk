import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const click = defineSound({
  id: "click", category: "ui",
  title: { de: "Klick", en: "Click" },
  description: {
    de: "Kurzer Klick für Knöpfe, Menüs und Schalter: weich wie ein Tippen oder knackig wie ein Kippschalter.",
    en: "A short click for buttons, menus and switches: soft like a tap or crisp like a toggle switch.",
  },
  params: {
    pitch: { type: "number", min: 300, max: 5000, step: 10, default: 1800, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Wo der Klick sitzt: 600 Hz klingt dumpf wie ein Holzknopf, 3000 Hz hell wie ein Plastikschalter.", en: "Where the click sits: 600 Hz sounds dull like a wooden button, 3000 Hz bright like a plastic switch." } },
    length: { type: "number", min: 0.01, max: 0.12, step: 0.005, default: 0.03, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Wie lange er nachklingt: 0,015 s für einen trockenen Tick, 0,08 s für ein weiches Tippen.", en: "How long it rings: 0.015 s for a dry tick, 0.08 s for a soft tap." } },
    body: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Ton", en: "Tone" },
      describe: { de: "Ton gegen Rauschen: 0 ist ein reines Knacken, 1 ein kurzer Pieps, 0,5 ein Klick mit Kern.", en: "Tone against noise: 0 is a pure crackle, 1 a short beep, 0.5 a click with a core." } },
    double: { type: "boolean", default: false, label: { de: "Doppelt", en: "Double" },
      describe: { de: "Zwei Klicks kurz nacheinander wie beim Drücken und Loslassen eines Schalters.", en: "Two clicks in quick succession, like pressing and releasing a switch." } },
  },
  presets: {
    soft: { label: { de: "Weich", en: "Soft" }, values: { pitch: 900, length: 0.06, body: 0.8 } },
    crisp: { label: { de: "Knackig", en: "Crisp" }, values: { pitch: 3200, length: 0.02, body: 0.2 } },
    switch: { label: { de: "Schalter", en: "Switch" }, values: { pitch: 2400, length: 0.025, body: 0.3, double: true } },
  },
  loop: false, maxSeconds: 0.25,
  build(p, seed) {
    const r = rng(seed), abstand = 0.045 + r() * 0.01;
    const s = buffer(p.length + (p.double ? abstand : 0) + 0.005);
    const einmal = (start: number, laut: number, hz: number) => {
      const osc = new Osc("sine"), bp = new Biquad("bandpass", hz * 1.6, 1.2), at = Math.round(start * RATE);
      for (let i = 0; at + i < s.length && i < p.length * RATE; i++) {
        const t = i / RATE, env = envelope(t, 0.0005, p.length / 5);
        const ton = osc.next(hz * (1 + 0.3 * Math.exp(-t / 0.003))) * p.body;
        s[at + i] += (ton + bp.run(white(r)) * (1 - p.body) * 2.5) * env * laut;
      }
    };
    einmal(0, 1, p.pitch);
    if (p.double) einmal(abstand, 0.7, p.pitch * 0.85);
    return s;
  },
});
