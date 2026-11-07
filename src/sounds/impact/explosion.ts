import { Biquad, buffer, envelope, grains, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const explosion = defineSound({
  id: "explosion", category: "impact",
  title: { de: "Explosion", en: "Explosion" },
  description: {
    de: "Knall mit Druckwelle, Grollen und herabfallenden Trümmern; nah und scharf oder fern und dumpf wie hinter einem Hügel.",
    en: "A blast with a pressure wave, rumble and falling debris; close and sharp or far and muffled like behind a hill.",
  },
  params: {
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß: 0,2 ein Böller, 0,5 eine Granate, 1 ein Gebäude oder ein Fass voll Pulver. Größer klingt tiefer und länger.", en: "How big: 0.2 a firecracker, 0.5 a grenade, 1 a building or a powder keg. Bigger sounds deeper and longer." } },
    distance: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Entfernung", en: "Distance" },
      describe: { de: "Wie weit weg: 0 direkt daneben, 0,5 am anderen Ende des Platzes, 1 hinter dem Horizont (nur noch Grollen).", en: "How far away: 0 right next to you, 0.5 across the square, 1 beyond the horizon (only rumble left)." } },
    debris: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Trümmer", en: "Debris" },
      describe: { de: "Was danach herunterprasselt: 0 nichts, 0,5 Steinchen, 1 ein Regen aus Splittern.", en: "What rains down afterwards: 0 nothing, 0.5 pebbles, 1 a shower of splinters." } },
  },
  presets: {
    grenade: { label: { de: "Granate", en: "Grenade" }, values: { size: 0.4, debris: 0.7 } },
    big: { label: { de: "Groß", en: "Big" }, values: { size: 1, debris: 0.5 } },
    "far-away": { label: { de: "In der Ferne", en: "Far away" }, values: { size: 0.8, distance: 0.9, debris: 0.1 } },
  },
  loop: false, maxSeconds: 3.4,
  build(p, seed) {
    const r = rng(seed), laenge = 0.8 + 2.2 * p.size + 0.3 * p.distance, s = buffer(laenge);
    const lp1 = new Biquad("lowpass", 4000), lp2 = new Biquad("lowpass", 4000), boom = new Osc("sine");
    const verzug = Math.round(p.distance * 0.08 * RATE);
    for (let i = verzug; i < s.length; i++) {
      const t = (i - verzug) / RATE;
      const grenze = (200 + 5000 * (1 - p.distance)) * Math.exp(-t / (0.25 + 0.5 * p.size)) + 120 + 200 * (1 - p.distance);
      if (i % 16 === 0) { lp1.set(grenze); lp2.set(grenze); }
      const rauschen = lp2.run(lp1.run(white(r))) * envelope(t, 0.004 + 0.03 * p.distance, laenge * (0.16 + 0.1 * p.size)) * 1.5;
      const tief = boom.next((38 + 50 * (1 - p.size)) * (1 + 1.5 * Math.exp(-t / 0.05))) * envelope(t, 0.006, 0.18 + 0.35 * p.size) * (0.6 + 0.6 * p.size);
      const knall = (1 - p.distance) * white(r) * envelope(t, 0.0003, 0.006) * 0.8;
      s[i] = rauschen + tief + knall;
    }
    if (p.debris > 0) {
      const tr = new Float32Array(s.length);
      grains(tr, r, { start: 0.1 + p.distance * 0.08, seconds: laenge * 0.55, count: Math.round(60 * p.debris * (0.5 + p.size)), hz: 2500, q: 0.9, gain: 0.5 * p.debris, grain: 0.0025, shape: "front" });
      const lp = new LowPass(), grenze = 1200 + 9000 * (1 - p.distance);
      for (let i = 0; i < s.length; i++) s[i] += lp.run(tr[i], grenze);
    }
    return s;
  },
});
