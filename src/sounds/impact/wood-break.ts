import { Biquad, buffer, envelope, grains, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const woodBreak = defineSound({
  id: "wood-break", category: "impact",
  title: { de: "Holzbruch", en: "Wood break" },
  description: {
    de: "Holz bricht und splittert: vom brechenden Zweig über eine zerschlagene Kiste bis zur Tür. Erst der scharfe Knack, dann helle Splitter, zum Schluss tiefe fallende Stücke.",
    en: "Wood cracks and splinters: from a snapping stick over a smashed crate to a door. First the sharp snap, then bright splinters, at the end low falling pieces.",
  },
  params: {
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß das Holz ist: 0 ein Zweig, 0,5 eine Kiste, 1 eine Tür.", en: "How big the wood is: 0 a twig, 0.5 a crate, 1 a door." } },
    crack: { type: "number", min: 0, max: 1, step: 0.05, default: 0.7, label: { de: "Knack", en: "Crack" },
      describe: { de: "Lautstärke des ersten scharfen Knacks: 0,2 ein leiser Bruch, 0,7 ein klarer Knacks, 1 ein peitschender Schlag.", en: "Loudness of the first sharp snap: 0.2 a quiet break, 0.7 a clear crack, 1 a whip-like snap." } },
    splinters: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Splitter", en: "Splinters" },
      describe: { de: "Wie viele kurze helle Körner nach dem Knacks folgen: 0 keine, 0,5 ein paar Splitter, 1 ein ganzer Sprühregen.", en: "How many short bright grains follow the snap: 0 none, 0.5 a few splinters, 1 a whole shower." } },
    debris: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Trümmer", en: "Debris" },
      describe: { de: "Tiefe Schläge fallender Stücke im letzten Teil: 0 keine, 0,5 ein paar Klötze, 1 ein Haufen, der auf den Boden fällt.", en: "Low thuds of falling pieces in the last part: 0 none, 0.5 a few chunks, 1 a heap landing on the floor." } },
    dryness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Trockenheit", en: "Dryness" },
      describe: { de: "Von nassem, dumpfem zu trockenem, hellem Holz: verschiebt die Filter von 400 Hz über 1700 Hz bis 3000 Hz.", en: "From wet dull wood to dry bright wood: shifts the filters from 400 Hz over 1700 Hz to 3000 Hz." } },
  },
  presets: {
    twig: { label: { de: "Zweig", en: "Twig" }, values: { size: 0.05, crack: 0.6, splinters: 0.4, debris: 0, dryness: 0.85 } },
    crate: { label: { de: "Kiste", en: "Crate" }, values: { size: 0.5, crack: 0.8, splinters: 0.7, debris: 0.6, dryness: 0.6 } },
    door: { label: { de: "Tür", en: "Door" }, values: { size: 1, crack: 0.9, splinters: 0.4, debris: 0.8, dryness: 0.4 } },
  },
  loop: false, maxSeconds: 1.7,
  build(p, seed) {
    const r = rng(seed);
    const hell = 400 + p.dryness * 2600;
    const knack = 0.006 + p.size * 0.04;
    const splittern = 0.06 + p.splinters * (0.12 + p.size * 0.3);
    const fallen = p.debris * (0.25 + p.size * 0.7);
    const tau = 0.02 + p.size * 0.1;
    const s = buffer(Math.max(knack * 8, tau * 6, splittern + fallen) + 0.15);
    // The body: two wood modes with a slight drop in pitch as the blow lets go, and the dull thud of the mass
    const f0 = (420 - p.size * 360) * (0.96 + r() * 0.08), a = new Osc("sine", 0.25), b = new Osc("sine", r());
    const koerper = new LowPass(), lautKoerper = 0.6 + p.size * 0.5;
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, fall = 1 + 0.12 * Math.exp(-t / 0.008);
      s[i] += (a.next(f0 * fall) * envelope(t, 0.001, tau) + b.next(f0 * 2.47 * fall) * envelope(t, 0.0008, tau * 0.4) * 0.5) * lautKoerper;
      s[i] += koerper.run(white(r), 250 + (1 - p.size) * 350 + p.dryness * 200) * envelope(t, 0.001, 0.03 + p.size * 0.05) * (0.8 + p.size);
    }
    // The snap: a short burst of noise, wet wood stays dull at 400 Hz, dry wood cracks bright at 3000 Hz
    const bp = new Biquad("highpass", hell, 0.7);
    for (let i = 0; i < knack * 8 * RATE && i < s.length; i++) {
      s[i] += bp.run(white(r)) * envelope(i / RATE, 0.0004, knack) * p.crack * 2.4 * (0.5 + p.size * 0.7);
    }
    // The splinters: bright ticks that rattle on, most of them right after the snap
    const anzahl = Math.round(p.splinters * (5 + p.size * 15));
    for (let k = 0; k < anzahl; k++) {
      const u = r(), at = Math.round((0.004 + u * u * splittern) * RATE), f = (900 + r() * 1800) * (0.8 + p.dryness * 0.5);
      const o = new Osc("triangle", r()), laut = (0.1 + 0.25 * r()) * (1 - u * 0.6), klang = 0.002 + r() * 0.006;
      for (let i = 0; i < klang * 6 * RATE && at + i < s.length; i++) s[at + i] += o.next(f) * envelope(i / RATE, 0.0002, klang) * laut;
    }
    if (p.splinters > 0) grains(s, r, { start: 0.004, seconds: splittern, count: Math.round(p.splinters * (30 + p.size * 110)), hz: 1200 + hell, q: 0.9, gain: 0.3 + 0.3 * p.dryness, grain: 0.0009, shape: "front" });
    // The debris: low pieces falling in the last part, each with its own thud
    const stuecke = Math.round(p.debris * (2 + p.size * 7));
    for (let k = 0; k < stuecke; k++) {
      const u = r(), at = Math.round((splittern * 0.8 + u * fallen) * RATE);
      const f = (70 + r() * 110) * (1.5 - p.size * 0.6), o = new Osc("sine", r()), lp = new LowPass();
      const schnitt = 200 + r() * 350, laut = (0.12 + 0.22 * r()) * (0.6 + p.debris * 0.4), klang = 0.012 + r() * 0.03;
      for (let i = 0; i < klang * 8 * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += (o.next(f) * 0.8 + lp.run(white(r), schnitt)) * envelope(t, 0.0008, klang) * laut;
      }
    }
    // The tail falls silent on its own: a raised cosine over the last 20 ms, so the edge fade is not what stops it
    const ende = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < ende; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ende);
    return s;
  },
});
