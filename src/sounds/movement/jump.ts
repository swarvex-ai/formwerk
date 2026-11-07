import { buffer, Osc, RATE } from "../../core/audio";
import { defineSound } from "../define";

const LAUT = { square: 0.5, triangle: 0.9, sine: 1 } as const;

export const jump = defineSound({
  id: "jump", category: "movement",
  title: { de: "Sprung", en: "Jump" },
  description: {
    de: "Ein Ton, der nach oben schnellt: Sprung im Jump 'n' Run, Federn, Hüpfen. Als Rechteck klingt er nach alten Konsolen.",
    en: "A tone that shoots up: a platformer jump, a spring, a hop. As a square wave it sounds like old consoles.",
  },
  params: {
    pitch: { type: "number", min: 120, max: 900, step: 1, default: 280, unit: "Hz", label: { de: "Starthöhe", en: "Start pitch" },
      describe: { de: "Wo der Ton beginnt: 150 Hz für große Figuren, 300 Hz für Helden, 600 Hz für kleine und flinke.", en: "Where the tone starts: 150 Hz for big characters, 300 Hz for heroes, 600 Hz for small and nimble ones." } },
    rise: { type: "number", min: 0, max: 2, step: 0.05, default: 1, label: { de: "Anstieg (Oktaven)", en: "Rise (octaves)" },
      describe: { de: "Wie weit er steigt: 0,5 Oktaven für einen kleinen Hüpfer, 1 für einen Sprung, 2 für einen Supersprung.", en: "How far it rises: 0.5 octaves for a small hop, 1 for a jump, 2 for a super jump." } },
    length: { type: "number", min: 0.06, max: 0.5, step: 0.01, default: 0.18, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer: 0,1 s wirkt flink, 0,3 s schwebend.", en: "Duration: 0.1 s feels quick, 0.3 s floaty." } },
    wave: { type: "choice", options: ["square", "triangle", "sine"], default: "square", label: { de: "Welle", en: "Wave" },
      labels: { square: { de: "Rechteck (8 Bit)", en: "Square (8-bit)" }, triangle: { de: "Dreieck (weich)", en: "Triangle (soft)" }, sine: { de: "Sinus (rund)", en: "Sine (round)" } },
      describe: { de: "Klangfarbe: Rechteck für Retro, Dreieck weicher, Sinus rund wie ein Pfeifen.", en: "Timbre: square for retro, triangle softer, sine round like a whistle." } },
    wobble: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Federn", en: "Wobble" },
      describe: { de: "Zittern im Ton: 0 glatt, 0,7 wie eine Sprungfeder.", en: "Wobble in the tone: 0 smooth, 0.7 like a spring." } },
  },
  presets: {
    retro: { label: { de: "Retro", en: "Retro" }, values: { wave: "square", rise: 1, pitch: 280 } },
    soft: { label: { de: "Weich", en: "Soft" }, values: { wave: "sine", rise: 0.6, pitch: 400, length: 0.12 } },
    spring: { label: { de: "Sprungfeder", en: "Spring" }, values: { wave: "triangle", wobble: 0.8, length: 0.35, rise: 0.8 } },
  },
  loop: false, maxSeconds: 0.55,
  build(p) {
    const s = buffer(p.length), osc = new Osc(p.wave);
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, x = t / p.length, kurve = 1 - (1 - x) * (1 - x);
      const f = p.pitch * 2 ** (p.rise * kurve) * (1 + p.wobble * 0.25 * Math.sin(2 * Math.PI * 16 * t));
      s[i] = osc.next(f) * Math.min(1, t / 0.003) * (1 - x) ** 1.2 * LAUT[p.wave];
    }
    return s;
  },
});
