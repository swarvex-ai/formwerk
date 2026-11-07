import { Biquad, buffer, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const whoosh = defineSound({
  id: "whoosh", category: "movement",
  title: { de: "Wusch", en: "Whoosh" },
  description: {
    de: "Luft, die vorbeizischt: Schwertschwung, Pfeil, Ausweichrolle, ein Schlag, der danebengeht.",
    en: "Air rushing past: a sword swing, an arrow, a dodge roll, a blow that misses.",
  },
  params: {
    pitch: { type: "number", min: 200, max: 4000, step: 10, default: 900, unit: "Hz", label: { de: "Höhe", en: "Pitch" },
      describe: { de: "Wie hell die Luft klingt: 400 Hz für eine schwere Keule, 1400 Hz für ein Schwert, 2500 Hz für einen Pfeil.", en: "How bright the air sounds: 400 Hz for a heavy club, 1400 Hz for a sword, 2500 Hz for an arrow." } },
    length: { type: "number", min: 0.1, max: 1.2, step: 0.01, default: 0.35, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer: 0,2 s für einen schnellen Hieb, 0,6 s für einen weiten Schwung.", en: "Duration: 0.2 s for a quick slash, 0.6 s for a wide swing." } },
    sweep: { type: "choice", options: ["swell", "down", "up"], default: "swell", label: { de: "Verlauf", en: "Sweep" },
      labels: { swell: { de: "An- und abschwellend", en: "Swell" }, down: { de: "Fallend (vorbei)", en: "Falling (passing by)" }, up: { de: "Steigend (kommt näher)", en: "Rising (coming closer)" } },
      describe: { de: "Wie sich die Höhe bewegt: anschwellend für einen Schwung, fallend für etwas, das vorbeifliegt, steigend für etwas, das näher kommt.", en: "How the pitch moves: swell for a swing, falling for something flying past, rising for something coming closer." } },
    sharpness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Schärfe", en: "Sharpness" },
      describe: { de: "0 ist weiches Rauschen wie ein Umhang, 1 ein schneidendes Pfeifen wie eine dünne Klinge.", en: "0 is a soft rush like a cloak, 1 a cutting whistle like a thin blade." } },
  },
  presets: {
    "sword-swing": { label: { de: "Schwertschwung", en: "Sword swing" }, values: { pitch: 1400, length: 0.25, sharpness: 0.7 } },
    arrow: { label: { de: "Pfeil", en: "Arrow" }, values: { pitch: 2500, length: 0.5, sweep: "down", sharpness: 0.8 } },
    "heavy-swing": { label: { de: "Schwerer Schwung", en: "Heavy swing" }, values: { pitch: 400, length: 0.6, sharpness: 0.2 } },
  },
  loop: false, maxSeconds: 1.25,
  build(p, seed) {
    const r = rng(seed), s = buffer(p.length), q = 0.8 + p.sharpness * 4;
    const bp1 = new Biquad("bandpass", p.pitch, q), bp2 = new Biquad("bandpass", p.pitch, q);
    // The loudest moment comes earlier for sharp swings: sin(pi x^a) peaks where x^a = 0.5
    const spitze = 0.6 - 0.3 * p.sharpness, a = Math.log(0.5) / Math.log(spitze);
    for (let i = 0; i < s.length; i++) {
      const x = i / RATE / p.length, bogen = Math.sin(Math.PI * x ** a);
      const fc = p.sweep === "down" ? p.pitch * (1.6 - x) : p.sweep === "up" ? p.pitch * (0.6 + x) : p.pitch * (0.6 + 0.8 * bogen);
      if (i % 16 === 0) { bp1.set(fc, q); bp2.set(fc, q); }
      s[i] = bp2.run(bp1.run(white(r))) * bogen * bogen;
    }
    return s;
  },
});
