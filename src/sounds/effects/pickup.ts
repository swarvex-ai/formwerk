import { buffer, envelope, Osc, RATE, semitones } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

const LAUT = { square: 0.5, triangle: 0.9, sine: 1 } as const;

export const pickup = defineSound({
  id: "pickup", category: "effects",
  title: { de: "Aufsammeln", en: "Pickup" },
  description: {
    de: "Münze, Edelstein, Heiltrank oder Punkte: kurze steigende Töne, auf Wunsch mit Funkeln.",
    en: "A coin, a gem, a potion or points: short rising notes, with sparkle if you like.",
  },
  params: {
    pitch: { type: "number", min: 500, max: 2500, step: 1, default: 1000, unit: "Hz", label: { de: "Höhe", en: "Pitch" },
      describe: { de: "Der erste Ton: 700 Hz für Heilung und große Dinge, 1000 Hz für Münzen, 1500 Hz für Edelsteine.", en: "The first note: 700 Hz for healing and big things, 1000 Hz for coins, 1500 Hz for gems." } },
    notes: { type: "integer", min: 1, max: 4, default: 2, label: { de: "Töne", en: "Notes" },
      describe: { de: "Wie viele Töne: 2 für eine Münze, 3 bis 4 für etwas Wertvolles.", en: "How many notes: 2 for a coin, 3 to 4 for something precious." } },
    step: { type: "integer", min: 1, max: 12, default: 5, label: { de: "Schritt (Halbtöne)", en: "Step (semitones)" },
      describe: { de: "Abstand der Töne: 4 eine große Terz, 5 eine Quarte wie bei klassischen Münzen, 7 eine Quinte, 12 eine Oktave.", en: "Interval between notes: 4 a major third, 5 a fourth like classic coins, 7 a fifth, 12 an octave." } },
    wave: { type: "choice", options: ["square", "triangle", "sine"], default: "square", label: { de: "Welle", en: "Wave" },
      labels: { square: { de: "Rechteck (8 Bit)", en: "Square (8-bit)" }, triangle: { de: "Dreieck (weich)", en: "Triangle (soft)" }, sine: { de: "Sinus (glockig)", en: "Sine (bell-like)" } },
      describe: { de: "Klangfarbe: Rechteck für Retro-Münzen, Dreieck weicher, Sinus klar wie Glas.", en: "Timbre: square for retro coins, triangle softer, sine clear like glass." } },
    sparkle: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Funkeln", en: "Sparkle" },
      describe: { de: "Glitzern im Nachklang: 0 trocken, 0,4 eine Münze, 0,8 ein magischer Gegenstand.", en: "Glitter in the tail: 0 dry, 0.4 a coin, 0.8 a magic item." } },
  },
  presets: {
    coin: { label: { de: "Münze", en: "Coin" }, values: { pitch: 988, notes: 2, step: 5, wave: "square", sparkle: 0.2 } },
    gem: { label: { de: "Edelstein", en: "Gem" }, values: { pitch: 1400, notes: 3, step: 7, wave: "sine", sparkle: 0.8 } },
    heal: { label: { de: "Heilung", en: "Heal" }, values: { pitch: 700, notes: 3, step: 4, wave: "triangle", sparkle: 0.6 } },
  },
  loop: false, maxSeconds: 1.8,
  build(p, seed) {
    const r = rng(seed), kurz = 0.055, ring = 0.06 + p.sparkle * 0.25;
    const s = buffer((p.notes - 1) * kurz + ring * 5 + 0.01);
    for (let n = 0; n < p.notes; n++) {
      const f = semitones(p.pitch, p.step * n), at = Math.round(n * kurz * RATE), letzter = n === p.notes - 1;
      const dauer = letzter ? ring * 5 : kurz, osc = new Osc(p.wave);
      for (let i = 0; i < dauer * RATE && at + i < s.length; i++) {
        const t = i / RATE, env = letzter ? envelope(t, 0.002, ring) : Math.min(1, t / 0.002) * Math.min(1, (dauer - t) / 0.006);
        s[at + i] += osc.next(f) * env * LAUT[p.wave];
      }
    }
    if (p.sparkle > 0) {
      // Shimmer: a high, trembling partial over the last note, and a few tiny pings in the tail
      const f = semitones(p.pitch, p.step * (p.notes - 1)) * 4, at = Math.round((p.notes - 1) * kurz * RATE), o = new Osc("sine");
      if (f < 18000) for (let i = 0; at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += o.next(f) * envelope(t, 0.01, ring * 0.8) * (0.5 + 0.5 * Math.sin(2 * Math.PI * 25 * t)) * p.sparkle * 0.3;
      }
      for (let k = 0; k < Math.round(2 + p.sparkle * 5); k++) {
        const hz = 3000 + r() * 5000, start = at + Math.round(r() * ring * 2.5 * RATE), q = new Osc("sine");
        for (let i = 0; i < 0.06 * RATE && start + i < s.length; i++) s[start + i] += q.next(hz) * envelope(i / RATE, 0.001, 0.012) * p.sparkle * 0.25;
      }
    }
    return s;
  },
});
