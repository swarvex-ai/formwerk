import { Biquad, buffer, envelope, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Partials of a struck metal bar (inharmonic, so it rings like metal and not like a note)
const METALL = [1, 1.47, 2.09, 2.56, 3.21, 4.07];

export const hit = defineSound({
  id: "hit", category: "impact",
  title: { de: "Treffer", en: "Hit" },
  description: {
    de: "Schlag, Treffer oder Aufprall: vom leichten Hieb bis zum schweren Stampfen, mit Metall für Klingen und Rüstung. Jeder Seed klingt etwas anders.",
    en: "A blow, hit or impact: from a light punch to a heavy stomp, with metal for blades and armour. Every seed sounds a little different.",
  },
  params: {
    weight: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Gewicht", en: "Weight" },
      describe: { de: "Wie schwer es trifft: 0,2 ein Faustschlag, 0,5 ein Stock, 1 ein Hammer oder ein großes Monster.", en: "How heavy it lands: 0.2 a punch, 0.5 a stick, 1 a hammer or a big monster." } },
    sharpness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Schärfe", en: "Sharpness" },
      describe: { de: "Wie hart der Anschlag ist: 0 dumpf wie in ein Kissen, 1 scharf wie Holz auf Holz.", en: "How hard the attack is: 0 dull like into a pillow, 1 sharp like wood on wood." } },
    metal: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Metall", en: "Metal" },
      describe: { de: "Metallischer Nachklang: 0 für Körper und Holz, 0,5 für Rüstung, 1 für Klinge auf Klinge.", en: "Metallic ring: 0 for bodies and wood, 0.5 for armour, 1 for blade on blade." } },
    length: { type: "number", min: 0.1, max: 1.2, step: 0.01, default: 0.35, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Wie lange es nachklingt: 0,2 s für schnelle Kämpfe, 0,8 s für schwere Treffer und Metall.", en: "How long it rings: 0.2 s for fast fights, 0.8 s for heavy hits and metal." } },
  },
  presets: {
    punch: { label: { de: "Faustschlag", en: "Punch" }, values: { weight: 0.35, sharpness: 0.6, length: 0.22 } },
    "heavy-thud": { label: { de: "Schwerer Aufprall", en: "Heavy thud" }, values: { weight: 1, sharpness: 0.2, length: 0.8 } },
    "sword-clash": { label: { de: "Klingen", en: "Sword clash" }, values: { weight: 0.1, sharpness: 0.9, metal: 1, length: 1 } },
  },
  loop: false, maxSeconds: 1.3,
  build(p, seed) {
    const r = rng(seed), s = buffer(p.length + 0.02);
    const f0 = (55 + (1 - p.weight) * 130) * (0.95 + 0.1 * r());
    const koerper = new Osc("sine"), hp = new Biquad("highpass", 800 + p.sharpness * 3000, 0.7), lp = new LowPass();
    const basis = 380 + r() * 500, metall = METALL.map((k) => basis * k).filter((f) => f < 18000), oscs = metall.map(() => new Osc("sine", r()));
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, n = white(r);
      const b = koerper.next(f0 * (1 + 2 * Math.exp(-t / 0.012))) * envelope(t, 0.001, p.length * (0.18 + 0.2 * p.weight)) * (0.6 + 0.6 * p.weight);
      const anschlag = hp.run(n) * envelope(t, 0.0005, 0.004 + 0.01 * (1 - p.sharpness)) * (0.3 + p.sharpness);
      const dumpf = lp.run(n, 300 + 900 * (1 - p.weight)) * envelope(t, 0.001, 0.03 + 0.05 * p.weight) * 1.5;
      let m = 0;
      for (let k = 0; k < oscs.length; k++) m += (oscs[k].next(metall[k]) * envelope(t, 0.0005, (p.length * 0.35) / (1 + k * 0.4))) / (1 + k * 0.6);
      s[i] = b + anschlag + dumpf + m * p.metal * 0.8;
    }
    return s;
  },
});
