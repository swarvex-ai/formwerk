import { buffer, LowPass, Osc, RATE } from "../../core/audio";
import { defineSound } from "../define";

export const buzz = defineSound({
  id: "buzz", category: "ui",
  title: { de: "Summer", en: "Buzz" },
  description: {
    de: "Ein tiefer, rauer Summer für Fehler: falsche Eingabe, verweigerter Zugang, falsche Antwort. Deutlich, ohne zu erschrecken.",
    en: "A low, rough buzz for errors: invalid input, access denied, a wrong answer. Clear without startling.",
  },
  params: {
    pitch: { type: "number", min: 80, max: 400, step: 1, default: 160, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Grundton des Summers: 100 Hz tief und ernst, 160 Hz üblich, 300 Hz heller wie ein kleines Gerät.", en: "Pitch of the buzz: 100 Hz low and serious, 160 Hz usual, 300 Hz brighter like a small device." } },
    pulses: { type: "integer", min: 1, max: 3, default: 2, label: { de: "Stöße", en: "Pulses" },
      describe: { de: "Wie oft er summt: 1 für einen Hinweis, 2 für falsche Eingaben, 3 für ein deutliches Nein.", en: "How often it buzzes: 1 for a note, 2 for invalid input, 3 for a clear no." } },
    length: { type: "number", min: 0.05, max: 0.4, step: 0.01, default: 0.11, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer jedes Stoßes: 0,07 s knapp, 0,11 s üblich, 0,35 s lang wie bei einer Quizshow.", en: "Duration of each pulse: 0.07 s brief, 0.11 s usual, 0.35 s long like a quiz show." } },
    rough: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Rauheit", en: "Roughness" },
      describe: { de: "Wie rau er klingt: 0 ein weicher, dumpfer Ton, 0,5 üblich, 1 schnarrend wie ein alter Summer.", en: "How rough it sounds: 0 a soft, dull tone, 0.5 usual, 1 rasping like an old buzzer." } },
  },
  presets: {
    invalid: { label: { de: "Falsche Eingabe", en: "Invalid input" }, values: { pitch: 180, pulses: 2, length: 0.08, rough: 0.35 } },
    denied: { label: { de: "Verweigert", en: "Denied" }, values: { pitch: 120, pulses: 1, length: 0.3, rough: 0.7 } },
    "wrong-answer": { label: { de: "Falsche Antwort", en: "Wrong answer" }, values: { pitch: 140, pulses: 1, length: 0.38, rough: 0.9 } },
  },
  loop: false, maxSeconds: 1.8,
  build(p) {
    const pause = Math.max(0.05, p.length * 0.6), ausklang = 0.08, s = buffer(p.pulses * p.length + (p.pulses - 1) * pause + ausklang);
    for (let n = 0; n < p.pulses; n++) {
      const at = Math.round(n * (p.length + pause) * RATE), saw = new Osc("saw"), sq = new Osc("square"), lp = new LowPass(), lp2 = new LowPass();
      // Softer filter for a soft buzz; a slow wobble makes it rasp
      const schnitt = 500 + p.rough * 2500;
      // Each pulse dies away quickly after its length, like a buzzer coil letting go
      for (let i = 0; i < (p.length + ausklang) * RATE && at + i < s.length; i++) {
        const t = i / RATE, huelle = Math.min(1, t / 0.006) * (t < p.length ? 1 : Math.exp(-(t - p.length) / 0.012));
        const rau = 1 - p.rough * 0.45 * (1 + Math.sin(2 * Math.PI * 55 * t));
        s[at + i] += lp2.run(lp.run((saw.next(p.pitch) * 0.6 + sq.next(p.pitch * 1.006) * 0.4) * rau, schnitt), schnitt) * huelle;
      }
    }
    return s;
  },
});
