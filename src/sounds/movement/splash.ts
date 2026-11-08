import { Biquad, buffer, envelope, grains, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const splash = defineSound({
  id: "splash", category: "movement",
  title: { de: "Platschen", en: "Splash" },
  description: {
    de: "Etwas fällt ins Wasser: ein Kiesel, ein Schritt in eine Pfütze, ein Sprung in den See, mit Spritzern und Blasen.",
    en: "Something lands in water: a pebble, a step into a puddle, a jump into a lake, with spray and bubbles.",
  },
  params: {
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Größe", en: "Size" },
      describe: { de: "Was ins Wasser fällt: 0,1 ein Kiesel, 0,4 ein Fuß, 1 ein ganzer Mensch.", en: "What lands in the water: 0.1 a pebble, 0.4 a foot, 1 a whole person." } },
    bubbles: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Blasen", en: "Bubbles" },
      describe: { de: "Gluckernde Luftblasen danach: 0 keine (flache Pfütze), 0,4 üblich, 1 tiefes Wasser.", en: "Gurgling bubbles after it: 0 none (a shallow puddle), 0.4 usual, 1 deep water." } },
    spray: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Spritzer", en: "Spray" },
      describe: { de: "Tropfen, die zurückfallen: 0,2 wenige, 0,5 üblich, 1 eine große Fontäne.", en: "Drops falling back: 0.2 a few, 0.5 usual, 1 a big fountain." } },
  },
  presets: {
    pebble: { label: { de: "Kiesel", en: "Pebble" }, values: { size: 0.1, bubbles: 0.6, spray: 0.2 } },
    puddle: { label: { de: "Pfütze", en: "Puddle" }, values: { size: 0.35, bubbles: 0, spray: 0.6 } },
    dive: { label: { de: "Sprung ins Wasser", en: "Dive" }, values: { size: 1, bubbles: 0.7, spray: 1 } },
  },
  loop: false, maxSeconds: 1.5,
  build(p, seed) {
    const r = rng(seed), lang = 0.25 + p.size * 0.75, s = buffer(lang + 0.25);
    // The impact: a burst of water noise, lower and longer the bigger it is, with a soft thump under it
    const bp = new Biquad("bandpass", 2200 - p.size * 1400, 0.8), lp = new LowPass(), tau = 0.03 + p.size * 0.12;
    for (let i = 0; i < tau * 7 * RATE && i < s.length; i++) {
      const t = i / RATE, n = white(r);
      s[i] += bp.run(n) * envelope(t, 0.002, tau) * 1.4 + lp.run(n, 180) * envelope(t, 0.004, tau * 0.8) * p.size * 6;
    }
    // Spray: drops falling back
    grains(s, r, { start: 0.03, seconds: 0.1 + p.size * 0.5, count: Math.round(10 + p.spray * (30 + p.size * 120)), hz: 3500, q: 1.1, gain: 0.5 + p.spray * 0.4, grain: 0.0012, shape: "front" });
    // Bubbles: short tones that rise as they shrink at the surface
    const n = Math.round(p.bubbles * (3 + p.size * 12));
    for (let k = 0; k < n; k++) {
      const at = Math.round((0.02 + r() * lang * 0.7) * RATE), f0 = 350 + r() * 1100 * (1.2 - p.size * 0.6), dauer = 0.02 + r() * 0.05, o = new Osc("sine");
      for (let i = 0; i < dauer * 5 * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += o.next(f0 * (1 + 0.6 * (t / dauer))) * envelope(t, 0.002, dauer) * 0.35;
      }
    }
    return s;
  },
});
