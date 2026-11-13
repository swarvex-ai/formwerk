import { Biquad, buffer, Osc, RATE, semitones, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const croak = defineSound({
  id: "croak", category: "voice",
  title: { de: "Quaken", en: "Croak" },
  description: {
    de: "Ein Frosch quakt: ein paar Rufe, jeder ein kurzes Knarren aus schnellen Stimmstößen durch die Schallblase, mit leicht fallender Tonhöhe. Vom tiefen Ochsenfrosch bis zum hellen Laubfrosch. Für Teiche, Sümpfe und Sommernächte.",
    en: "A frog croaking: a few calls, each a short rattle of rapid glottal pulses through the vocal sac, with the pitch falling slightly. From a deep bullfrog to a bright tree frog. For ponds, swamps and summer nights.",
  },
  params: {
    calls: { type: "integer", min: 1, max: 4, default: 3, label: { de: "Rufe", en: "Calls" },
      describe: { de: "Wie viele Rufe hintereinander: 1 ein einzelnes Quaken, 2 ein Ochsenfrosch, 4 ein Laubfrosch im Chor.", en: "How many calls in a row: 1 a single croak, 2 a bullfrog, 4 a tree frog in a chorus." } },
    pitch: { type: "number", min: 150, max: 2000, step: 10, default: 500, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Resonanz der Schallblase: 200 Hz ein Ochsenfrosch, 500 Hz ein Grasfrosch, 1500 Hz ein Laubfrosch.", en: "Resonance of the vocal sac: 200 Hz a bullfrog, 500 Hz a common frog, 1500 Hz a tree frog." } },
    pulseRate: { type: "number", min: 10, max: 60, step: 1, default: 25, unit: "Hz", label: { de: "Pulsrate", en: "Pulse rate" },
      describe: { de: "Stimmstöße pro Sekunde, das Knarren: 15 Hz ein langsamer Ochsenfrosch, 25 Hz ein Grasfrosch, 40 Hz ein schnarrender Laubfrosch.", en: "Glottal pulses per second, the rattle: 15 Hz a slow bullfrog, 25 Hz a common frog, 40 Hz a buzzing tree frog." } },
    length: { type: "number", min: 0.05, max: 0.6, step: 0.01, default: 0.3, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer eines Rufs: 0,1 s ein Laubfrosch, 0,3 s ein Grasfrosch, 0,55 s ein Ochsenfrosch.", en: "Duration of one call: 0.1 s a tree frog, 0.3 s a common frog, 0.55 s a bullfrog." } },
    gap: { type: "number", min: 0.08, max: 0.4, step: 0.01, default: 0.25, unit: "s", label: { de: "Pause", en: "Gap" },
      describe: { de: "Stille zwischen zwei Rufen: 0,1 s hastig wie ein Laubfrosch, 0,25 s ein Grasfrosch, 0,4 s ein ruhiger Ochsenfrosch.", en: "Silence between two calls: 0.1 s hasty like a tree frog, 0.25 s a common frog, 0.4 s a calm bullfrog." } },
  },
  presets: {
    "common-frog": { label: { de: "Grasfrosch", en: "Common frog" }, values: { calls: 3, pitch: 500, pulseRate: 25, length: 0.3, gap: 0.25 } },
    bullfrog: { label: { de: "Ochsenfrosch", en: "Bullfrog" }, values: { calls: 2, pitch: 200, pulseRate: 15, length: 0.55, gap: 0.4 } },
    "tree-frog": { label: { de: "Laubfrosch", en: "Tree frog" }, values: { calls: 4, pitch: 1500, pulseRate: 40, length: 0.1, gap: 0.1 } },
  },
  // longest case: 0.01 s lead-in + 4 calls × 0.6 s + 3 gaps × (0.4 s + 0.02 s jitter) + 0.15 s release = 3.82 s
  loop: false, maxSeconds: 3.9,
  build(p, seed) {
    const r = rng(seed), L = p.length;
    const s = buffer(0.01 + p.calls * L + (p.calls - 1) * (p.gap + 0.02) + 0.15);
    const one = new Osc("sine"), two = new Osc("sine", 0.1);
    const sac = new Biquad("bandpass", p.pitch, 2), air = new Biquad("bandpass", p.pitch * 1.5, 3);
    // one glottal pulse dies away before the next: its time constant is a quarter of the pulse period
    const tau = 0.25 / p.pulseRate, attack = Math.min(0.002, tau * 0.3);
    let start = 0.01;
    for (let c = 0; c < p.calls; c++) {
      if (c > 0) start += r() * 0.02;
      const top = p.pitch * (0.96 + 0.08 * r()), laut = 0.8 + 0.2 * r(), rate = p.pulseRate * (0.95 + 0.1 * r());
      const at = Math.round(start * RATE), n = Math.round(L * RATE);
      let next = 0, pulse = 0, gain = 1;
      for (let i = 0; i < n && at + i < s.length; i++) {
        const t = i / RATE, u = t / L;
        // a new glottal pulse: each a little louder or softer, the spacing a little uneven
        if (t >= next) { pulse = t; gain = 0.7 + 0.3 * r(); next = t + (1 + (r() - 0.5) * 0.15) / rate; }
        const tp = t - pulse, burst = (tp < attack ? tp / attack : Math.exp(-(tp - attack) / tau)) * gain;
        // the call swells in, holds and fades to silence at its end; the pitch falls 2 semitones over the call
        const shape = Math.min(1, u / 0.12, (1 - u) / 0.3);
        const f = semitones(top, -2 * u);
        // a raspy tone (fundamental and octave, driven) with a breath of noise, coloured by the vocal sac
        const tone = Math.tanh(2.5 * (one.next(f) + 0.5 * two.next(2 * f))) + 0.3 * air.run(white(r));
        s[at + i] += sac.run(tone * burst) * shape * laut;
      }
      start += L + p.gap;
    }
    return s;
  },
});
