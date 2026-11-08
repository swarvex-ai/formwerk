import { Biquad, buffer, LOOP_TAIL, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const hum = defineSound({
  id: "hum", category: "ambience",
  title: { de: "Brummen", en: "Hum" },
  description: {
    de: "Ein technisches Brummen als nahtlose Schleife: Serverraum, Transformator, Kühlschrank, Raumschiff oder Labor, mit Netzbrummen, Summen und Lüfter.",
    en: "A technical hum as a seamless loop: a server room, a transformer, a fridge, a spaceship or a lab, with mains hum, buzz and fans.",
  },
  params: {
    pitch: { type: "number", min: 30, max: 200, step: 1, default: 50, unit: "Hz", label: { de: "Grundton", en: "Pitch" },
      describe: { de: "Tiefster Ton: 50 oder 60 Hz wie das Stromnetz, 40 Hz ein schwerer Antrieb, 120 Hz ein Kühlschrank.", en: "Lowest tone: 50 or 60 Hz like the mains, 40 Hz a heavy drive, 120 Hz a fridge." } },
    buzz: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Summen", en: "Buzz" },
      describe: { de: "Obertöne: 0 ein weicher Ton, 0,3 üblich, 1 ein schnarrender Transformator.", en: "Overtones: 0 a soft tone, 0.3 usual, 1 a rasping transformer." } },
    fan: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Lüfter", en: "Fan" },
      describe: { de: "Luftrauschen von Lüftern: 0 keines, 0,4 ein Rechner, 1 ein voller Serverraum.", en: "Air noise of fans: 0 none, 0.4 a computer, 1 a full server room." } },
    wobble: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Schweben", en: "Wobble" },
      describe: { de: "Langsames An- und Abschwellen durch einen zweiten, leicht verstimmten Ton: 0 starr, 0,2 lebendig, 1 pulsierend wie ein Raumschiff.", en: "Slow swelling from a second, slightly detuned tone: 0 rigid, 0.2 alive, 1 pulsing like a spaceship." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist klein, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is small, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    "server-room": { label: { de: "Serverraum", en: "Server room" }, values: { pitch: 50, buzz: 0.2, fan: 0.9, wobble: 0.1 } },
    transformer: { label: { de: "Transformator", en: "Transformer" }, values: { pitch: 50, buzz: 0.9, fan: 0, wobble: 0.05 } },
    spaceship: { label: { de: "Raumschiff", en: "Spaceship" }, values: { pitch: 40, buzz: 0.35, fan: 0.3, wobble: 0.8 } },
    fridge: { label: { de: "Kühlschrank", en: "Fridge" }, values: { pitch: 110, buzz: 0.4, fan: 0.15, wobble: 0.2 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), L = p.seconds, s = buffer(L + LOOP_TAIL);
    // Every tone completes whole cycles in the loop, so it folds onto itself without a beat at the seam
    const ganz = (hz: number) => Math.max(1, Math.round(hz * L)) / L;
    const f = ganz(p.pitch), schwebung = ganz(p.pitch + 0.25 + p.wobble * 1.5), obertoene = Array.from({ length: 10 }, (_, k) => [k + 2, (k % 2 ? 0.6 : 1) * r()] as const);
    const lp = new Biquad("lowpass", 900 + p.fan * 1800, 0.6), hp = new Biquad("highpass", 120, 0.7), rauf = ganz(28);
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, w = 2 * Math.PI * t;
      let ton = Math.sin(w * f) + p.wobble * 0.8 * Math.sin(w * schwebung);
      for (const [k, a] of obertoene) if (f * k < 4000) ton += Math.sin(w * f * k + a * 6) * p.buzz * (0.9 / k) * (0.5 + a);
      // A little saturation for the rasp of the buzz
      ton = Math.tanh(ton * (1 + p.buzz * 2)) * 0.6;
      // The fans: rushing air with a faint flutter of the blades
      const luft = lp.run(hp.run(white(r))) * p.fan * 1.6 * (1 + 0.15 * Math.sin(w * rauf));
      s[i] = ton + luft;
    }
    return s;
  },
});
