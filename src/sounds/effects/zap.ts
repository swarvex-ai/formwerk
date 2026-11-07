import { buffer, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

const LAUT = { saw: 0.5, square: 0.45, sine: 1 } as const;

export const zap = defineSound({
  id: "zap", category: "effects",
  title: { de: "Zap", en: "Zap" },
  description: {
    de: "Ein Ton, der in der Höhe gleitet: Laser, Zauber, Energie, die ausgeht oder sich auflädt.",
    en: "A tone gliding in pitch: a laser, a spell, power running down or charging up.",
  },
  params: {
    start: { type: "number", min: 100, max: 4000, step: 10, default: 1800, unit: "Hz", label: { de: "Anfang", en: "Start" },
      describe: { de: "Wo der Ton beginnt: hoch für einen Laser (2000 Hz), tief für ein Aufladen (100 Hz).", en: "Where the tone starts: high for a laser (2000 Hz), low for charging up (100 Hz)." } },
    end: { type: "number", min: 40, max: 4000, step: 10, default: 200, unit: "Hz", label: { de: "Ende", en: "End" },
      describe: { de: "Wo er endet: unter dem Anfang fällt er (Schuss, Abschalten), darüber steigt er (Aufladen).", en: "Where it ends: below the start it falls (a shot, powering down), above it rises (charging up)." } },
    length: { type: "number", min: 0.05, max: 1.2, step: 0.01, default: 0.22, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer: 0,15 s für einen Schuss, 0,8 s für Abschalten oder Aufladen.", en: "Duration: 0.15 s for a shot, 0.8 s for powering down or charging." } },
    wave: { type: "choice", options: ["saw", "square", "sine"], default: "saw", label: { de: "Welle", en: "Wave" },
      labels: { saw: { de: "Sägezahn (scharf)", en: "Saw (sharp)" }, square: { de: "Rechteck (hohl)", en: "Square (hollow)" }, sine: { de: "Sinus (rein)", en: "Sine (pure)" } },
      describe: { de: "Klangfarbe: Sägezahn scharf wie ein Laser, Rechteck hohl wie alte Automaten, Sinus rein wie ein Zauber.", en: "Timbre: saw sharp like a laser, square hollow like old arcades, sine pure like a spell." } },
    buzz: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Brummen", en: "Buzz" },
      describe: { de: "Rauheit: 0 glatt, 0,5 elektrisch, 1 knisternd wie ein Kurzschluss.", en: "Roughness: 0 smooth, 0.5 electric, 1 crackling like a short circuit." } },
  },
  presets: {
    laser: { label: { de: "Laser", en: "Laser" }, values: { start: 2200, end: 300, length: 0.18 } },
    "power-down": { label: { de: "Abschalten", en: "Power down" }, values: { start: 800, end: 50, length: 1, wave: "square", buzz: 0.1 } },
    "charge-up": { label: { de: "Aufladen", en: "Charge up" }, values: { start: 100, end: 1500, length: 0.9, wave: "sine", buzz: 0.4 } },
  },
  loop: false, maxSeconds: 1.25,
  build(p, seed) {
    const r = rng(seed), s = buffer(p.length), osc = new Osc(p.wave), fm = new Osc("sine"), steigt = p.end > p.start;
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, x = t / p.length, f = p.start * (p.end / p.start) ** x;
      const env = Math.min(1, t / 0.002) * (steigt ? (0.3 + 0.7 * x) * Math.min(1, (1 - x) / 0.25) : (1 - x) ** 0.9);
      const ton = osc.next(f * (1 + p.buzz * 0.5 * fm.next(f * 1.5))) * LAUT[p.wave];
      s[i] = (ton + white(r) * p.buzz * 0.2) * env;
    }
    return s;
  },
});
