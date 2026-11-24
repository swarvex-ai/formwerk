import { Biquad, buffer, grains, LowPass, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Per grain: centre of the patter, burst length, grains per second at flow 0 and 1 (flour is a hiss, not grains)
const GRAINS = {
  flour: { hz: 2500, q: 0.7, grain: 0.0005, rate: [0, 0], bounce: 2800 },
  wheat: { hz: 3500, q: 1.2, grain: 0.0008, rate: [700, 2600], bounce: 3800 },
  beans: { hz: 1800, q: 1.6, grain: 0.004, rate: [55, 230], bounce: 2000 },
} as const;

export const grainPour = defineSound({
  id: "grain-pour", category: "effects",
  title: { de: "Korn schütten", en: "Grain pour" },
  description: {
    de: "Korn, Mehl oder Bohnen aus einer Schaufel oder Rutsche geschüttet: ein dichtes, zischendes Prasseln, das anschwillt, gleichmäßig läuft und bis auf die letzten Körner ausdünnt, für Mühlen, Kornspeicher, Küchen und Marktstände.",
    en: "Grain, flour or beans poured from a scoop or a chute: a dense hissing patter that swells in, runs steady and thins out to the last few grains, for mills, granaries, kitchens and market stalls.",
  },
  params: {
    seconds: { type: "number", min: 0.6, max: 2.2, step: 0.1, default: 1.4, unit: "s", label: { de: "Dauer", en: "Seconds" },
      describe: { de: "Wie lange der Strom läuft: 0,6 s eine Schaufel, 1,4 s ein Eimer voll, 2,2 s eine Rutsche in einen Sack.", en: "How long the stream runs: 0.6 s one scoop, 1.4 s a bucketful, 2.2 s a chute into a sack." } },
    grain: { type: "choice", options: ["flour", "wheat", "beans"], default: "wheat", label: { de: "Schüttgut", en: "Grain" },
      labels: { flour: { de: "Mehl", en: "Flour" }, wheat: { de: "Weizen", en: "Wheat" }, beans: { de: "Bohnen", en: "Beans" } },
      describe: { de: "Was fließt: Mehl ein weiches, glattes Zischen ohne einzelne Körner (bis 2,5 kHz), Weizen ein dichtes feines Prasseln (um 3,5 kHz), Bohnen wenige, deutliche Ticks (um 1,8 kHz).", en: "What runs: flour a soft, smooth hiss with no single grains (up to 2.5 kHz), wheat a dense fine patter (around 3.5 kHz), beans sparse, distinct ticks (around 1.8 kHz)." } },
    flow: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Menge", en: "Flow" },
      describe: { de: "Stärke des Stroms: 0 ein dünnes, leises Rieseln aus der Hand, 0,5 eine Schaufel, 1 ein schwerer Schwall aus der Rutsche.", en: "Strength of the stream: 0 a thin, quiet trickle from the hand, 0.5 a scoop, 1 a heavy rush from a chute." } },
    container: { type: "choice", options: ["sack", "pail", "floor"], default: "sack", label: { de: "Ziel", en: "Container" },
      labels: { sack: { de: "Sack", en: "Sack" }, pail: { de: "Eimer", en: "Pail" }, floor: { de: "Boden", en: "Floor" } },
      describe: { de: "Wohinein: Stoffsack gedämpft (bis 3 kHz) mit weichem Plumps um 120 Hz am Anfang, Holzeimer mit einer Resonanz, die beim Füllen von 700 auf 900 Hz steigt, Boden hell gestreut mit ein paar springenden Körnern am Ende.", en: "Where it lands: a cloth sack muffled (up to 3 kHz) with a soft thump around 120 Hz at the start, a wooden pail with a resonance rising from 700 to 900 Hz as it fills, the floor a bright scatter with a few bouncing grains at the end." } },
  },
  presets: {
    "grain-sack": { label: { de: "Korn in den Sack", en: "Grain into a sack" }, values: { grain: "wheat", container: "sack" } },
    "flour-bin": { label: { de: "Mehl in den Eimer", en: "Flour bin" }, values: { grain: "flour", container: "pail", flow: 0.7 } },
    "spilled-beans": { label: { de: "Verschüttete Bohnen", en: "Spilled beans" }, values: { grain: "beans", container: "floor", seconds: 0.8 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed);
    const g = GRAINS[p.grain as keyof typeof GRAINS] ?? GRAINS.wheat;
    const run = p.seconds, tail = 0.22, total = run + tail;
    const s = buffer(total), n = s.length;
    const swell = smooth(r, total, 0.25);

    // Density of the stream over time: fades in over 0.08 s, thins out over the last quarter (fewer, then single grains)
    const thin = run * 0.25;
    const density = (t: number) => {
      const a = Math.min(1, t / 0.08);
      const b = t < run - thin ? 1 : Math.max(0, (run - t) / thin) ** 2;
      return a * b;
    };
    const level = (t: number) => 1 + 0.3 * (swell(t) - 0.5); // slow random swell, ±15 %

    if (p.grain === "flour") {
      // A hiss with no single grains: noise low-passed around 2.5 kHz, a band-pass for its body
      const lp = new Biquad("lowpass", 2500, 0.8), bp = new Biquad("bandpass", 1400, 0.6);
      const gain = 0.35 + 0.65 * p.flow;
      for (let i = 0; i < n; i++) {
        const t = i / RATE, d = density(t);
        const w = white(r);
        const x = lp.run(w) * 0.7 + bp.run(w) * 0.5;
        s[i] = x * Math.sqrt(d) * level(t) * gain * 0.6;
      }
      // A few last puffs as the stream breaks off
      grains(s, r, { start: run - thin * 0.6, seconds: thin * 0.6 + 0.05, count: 6, hz: 1600, q: 0.8, gain: 0.25, grain: 0.006 });
    } else {
      // The patter in 20 ms slices, each with as many grains as the density allows there
      const rate = g.rate[0] + (g.rate[1] - g.rate[0]) * p.flow, step = 0.02;
      const gain = (0.4 + 0.6 * p.flow) / Math.sqrt(rate * g.grain * 40);
      let rest = 0;
      for (let t = 0; t < run; t += step) {
        const mitte = t + step / 2;
        rest += rate * step * density(mitte);
        const count = Math.floor(rest);
        rest -= count;
        if (count > 0) grains(s, r, { start: t, seconds: step, count, hz: g.hz, q: g.q, gain: gain * level(mitte), grain: g.grain });
      }
      // The last single grains just after the stream
      for (let k = 0; k < 3; k++) {
        grains(s, r, { start: run - 0.04 + r() * 0.1, seconds: 0.002, count: 1, hz: g.hz * (0.85 + r() * 0.3), q: g.q, gain: gain * 0.8, grain: g.grain * 1.5 });
      }
    }

    // Level of the steady stream, so the thump and the bounces sit just above it whatever the grain
    let sq = 0;
    const a0 = Math.round(0.1 * RATE), a1 = Math.round(run * 0.75 * RATE);
    for (let i = a0; i < a1; i++) sq += s[i] * s[i];
    const ref = Math.sqrt(sq / Math.max(1, a1 - a0));

    if (p.container === "sack") {
      // Muffled by the cloth, and a soft thump as the first load lands
      const lp = new Biquad("lowpass", 3000, 0.7);
      for (let i = 0; i < n; i++) s[i] = lp.run(s[i]);
      const at = 0.02, dumpf = new LowPass(), stark = ref * (2.5 + 1.5 * p.flow);
      let phase = 0;
      for (let i = Math.round(at * RATE); i < Math.round((at + 0.1) * RATE) && i < n; i++) {
        const t = i / RATE - at, env = Math.min(1, t / 0.008) * Math.exp(-t / 0.025);
        phase += (2 * Math.PI * (120 - 30 * t / 0.1)) / RATE;
        s[i] += (Math.sin(phase) * 0.8 + dumpf.run(white(r), 300) * 1.5) * env * stark;
      }
    } else if (p.container === "pail") {
      // The wooden pail rings in a band that rises from 700 to 900 Hz as it fills
      const bp = new Biquad("bandpass", 700, 4);
      for (let i = 0; i < n; i++) {
        const fill = Math.min(1, i / RATE / run);
        bp.set(700 + 200 * fill, 4);
        s[i] = s[i] * 0.6 + bp.run(s[i]) * 1.6;
      }
    } else {
      // The floor: bright scatter, and a few grains bouncing off in the last 0.2 s
      const hp = new Biquad("highpass", 500, 0.7);
      for (let i = 0; i < n; i++) s[i] = hp.run(s[i]);
      const rb = rng(seed + 1), bounces = 3 + Math.floor(rb() * 3);
      for (let k = 0; k < bounces; k++) {
        const t = run + 0.01 + (0.14 * (k + rb() * 0.6)) / bounces;
        grains(s, rb, { start: t, seconds: 0.002, count: 1, hz: g.bounce * (0.8 + rb() * 0.4), q: 2, gain: ref * 8 * (1 - k / bounces), grain: 0.0015 });
      }
    }

    return s;
  },
});
