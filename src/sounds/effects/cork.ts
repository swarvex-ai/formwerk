import { Biquad, buffer, envelope, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// The glide of the pop (s), and how far the squeak's loudest 20 ms sit below the pop's (dB)
const GLIDE = 0.04, UNTER = 9;

export const cork = defineSound({
  id: "cork", category: "effects",
  title: { de: "Korken", en: "Cork" },
  description: {
    de: "Ein Korken, aus einer Flasche, einem Flachmann oder einem Trank gezogen: ein kurzes Quietschen von Kork auf Glas, dann ein hohles Plopp mit etwas Klang der Flaschenluft, für Apotheken, Alchemie, Tavernen, Tränke und „geöffnet“.",
    en: "A cork pulled from a bottle, a flask or a potion: a short squeak of cork rubbing on glass, then a hollow pop with a little ring of the bottle's air, for apothecaries, alchemy, taverns, potions and \"opened\" feedback.",
  },
  params: {
    twist: { type: "number", min: 0, max: 0.6, step: 0.05, default: 0.25, unit: "s", label: { de: "Drehen", en: "Twist" },
      describe: { de: "Wie lange der Korken quietscht, bevor er herauskommt: 0 ein lockerer Korken, 0,25 s üblich, 0,6 s ein störrischer.", en: "How long the cork squeaks before it comes out: 0 a loose cork, 0.25 s usual, 0.6 s a stubborn one." } },
    bottle: { type: "number", min: 220, max: 700, step: 10, default: 400, unit: "Hz", label: { de: "Flasche", en: "Bottle" },
      describe: { de: "Die Luftresonanz der Flasche, wo das Plopp sitzt: 220 Hz eine große Weinflasche, 400 Hz ein Flachmann, 700 Hz ein kleines Fläschchen.", en: "The bottle's air resonance, where the pop sits: 220 Hz a large wine bottle, 400 Hz a flask, 700 Hz a small vial." } },
    tightness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Festigkeit", en: "Tightness" },
      describe: { de: "Wie hart das Plopp ist: 0 ein weicher Hauch, 0,5 üblich, 1 ein scharfes Knallen wie beim Sekt mit lauterem Knack.", en: "How hard the pop is: 0 a soft puff, 0.5 usual, 1 a sharp champagne-like pop with a louder snap." } },
    squeak: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Quietschen", en: "Squeak" },
      describe: { de: "Wie laut und tonal das Quietschen ist: 0 ein trockenes Reiben aus Rauschen, 0,6 üblich, 1 ein klares Quieken.", en: "How loud and pitched the squeak is: 0 a dry rub of noise, 0.6 usual, 1 a clear squeal." } },
  },
  presets: {
    flask: { label: { de: "Flachmann", en: "Flask" }, values: { bottle: 400 } },
    vial: { label: { de: "Fläschchen", en: "Vial" }, values: { bottle: 680, twist: 0.1, tightness: 0.3 } },
    wine: { label: { de: "Weinflasche", en: "Wine bottle" }, values: { bottle: 240, twist: 0.45, tightness: 0.8 } },
  },
  loop: false, maxSeconds: 1.2,
  build(p, seed) {
    // A larger bottle rings longer: 0.3 s at 220 Hz, 0.1 s at 700 Hz
    const ring = 0.1 + 0.2 * (700 - p.bottle) / 480, an = Math.round(p.twist * RATE);
    const s = buffer(p.twist + GLIDE + ring + 0.02), ab = s.length / RATE - 0.02;

    // Pop and ring, from its own stream so the twist does not move it
    const r1 = rng(seed + 1), pop = new Float32Array(s.length - an), osc = new Osc("sine"), hp = new Biquad("highpass", 3000, 0.8);
    const angriff = 0.006 - 0.005 * p.tightness, knack = 0.002 + 0.001 * r1(), schwung = 0.45 + 0.1 * r1();
    for (let i = 0; i < pop.length; i++) {
      const t = i / RATE, weg = Math.min(1, t / GLIDE);
      // The air rushes in behind the cork: the pitch rises about half an octave in 40 ms, then holds
      const f = p.bottle * 2 ** (schwung * (1 - Math.exp(-weg * 3)) / (1 - Math.exp(-3)));
      const k = Math.min(1, Math.max(0, (t + p.twist - ab) / 0.02));
      const ton = osc.next(f) * envelope(t, angriff, (GLIDE + ring) / 4.5) * 0.5 * (1 + Math.cos(Math.PI * k));
      pop[i] = ton + hp.run(white(r1)) * envelope(t, 0.0003, knack / 2.5) * (0.2 + 1.1 * p.tightness);
    }

    // The squeak: stick and slip of cork on glass, 60 to 120 jolts per second, faster as the cork loosens
    if (an > 0) {
      const r = rng(seed), quiek = new Float32Array(an), wandern = smooth(r, p.twist + 0.1, 0.06);
      const band = new Biquad("bandpass", 1200 + 1300 * r(), 1.5 + 14 * p.squeak), reib = new Biquad("bandpass", 1800, 0.8);
      let phase = 0;
      for (let i = 0; i < an; i++) {
        const t = i / RATE, x = t / p.twist, rate = (60 + 50 * x + 10 * wandern(t)) * (1 + (r() - 0.5) * 0.05);
        phase += rate / RATE;
        let ruck = 0;
        if (phase >= 1) { phase -= 1; ruck = (0.6 + 0.4 * r()) * p.squeak; }
        // Short swell in, then on into the pop
        const huelle = Math.min(1, x * 6) * (0.7 + 0.3 * x);
        quiek[i] = (band.run(ruck * 60) + reib.run(white(r)) * (1 - p.squeak * 0.85)) * huelle;
      }
      // Measured, not assumed: the squeak's loudest 20 ms go UNTER dB below the pop's
      const lautest = (b: Float32Array) => {
        let m = 0;
        const n = Math.round(0.02 * RATE);
        for (let a = 0; a < b.length; a += n >> 1) {
          let q = 0;
          for (let j = a; j < Math.min(b.length, a + n); j++) q += b[j] * b[j];
          m = Math.max(m, Math.sqrt(q / n));
        }
        return m;
      };
      const g = (lautest(pop) * 10 ** (-UNTER / 20)) / Math.max(1e-9, lautest(quiek));
      for (let i = 0; i < an; i++) s[i] = quiek[i] * g;
    }
    s.set(pop, an);
    return s;
  },
});
