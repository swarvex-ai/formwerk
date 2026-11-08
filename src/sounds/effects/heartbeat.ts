import { buffer, envelope, LOOP_TAIL, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const heartbeat = defineSound({
  id: "heartbeat", category: "effects",
  title: { de: "Herzschlag", en: "Heartbeat" },
  description: {
    de: "Ein Herzschlag als nahtlose Schleife: ruhig, angespannt oder rasend vor Angst, mit dem doppelten Schlag „lub-dub“.",
    en: "A heartbeat as a seamless loop: calm, tense or racing with fear, with the double \"lub-dub\" beat.",
  },
  params: {
    bpm: { type: "number", min: 40, max: 180, step: 1, default: 70, label: { de: "Puls (Schläge/min)", en: "Pulse (bpm)" },
      describe: { de: "Schläge pro Minute: 60 in Ruhe, 100 angespannt, 160 in Panik.", en: "Beats per minute: 60 at rest, 100 tense, 160 in panic." } },
    depth: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Tiefe", en: "Depth" },
      describe: { de: "Wie tief und dumpf: 0 heller wie durch ein Stethoskop, 0,5 üblich, 1 tief wie im eigenen Kopf.", en: "How deep and dull: 0 brighter like through a stethoscope, 0.5 usual, 1 deep as if inside your head." } },
    second: { type: "number", min: 0.3, max: 1, step: 0.05, default: 0.7, label: { de: "Zweiter Schlag", en: "Second beat" },
      describe: { de: "Lautstärke des zweiten Schlags (dub) im Verhältnis zum ersten: 0,4 leise, 0,7 üblich, 1 gleich laut.", en: "Loudness of the second beat (dub) relative to the first: 0.4 soft, 0.7 usual, 1 as loud." } },
  },
  presets: {
    calm: { label: { de: "Ruhig", en: "Calm" }, values: { bpm: 60, depth: 0.5 } },
    tense: { label: { de: "Angespannt", en: "Tense" }, values: { bpm: 100, depth: 0.6, second: 0.6 } },
    panic: { label: { de: "Panik", en: "Panic" }, values: { bpm: 160, depth: 0.8, second: 0.8 } },
  },
  loop: true, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), periode = 60 / p.bpm, schlaege = Math.max(1, Math.floor(2.4 / periode));
    // Rendered as exactly whole beats and repeated, so the loop has no seam to hide
    const eins = buffer(periode), lp = new LowPass();
    const f = 50 - p.depth * 20, abstand = Math.min(0.32, periode * 0.36);
    for (const [at, laut, hz] of [[0, 1, f], [abstand, p.second, f * 1.25]] as const) {
      const o = new Osc("sine"), start = Math.round(at * RATE);
      for (let i = 0; i < 0.25 * RATE && start + i < eins.length; i++) {
        const t = i / RATE, e = envelope(t, 0.008, 0.045);
        eins[start + i] += (o.next(hz * (1 + 0.5 * Math.exp(-t / 0.02))) * e + lp.run(white(r), 120 + (1 - p.depth) * 300) * e * 1.5) * laut;
      }
    }
    // The finish folds the tail into the start: whole beats plus the tail, so it folds onto itself
    const s = new Float32Array(schlaege * eins.length + Math.round(LOOP_TAIL * RATE));
    for (let i = 0; i < s.length; i++) s[i] = eins[i % eins.length];
    return s;
  },
});
