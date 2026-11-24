import { Biquad, buffer, envelope, grains, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const appleBite = defineSound({
  id: "apple-bite", category: "impact",
  title: { de: "Apfelbiss", en: "Apple bite" },
  description: {
    de: "Ein knackiger Biss in einen frischen Apfel: der scharfe Knirsch, wenn die Zähne die Haut und das Fleisch durchbrechen, ein kurzes nasses Zischen vom Saft, und optional ein paar gedämpfte Kaugeräusche danach. Zum Essen, Heilen und Aufheben von Gegenständen, in Obstgärten, Küchen und auf Märkten.",
    en: "A crisp bite into a fresh apple: the sharp crunch as the teeth break the skin and flesh, a short wet hiss of juice, and optionally a few muffled chewing crunches after. For eating, healing and pickup moments, in orchards, kitchens and markets.",
  },
  params: {
    crispness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.7, label: { de: "Knackigkeit", en: "Crispness" },
      describe: { de: "Wie knackig das Obst ist: 0 ein mehliger, weicher Apfel: ein dumpfer kurzer Knirsch; 0,7 ein frischer Apfel; 1 ein sehr harter Apfel oder eine rohe Karotte: ein heller, dichter Knacks.", en: "How crisp the fruit is: 0 a soft mealy apple: a dull short crunch; 0.7 a fresh apple; 1 a very hard apple or a raw carrot: a bright dense crack." } },
    size: { type: "number", min: 0.5, max: 1.5, step: 0.05, default: 1, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß der Biss ist: 0,5 ein kleiner Biss: kürzer und höher; 1,5 ein großer Biss: länger und voller.", en: "How big the bite is: 0.5 a small nibble: shorter and higher; 1.5 a big bite: longer and fuller." } },
    juice: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Saft", en: "Juice" },
      describe: { de: "Wie saftig: 0 trocken; 1 ein nasses Zischen nach dem Knirsch, etwa 10 dB unter dem Höhepunkt.", en: "How juicy: 0 dry; 1 a wet hiss after the crunch, about 10 dB below its peak." } },
    chew: { type: "boolean", default: false, label: { de: "Kauen", en: "Chew" },
      describe: { de: "Drei gedämpfte Kauknirscher nach dem Biss: aus nur der Biss, an drei leise knirschende Kaubewegungen danach.", en: "Three muffled chewing crunches after the bite: off just the bite, on three quiet chewing crunches afterwards." } },
  },
  presets: {
    apple: { label: { de: "Apfel", en: "Apple" }, values: { crispness: 0.7 } },
    nibble: { label: { de: "Häppchen", en: "Nibble" }, values: { size: 0.5, juice: 0.2 } },
    "juicy-pear": { label: { de: "Saftige Birne", en: "Juicy pear" }, values: { crispness: 0.35, juice: 0.9 } },
    carrot: { label: { de: "Karotte", en: "Carrot" }, values: { crispness: 1, juice: 0, chew: true } },
  },
  loop: false, maxSeconds: 2,
  build(p, seed) {
    const r = rng(seed);
    const crunchLen = 0.08 + 0.07 * p.size;
    const juiceLen = p.juice > 0 ? 0.1 + p.juice * 0.15 : 0;
    const s = buffer(p.chew ? 1.15 : crunchLen + juiceLen + 0.05);
    // The crunch: dense grains bandpassed bright with a sharp attack, brighter and denser with crispness
    const hz = 1500 + p.crispness * 3500;
    const count = Math.round(40 + p.crispness * 160);
    const laut = 0.35 + p.crispness * 0.45;
    grains(s, r, { start: 0, seconds: crunchLen, count, hz, q: 0.9, gain: laut, grain: 0.0008, shape: "front" });
    // The low thump when the teeth meet
    const thumpHz = (150 + r() * 100) / p.size;
    const o = new Osc("sine", r());
    for (let i = 0; i < 0.03 * RATE && i < s.length; i++) {
      s[i] += o.next(thumpHz) * envelope(i / RATE, 0.0004, 0.015) * 0.5;
    }
    // The juice: high-passed soft noise after the crunch that fades out, scaled by juice
    if (p.juice > 0) {
      const hp = new Biquad("highpass", 4000, 0.7);
      const start = Math.round(crunchLen * RATE);
      for (let i = 0; i < juiceLen * RATE && start + i < s.length; i++) {
        const t = i / RATE;
        s[start + i] += hp.run(white(r)) * envelope(t, 0, juiceLen * 0.5) * p.juice * 0.12;
      }
    }
    // Chewing: three muffled crunches from its own stream, so chew off leaves the bite unchanged
    if (p.chew) {
      const rc = rng(seed + 1);
      const lautC = [0.5, 0.355, 0.25]; // -6, -9, -12 dB
      for (let k = 0; k < 3; k++) {
        const at = 0.35 + k * 0.3;
        const hzC = 500 + rc() * 700; // below about 1.5 kHz, muffled
        grains(s, rc, { start: at, seconds: 0.12, count: Math.round(12 + rc() * 30), hz: hzC, q: 1, gain: lautC[k], grain: 0.001, shape: "even" });
      }
    }
    // Fade the last 20 ms so the edge is not what stops the sound
    const ende = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < ende; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ende);
    return s;
  },
});
