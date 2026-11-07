import { Biquad, buffer, LOOP_TAIL, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const wind = defineSound({
  id: "wind", category: "ambience",
  title: { de: "Wind", en: "Wind" },
  description: {
    de: "Wind als nahtlose Schleife: leichte Brise, Böen über offenem Land oder Sturm mit Pfeifen. Läuft endlos ohne hörbare Naht.",
    en: "Wind as a seamless loop: a light breeze, gusts over open land or a storm with whistling. Plays endlessly without an audible seam.",
  },
  params: {
    strength: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Stärke", en: "Strength" },
      describe: { de: "Wie viel Wind: 0,2 eine Brise, 0,5 ein windiger Tag, 1 ein Sturm.", en: "How much wind: 0.2 a breeze, 0.5 a windy day, 1 a storm." } },
    gusts: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Böen", en: "Gusts" },
      describe: { de: "Wie sehr er auf- und abschwillt: 0 gleichmäßig, 0,5 böig, 1 wilde Stöße.", en: "How much it rises and falls: 0 steady, 0.5 gusty, 1 wild blasts." } },
    brightness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Helligkeit", en: "Brightness" },
      describe: { de: "Klangfarbe: 0 dumpf wie hinter einem Fenster, 0,4 draußen, 1 scharf an einer Bergkante.", en: "Timbre: 0 muffled like behind a window, 0.4 outdoors, 1 sharp on a mountain ridge." } },
    whistle: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Pfeifen", en: "Whistle" },
      describe: { de: "Pfeifen in Ritzen und Seilen: 0 keines, 0,4 an einem Haus, 1 an einem Schiff im Sturm.", en: "Whistling in gaps and ropes: 0 none, 0.4 around a house, 1 on a ship in a storm." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist klein, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is small, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    breeze: { label: { de: "Brise", en: "Breeze" }, values: { strength: 0.3, gusts: 0.2, brightness: 0.3 } },
    storm: { label: { de: "Sturm", en: "Storm" }, values: { strength: 1, gusts: 0.9, brightness: 0.6, whistle: 0.4 } },
    indoors: { label: { de: "Drinnen", en: "Indoors" }, values: { strength: 0.4, brightness: 0.1 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    const boe = smooth(r, laenge, 1.2 + 2.5 * (1 - p.gusts)), flattern = smooth(r, laenge, 0.15);
    const lp = new Biquad("lowpass", 800, 0.9), pfeife = new Biquad("bandpass", 1000, 12);
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, g = boe(t);
      const pegel = (0.4 + 0.6 * p.strength) * ((1 - p.gusts) * 0.7 + p.gusts * g ** 1.5 + 0.1);
      if (i % 32 === 0) {
        lp.set(200 + p.brightness * 2200 * (0.4 + 0.6 * g) + 150 * flattern(t), 0.9);
        pfeife.set(600 + 1400 * g, 12);
      }
      const n = white(r);
      s[i] = (lp.run(n) + (p.whistle > 0 ? pfeife.run(n) * p.whistle * 3 : 0)) * pegel;
    }
    return s;
  },
});
