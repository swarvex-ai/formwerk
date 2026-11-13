import { Biquad, buffer, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

const VESSEL_FREQS = {
  glass: { start: 600, end: 1600, q: 2.2, bubbleMult: 1.0 },
  mug: { start: 400, end: 1000, q: 1.6, bubbleMult: 1.0 },
  bottle: { start: 300, end: 900, q: 2.5, bubbleMult: 1.8 },
} as const;

export const pour = defineSound({
  id: "pour", category: "effects",
  title: { de: "Eingießen", en: "Pour" },
  description: {
    de: "Eine Flüssigkeit wird in ein Gefäß gegossen, das Gluckern steigt mit dem Füllstand an, für Tavernen, Küchen und Zaubertränke.",
    en: "A liquid poured into a vessel, the gurgle rising in pitch as the vessel fills, for taverns, kitchens and potions.",
  },
  params: {
    seconds: { type: "number", min: 0.6, max: 2.2, step: 0.1, default: 1.4, unit: "s", label: { de: "Dauer", en: "Seconds" },
      describe: { de: "Dauer des Eingießens: 0,6 s ein kurzer Schluck, 1,4 s ein halbes Glas, 2,2 s ein voller Krug.", en: "Pouring time: 0.6 s a quick splash, 1.4 s half a glass, 2.2 s a full mug." } },
    vessel: { type: "choice", options: ["glass", "mug", "bottle"], default: "glass", label: { de: "Gefäß", en: "Vessel" },
      labels: { glass: { de: "Glas", en: "Glass" }, mug: { de: "Krug", en: "Mug" }, bottle: { de: "Flasche", en: "Bottle" } },
      describe: { de: "Resonanz des Gefäßes: Glas hell steigend (600–1600 Hz), Krug dumpfer (400–1000 Hz), Flasche enger Hals mit tiefem Gluckern (300–900 Hz).", en: "Vessel resonance: glass bright rising (600–1600 Hz), mug duller (400–1000 Hz), bottle narrow neck with strong gurgles (300–900 Hz)." } },
    flow: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Fluss", en: "Flow" },
      describe: { de: "Stärke des Strahls: 0 ein dünnes leises Rinnsal mit wenigen Blasen, 1 ein kräftiger schneller Schwall.", en: "Flow rate: 0 a thin quiet trickle with sparse bubbles, 1 a fast heavy pour with dense bubbles." } },
    fizz: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Kohlensäure", en: "Fizz" },
      describe: { de: "Prickeln und Zischen über 4 kHz: 0 stilles Wasser oder Wein, 1 frisches Bier oder Limonade.", en: "Carbonation hiss and crackle above 4 kHz: 0 still water or wine, 1 fresh beer or soda." } },
  },
  presets: {
    "water-glass": { label: { de: "Wasserglas", en: "Water glass" }, values: { vessel: "glass" } },
    beer: { label: { de: "Bier", en: "Beer" }, values: { vessel: "mug", fizz: 0.7, flow: 0.7 } },
    wine: { label: { de: "Wein", en: "Wine" }, values: { vessel: "glass", flow: 0.35, seconds: 1.8 } },
    "fill-bottle": { label: { de: "Flasche füllen", en: "Fill bottle" }, values: { vessel: "bottle", flow: 0.8, seconds: 2 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed);
    const pourTime = p.seconds;
    const tailTime = 0.22;
    const totalTime = Math.min(2.5, pourTime + tailTime);
    const s = buffer(totalTime);
    const n = s.length;

    const vesselInfo = VESSEL_FREQS[p.vessel as keyof typeof VESSEL_FREQS] ?? VESSEL_FREQS.glass;
    const fStart = vesselInfo.start;
    const fEnd = vesselInfo.end;
    const vesselQ = vesselInfo.q;

    // 1. Liquid stream: noise band-passed around a gliding centre frequency.
    const bpStream = new Biquad("bandpass", fStart, vesselQ);
    const fadeInSamples = Math.round(0.03 * RATE); // 30 ms fade-in
    const fadeOutSamples = Math.round(0.08 * RATE); // 80 ms fade-out
    const pourSamples = Math.round(pourTime * RATE);

    // Stream base volume depends on flow
    const streamVol = 0.35 + p.flow * 0.45;

    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      let amp = 0;
      if (i < pourSamples) {
        if (i < fadeInSamples) {
          amp = i / fadeInSamples;
        } else if (i >= pourSamples - fadeOutSamples) {
          amp = (pourSamples - i) / fadeOutSamples;
        } else {
          amp = 1;
        }
      }

      if (amp > 0) {
        // Glide centre frequency from fStart to fEnd over pourTime
        const progress = Math.min(1, t / pourTime);
        const currentHz = fStart + (fEnd - fStart) * progress;
        bpStream.set(currentHz, vesselQ);
        const w = white(r);
        s[i] += bpStream.run(w) * amp * streamVol;
      }
    }

    // 2. Bubbles: short decaying sine blips (8-25 ms, 300-1500 Hz), placed with seed, denser with flow.
    const bubbleRate = (12 + p.flow * 45) * vesselInfo.bubbleMult;
    const bubbleCount = Math.round(bubbleRate * pourTime);
    for (let b = 0; b < bubbleCount; b++) {
      // Place bubble mainly during pouring, with a few possibly landing into the start of tail
      const bubbleTime = r() * (pourTime + 0.05);
      if (bubbleTime > totalTime - 0.03) continue;

      const progress = Math.min(1, bubbleTime / pourTime);
      const centerHz = fStart + (fEnd - fStart) * progress;
      // Bubble frequency correlated with current vessel resonance plus variation
      const f0 = Math.max(300, Math.min(1500, centerHz * (0.8 + r() * 0.4)));
      const duration = 0.008 + r() * 0.017; // 8 - 25 ms
      const bubbleSamples = Math.round(duration * RATE);
      const startSample = Math.round(bubbleTime * RATE);
      const amp = (0.2 + r() * 0.3) * (0.4 + p.flow * 0.6) * vesselInfo.bubbleMult;

      // Slight upward pitch chirp as bubble resonates / pinches off
      const chirp = 1 + r() * 0.25;
      let phase = 0;
      for (let j = 0; j < bubbleSamples && startSample + j < n; j++) {
        const bt = j / bubbleSamples;
        const env = Math.sin(Math.PI * Math.sqrt(bt)) * Math.exp(-bt * 3.5);
        const instHz = f0 * (1 + (chirp - 1) * bt);
        phase += (2 * Math.PI * instHz) / RATE;
        s[startSample + j] += Math.sin(phase) * env * amp;
      }
    }

    // A couple of last bubbles decaying in the tail
    const tailBubbles = 1 + Math.floor(r() * 2);
    for (let b = 0; b < tailBubbles; b++) {
      const bubbleTime = pourTime + r() * (tailTime * 0.6);
      if (bubbleTime > totalTime - 0.03) continue;
      const f0 = Math.max(300, Math.min(1500, fEnd * (0.85 + r() * 0.3)));
      const duration = 0.008 + r() * 0.015;
      const bubbleSamples = Math.round(duration * RATE);
      const startSample = Math.round(bubbleTime * RATE);
      const amp = (0.15 + r() * 0.2) * (0.3 + p.flow * 0.5);
      let phase = 0;
      for (let j = 0; j < bubbleSamples && startSample + j < n; j++) {
        const bt = j / bubbleSamples;
        const env = Math.sin(Math.PI * Math.sqrt(bt)) * Math.exp(-bt * 4);
        phase += (2 * Math.PI * f0) / RATE;
        s[startSample + j] += Math.sin(phase) * env * amp;
      }
    }

    // 3. Fizz: carbonation, a hiss of fine crackle above 4 kHz that lasts into the tail.
    if (p.fizz > 0.01) {
      const hpf = new Biquad("highpass", 4200, 0.707);
      const bpf = new Biquad("bandpass", 6500, 1.2);
      const fizzEndTime = totalTime - 0.02;

      for (let i = 0; i < n; i++) {
        const t = i / RATE;
        let env = 0;
        if (t < 0.05) {
          env = t / 0.05;
        } else if (t < pourTime) {
          // Builds up as glass fills with head / foam
          env = 0.7 + 0.3 * (t / pourTime);
        } else if (t < fizzEndTime) {
          // Decays in the tail
          env = Math.max(0, 1 - (t - pourTime) / (fizzEndTime - pourTime));
        }

        if (env > 0) {
          const w = white(r);
          // Combine highpass hiss and tiny crackles
          const crackle = r() < 0.08 ? white(r) * 1.5 : 0;
          const noise = hpf.run(w) * 0.6 + bpf.run(w + crackle) * 0.4;
          s[i] += noise * env * p.fizz * 0.35;
        }
      }
    }

    return s;
  },
});
