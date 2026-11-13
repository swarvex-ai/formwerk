import { Biquad, buffer, envelope, grains, RATE, white, type Samples } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const rustle = defineSound({
  id: "rustle", category: "movement",
  title: { de: "Rascheln", en: "Rustle" },
  description: {
    de: "Jemand streift durch einen Busch oder Laub: ein an- und abschwellendes Rauschen der Blätter, einzelne Blätter, die knistern, und wahlweise knackende Zweige. Jeder Seed raschelt anders.",
    en: "Someone brushes through a bush or leaves: a swell of rustling foliage, single leaves crackling, and optionally twigs snapping. Every seed rustles differently.",
  },
  params: {
    duration: { type: "number", min: 0.3, max: 1.2, step: 0.05, default: 0.7, unit: "s", label: { de: "Dauer", en: "Duration" },
      describe: { de: "Wie lang das Streifen dauert: 0,3 s ein schnelles Streifen, 0,7 s durch einen Busch gehen, 1,2 s langsam durchs Unterholz schleichen.", en: "How long the brush lasts: 0.3 s a quick brush, 0.7 s walking through a bush, 1.2 s slowly creeping through." } },
    leaves: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Trockenheit", en: "Dryness" },
      describe: { de: "Wie trocken die Blätter sind: 0 frische Sommerblätter, weich und dumpf; 0,4 ein Busch; 1 trockene Herbstblätter, hell und knisternd.", en: "How dry the leaves are: 0 fresh summer leaves, soft and dull; 0.4 a bush; 1 dry autumn leaves, bright and crackling." } },
    intensity: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Heftigkeit", en: "Intensity" },
      describe: { de: "Wie kräftig gestreift wird: 0,2 vorsichtiges Schleichen, 0,5 normales Gehen, 1 hartes Durchbrechen oder ein Tier im Unterholz.", en: "How hard the brush is: 0.2 careful sneaking, 0.5 normal walking, 1 pushing hard through or an animal breaking through." } },
    twigs: { type: "integer", min: 0, max: 3, default: 1, label: { de: "Zweige", en: "Twigs" },
      describe: { de: "Wie viele Zweige knacken: 0 nur Blätter, 1 wie üblich, 3 dichtes Unterholz.", en: "How many twigs snap: 0 leaves only, 1 as usual, 3 dense undergrowth." } },
  },
  presets: {
    bush: { label: { de: "Busch", en: "Bush" }, values: { leaves: 0.4 } },
    "dry-leaves": { label: { de: "Trockenes Laub", en: "Dry leaves" }, values: { leaves: 1, twigs: 0, duration: 0.9 } },
    sneak: { label: { de: "Schleichen", en: "Sneak" }, values: { intensity: 0.15, duration: 1.1, twigs: 0 } },
    "break-through": { label: { de: "Durchbrechen", en: "Break through" }, values: { intensity: 1, twigs: 3, duration: 0.5 } },
  },
  loop: false, maxSeconds: 1.4,
  build(p, seed) {
    const r = rng(seed), d = p.duration, h = p.leaves, k = p.intensity, s = buffer(d + 0.12);
    // The swell of the whole bush: band-passed noise under one rising and falling arc, breathing a little faster the harder it pushes
    const band = new Biquad("bandpass", 1800 + 2500 * h, 0.7);
    const flattern = 3 + 5 * k, phase = r() * 2 * Math.PI;
    for (let i = 0; i < d * RATE; i++) {
      const t = i / RATE, bogen = Math.sin((Math.PI * t) / d) ** 1.5;
      s[i] += band.run(white(r)) * bogen * (0.3 + 0.5 * k) * (0.6 + 0.4 * Math.sin(2 * Math.PI * flattern * t + phase));
    }
    // Single leaves crackling over the swell: more and brighter the drier the leaves
    grains(s, r, { start: 0, seconds: d, count: Math.round(d * (80 + 220 * h) * (0.5 + k)), hz: 3000 + 3000 * h, q: 1, gain: 0.4 + 0.4 * k, grain: 0.002, shape: "bell" });
    // Twigs snapping somewhere in the middle: a sharp click on top of a duller break
    for (let n = 0; n < p.twigs; n++) {
      const a = Math.round(d * (0.2 + 0.6 * r()) * RATE);
      const klick = new Biquad("highpass", 2500, 0.7), knack = new Biquad("bandpass", 700 + 500 * r(), 2);
      for (let i = 0; i < 0.1 * RATE && a + i < s.length; i++) {
        const t = i / RATE, n0 = white(r);
        s[a + i] += klick.run(n0) * envelope(t, 0.0002, 0.004) * (0.6 + 0.4 * k) + knack.run(n0) * envelope(t, 0.0005, 0.02) * 0.8;
      }
    }
    return s as Samples;
  },
});
