import { Biquad, buffer, envelope, grains, LOOP_TAIL, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const stream = defineSound({
  id: "stream", category: "ambience",
  title: { de: "Bach", en: "Stream" },
  description: {
    de: "Ein Bach als nahtlose Schleife: leises Rinnsal, plätschernder Bach oder rauschender Fluss über Steine, mit aufsteigenden Bläschen.",
    en: "A stream as a seamless loop: a quiet trickle, a babbling brook or a rushing river over stones, with rising bubbles.",
  },
  params: {
    flow: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Strömung", en: "Flow" },
      describe: { de: "Wie viel Wasser fließt: 0,15 ein Rinnsal, 0,5 ein Bach, 0,9 ein reißender Fluss.", en: "How much water runs: 0.15 a trickle, 0.5 a brook, 0.9 a rushing river." } },
    bubbles: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Bläschen", en: "Bubbles" },
      describe: { de: "Kurze aufsteigende Plopps: 0 keine, 0,7 viele kleine, 1 ein dichtes Sprudeln.", en: "Short rising plops: 0 none, 0.7 many small ones, 1 a dense fizz." } },
    brightness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Helligkeit", en: "Brightness" },
      describe: { de: "Klangfarbe des Rauschens: 0 dumpf bei 800 Hz, 0,5 klar, 1 hell und spritzig bei 6 kHz.", en: "Timbre of the rush: 0 muffled at 800 Hz, 0.5 clear, 1 bright and splashing at 6 kHz." } },
    depth: { type: "number", min: 0, max: 1, step: 0.05, default: 0.35, label: { de: "Tiefe", en: "Depth" },
      describe: { de: "Anteil tiefen Grollens unter 200 Hz: 0 nur helles Wasser, 0,5 ein voller Bach, 1 ein mächtiger Fluss.", en: "Share of low rumble below 200 Hz: 0 only bright water, 0.5 a full brook, 1 a powerful river." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist klein, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is small, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    trickle: { label: { de: "Rinnsal", en: "Trickle" }, values: { flow: 0.15, bubbles: 0.7 } },
    brook: { label: { de: "Bach", en: "Brook" }, values: { flow: 0.5 } },
    river: { label: { de: "Fluss", en: "River" }, values: { flow: 0.9, bubbles: 0.2, depth: 0.6 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    // The rush over stones: filtered noise, brighter with the setting and louder with the flow
    const grenze = 800 + 5200 * p.brightness, lp = new Biquad("lowpass", grenze, 0.6), hp = new Biquad("highpass", 120, 0.7);
    const tief = new Biquad("lowpass", 200, 0.7), beben = smooth(r, laenge, 0.6 + 1.8 * (1 - p.flow));
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, n = white(r), g = beben(t);
      if (i % 64 === 0) lp.set(Math.min(6000, grenze * (0.85 + 0.25 * g)), 0.6);
      const hell = lp.run(hp.run(n)), rum = tief.run(n);
      s[i] = (hell * (0.25 + 0.75 * p.flow) + rum * p.depth * 1.4) * (0.7 + 0.5 * (0.4 + 0.6 * p.flow) * g);
    }
    // Fine spray: tiny grains riding on the rush, denser as the water speeds up
    grains(s, r, { start: 0, seconds: laenge, count: Math.round(laenge * (60 + p.flow * 900)), hz: 2600 + p.brightness * 3000, q: 0.8, gain: 0.5, grain: 0.0008 });
    // Bubbles: short sine sweeps rising from a low plop, spread over the whole buffer so the tail wraps into the start
    const nb = Math.round(laenge * p.bubbles * 12), maxDur = 0.05;
    for (let k = 0; k < nb; k++) {
      const at = Math.round(r() * Math.max(1, (laenge - maxDur) * RATE));
      const f0 = 200 + r() * 300, f1 = 700 + r() * 800, dauer = 0.012 + r() * 0.03, o = new Osc("sine");
      const laut = 0.25 + 0.35 * r();
      for (let i = 0; i < dauer * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += o.next(f0 + (f1 - f0) * (t / dauer)) * envelope(t, 0.002, dauer * 0.35) * laut;
      }
    }
    return s;
  },
});
