import { Biquad, buffer, envelope, Osc, RATE, semitones, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Pings on a pentatonic scale: they never clash, and no tune comes out of the random order
const SKALA = [0, 2, 4, 7, 9];

export const magic = defineSound({
  id: "magic", category: "effects",
  title: { de: "Magie", en: "Magic" },
  description: {
    de: "Funkeln und Schimmern: ein Zauber, Feenstaub, ein Teleport, eine Belohnung, die erscheint; steigend, fallend oder schwebend.",
    en: "Sparkle and shimmer: a spell, fairy dust, a teleport, a reward that appears; rising, falling or floating.",
  },
  params: {
    pitch: { type: "number", min: 800, max: 4000, step: 10, default: 1600, unit: "Hz", label: { de: "Höhe", en: "Pitch" },
      describe: { de: "Mitte der Töne: 900 Hz warm und weich, 1600 Hz üblich, 3500 Hz feiner Feenstaub.", en: "Centre of the notes: 900 Hz warm and soft, 1600 Hz usual, 3500 Hz fine fairy dust." } },
    length: { type: "number", min: 0.4, max: 2.1, step: 0.05, default: 1.1, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer des Funkelns: 0,5 s ein kurzer Effekt, 1,1 s ein Zauber, 2 s ein langer Teleport.", en: "Duration of the sparkle: 0.5 s a short effect, 1.1 s a spell, 2 s a long teleport." } },
    density: { type: "number", min: 0.2, max: 1, step: 0.05, default: 0.6, label: { de: "Dichte", en: "Density" },
      describe: { de: "Wie viele Töne: 0,3 einzelne Glöckchen, 0,6 üblich, 1 ein dichter Schauer.", en: "How many notes: 0.3 single little bells, 0.6 usual, 1 a dense shower." } },
    direction: { type: "choice", options: ["rise", "fall", "float"], default: "rise", label: { de: "Richtung", en: "Direction" },
      labels: { rise: { de: "Steigend", en: "Rising" }, fall: { de: "Fallend", en: "Falling" }, float: { de: "Schwebend", en: "Floating" } },
      describe: { de: "Steigend für Zaubern und Erscheinen, fallend für Verschwinden, schwebend für einen Zauber, der wirkt.", en: "Rising for casting and appearing, falling for vanishing, floating for a spell at work." } },
    shimmer: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Schimmer", en: "Shimmer" },
      describe: { de: "Ein sanfter Hauch unter den Tönen: 0 nur Töne, 0,4 üblich, 1 ein rauschender Schleier.", en: "A soft breath under the notes: 0 notes only, 0.4 usual, 1 a rushing veil." } },
  },
  presets: {
    spell: { label: { de: "Zauber", en: "Spell" }, values: { direction: "rise", length: 1.1, density: 0.6 } },
    "fairy-dust": { label: { de: "Feenstaub", en: "Fairy dust" }, values: { direction: "float", pitch: 3200, density: 0.8, shimmer: 0.2 } },
    vanish: { label: { de: "Verschwinden", en: "Vanish" }, values: { direction: "fall", length: 0.8, shimmer: 0.7 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), s = buffer(p.length + 0.35), n = Math.round(p.length * (10 + p.density * 50));
    for (let k = 0; k < n; k++) {
      const x = r(), at = Math.round(x * p.length * RATE);
      // Where on the scale: following the direction, with some scatter
      const lage = p.direction === "rise" ? x : p.direction === "fall" ? 1 - x : 0.5 + (r() - 0.5) * 0.6;
      const stufe = Math.round((lage - 0.5) * 12 + (r() - 0.5) * 3), f = semitones(p.pitch, Math.floor(stufe / 5) * 12 + SKALA[((stufe % 5) + 5) % 5]);
      if (f > 14000) continue;
      const tau = 0.03 + r() * 0.09, laut = (0.25 + 0.35 * r()) * Math.sin(Math.PI * Math.min(1, x * 1.05)) ** 0.5, o = new Osc("sine", r()), o3 = new Osc("sine");
      for (let i = 0; i < tau * 6 * RATE && at + i < s.length; i++) {
        const t = i / RATE, e = envelope(t, 0.002, tau);
        s[at + i] += (o.next(f) + o3.next(f * 3) * 0.15) * e * laut;
      }
    }
    if (p.shimmer > 0) {
      const bp = new Biquad("bandpass", p.pitch * 1.5, 2.5);
      for (let i = 0; i < p.length * RATE; i++) {
        const x = i / (p.length * RATE);
        if (i % 64 === 0) bp.set(p.pitch * (p.direction === "rise" ? 1 + x : p.direction === "fall" ? 2 - x : 1.5) , 2.5);
        s[i] += bp.run(white(r)) * Math.sin(Math.PI * x) ** 1.5 * p.shimmer * 0.9;
      }
    }
    return s;
  },
});
