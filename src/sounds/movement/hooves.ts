import { Biquad, buffer, envelope, LOOP_TAIL, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Beats inside one stride (fraction of the stride, relative level) and the strides per second at tempo 1
const GANG = {
  walk: { rate: 0.9, beats: [[0, 1], [0.25, 0.8], [0.5, 0.95], [0.75, 0.8]], double: false, shift: 0.125 },
  trot: { rate: 1.4, beats: [[0, 1], [0.5, 0.95]], double: true, shift: 0.25 },
  gallop: { rate: 2, beats: [[0, 0.8], [0.14, 0.9], [0.3, 1]], double: false, shift: 0.5 },
} as const;

export const hooves = defineSound({
  id: "hooves", category: "movement",
  title: { de: "Hufschlag", en: "Hooves" },
  description: {
    de: "Hufschlag eines Pferdes, Esels oder Rindes als nahtlose Schleife: Schritt, Trab oder Galopp auf Pflaster, Erde oder einer Holzbrücke, für Ritte und Fuhrwerke.",
    en: "Hoofbeats of a horse, donkey or cow as a seamless loop: walk, trot or gallop on cobbles, dirt or a wooden bridge, for riding and carts.",
  },
  params: {
    gait: { type: "choice", options: ["walk", "trot", "gallop"], default: "walk", label: { de: "Gangart", en: "Gait" },
      labels: { walk: { de: "Schritt", en: "Walk" }, trot: { de: "Trab", en: "Trot" }, gallop: { de: "Galopp", en: "Gallop" } },
      describe: { de: "Schritt: vier gleichmäßige Schläge je Schritt; Trab: zwei Doppelschläge; Galopp: drei schnelle Schläge und eine Pause (da-da-dum).", en: "Walk: four even beats per stride; trot: two double beats; gallop: three quick beats and a pause (da-da-dum)." } },
    tempo: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1, label: { de: "Tempo", en: "Tempo" },
      describe: { de: "Schrittfolge im Verhältnis zur Gangart: 1 ist üblich (Schritt 0,9, Trab 1,4, Galopp 2 Tritte je Sekunde), 0,5 halb so schnell, 2 doppelt.", en: "Stride rate relative to the gait's usual one: 1 is usual (walk 0.9, trot 1.4, gallop 2 strides per second), 0.5 half as fast, 2 twice." } },
    ground: { type: "choice", options: ["cobble", "dirt", "wood"], default: "cobble", label: { de: "Untergrund", en: "Ground" },
      labels: { cobble: { de: "Pflaster", en: "Cobble" }, dirt: { de: "Erde", en: "Dirt" }, wood: { de: "Holz", en: "Wood" } },
      describe: { de: "Pflaster klickt hart und hell mit kurzem Klang, Erde dumpft ohne Nachklang, Holz klopft hohl wie eine Brücke.", en: "Cobble clicks hard and bright with a short ring, dirt thuds dull without a ring, wood knocks hollow like a bridge." } },
    weight: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Gewicht", en: "Weight" },
      describe: { de: "Wie schwer das Tier ist: 0,1 ein Esel oder Pony, 0,5 ein Reitpferd, 1 ein schweres Kaltblut; tiefer und länger.", en: "How heavy the animal is: 0.1 a donkey or pony, 0.5 a riding horse, 1 a heavy draught horse; lower and longer." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife, auf ganze Schritte abgerundet: 4 s ist kurz, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop, rounded down to whole strides: 4 s is short, 8 to 12 s repeat less noticeably." } },
    seed: { type: "number", min: 0, max: 99, step: 1, default: 0, label: { de: "Zufall", en: "Variation" },
      describe: { de: "Kleine zufällige Abweichungen in Takt (±10 ms) und Lautstärke je Schlag: andere Zahl, anderer Ritt.", en: "Small random offsets in timing (±10 ms) and level per hit: another number, another ride." } },
  },
  presets: {
    "walk-cobble": { label: { de: "Schritt auf Pflaster", en: "Walk on cobbles" }, values: { gait: "walk", ground: "cobble" } },
    "trot-dirt": { label: { de: "Trab auf Erde", en: "Trot on dirt" }, values: { gait: "trot", ground: "dirt" } },
    gallop: { label: { de: "Galopp", en: "Gallop" }, values: { gait: "gallop", ground: "dirt", weight: 0.6 } },
    bridge: { label: { de: "Brücke", en: "Bridge" }, values: { ground: "wood", gait: "walk", weight: 0.8 } },
    donkey: { label: { de: "Esel", en: "Donkey" }, values: { weight: 0.1, tempo: 1.2 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed * 100 + p.seed + 1), g = GANG[p.gait as keyof typeof GANG];
    const rate = g.rate * p.tempo, strides = Math.max(1, Math.floor(p.seconds * rate)), stride = 1 / rate;
    const period = Math.round(strides * stride * RATE), n = Math.round(LOOP_TAIL * RATE), w = p.weight;
    const loop = buffer(period / RATE);
    // One hit, written cyclically so hits at the loop end run on into its start
    const hit = (at: number, level: number) => {
      const noise = new Biquad(p.ground === "dirt" ? "lowpass" : "bandpass", 1, 0.7), ring = new Biquad("bandpass", 1, 12);
      const click = p.ground === "cobble" ? 3200 - 900 * w : p.ground === "dirt" ? 800 - 350 * w : 380 - 160 * w;
      const q = p.ground === "cobble" ? 1.2 : p.ground === "dirt" ? 0.6 : 3;
      noise.set(click, q); ring.set(2400 + 800 * r() - 600 * w, 12);
      const decay = (p.ground === "cobble" ? 0.006 : p.ground === "dirt" ? 0.02 : 0.05) * (1 + 0.6 * w);
      const thump = 120 - 60 * w, tlen = 0.03 + 0.03 * w, o = new Osc("sine");
      const body = p.ground === "wood" ? new Osc("sine") : null, bf = 380 - 160 * w;
      const len = Math.round(0.3 * RATE);
      for (let i = 0; i < len; i++) {
        const t = i / RATE, x = white(r);
        let v = noise.run(x) * envelope(t, 0.0004, decay) * (p.ground === "dirt" ? 2.5 : p.ground === "wood" ? 3 : 1.2);
        if (p.ground === "cobble") v += ring.run(x) * envelope(t, 0.0004, 0.035) * 1.6;
        if (body) v += body.next(bf) * envelope(t, 0.001, 0.07) * 0.9;
        v += o.next(thump * (1 - 0.3 * Math.min(1, t / tlen))) * envelope(t, 0.002, tlen / 2) * (p.ground === "cobble" ? 0.5 : 0.9);
        loop[(at + i) % period] += v * level;
      }
    };
    for (let k = 0; k < strides; k++) {
      for (const [pos, lvl] of g.beats) {
        const t = (k + pos + g.shift) * stride + (r() * 2 - 1) * 0.01, base = Math.round(t * RATE + period) % period;
        const level = lvl * (0.8 + 0.2 * r());
        if (g.double) { hit(base, level * 0.8); hit((base + Math.round((0.01 + 0.01 * r()) * RATE)) % period, level); }
        else hit(base, level);
      }
    }
    // The loop plus its tail: the fold of the contract crossfades with equal power, so split the start into sin/cos parts
    const s = buffer(period / RATE + LOOP_TAIL);
    s.set(loop);
    for (let i = 0; i < n; i++) {
      const f = (i / n) * Math.PI / 2;
      s[i] = loop[i] * Math.sin(f);
      s[period + i] = loop[i] * Math.cos(f);
    }
    return s;
  },
});
