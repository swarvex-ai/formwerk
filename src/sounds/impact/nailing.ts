import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const nailing = defineSound({
  id: "nailing", category: "impact",
  title: { de: "Nageln", en: "Nailing" },
  description: {
    de: "Ein Hammer treibt einen Nagel ins Holz: klingende Schläge, deren Klang höher und kürzer wird, bis der Kopf bündig sitzt und es mit einem dumpfen Schlag abschließt.",
    en: "A hammer drives a nail into wood: ringing blows that rise in pitch and grow shorter, until the head sits flush and it ends in a dull thock.",
  },
  params: {
    blows: { type: "integer", min: 1, max: 8, default: 5, label: { de: "Schläge", en: "Blows" },
      describe: { de: "Schläge in Folge: 1 ein einzelnes Antippen, 4–5 ein gewöhnlicher Nagel, 8 ein langer Bolzen.", en: "Blows in a row: 1 a single tap, 4–5 a common nail, 8 a long spike." } },
    spacing: { type: "number", min: 0.15, max: 0.6, step: 0.01, default: 0.32, unit: "s", label: { de: "Abstand", en: "Spacing" },
      describe: { de: "Zeit zwischen den Schlägen: 0,2 s schnelles Klopfen, 0,32 s gleichmäßiges Hämmern, 0,5 s schwere Schwünge.", en: "Time between blows: 0.2 s quick tapping, 0.32 s steady, 0.5 s heavy swings." } },
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Nagel", en: "Nail" },
      describe: { de: "Der Nagel: 0 ein kleiner Drahtstift mit hohem Klang, 0,4 ein gewöhnlicher Nagel, 1 ein großer Bolzen mit tiefem Klang.", en: "The nail: 0 a small tack, rings high; 0.4 a common nail; 1 a heavy spike, rings low." } },
    ring: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Nachklang", en: "Ring" },
      describe: { de: "Wie lange der Nagel nach jedem Schlag klingt: 0 fast tot, 0,5 mäßig, 1 ein langer heller Klang.", en: "How long the nail rings after each blow: 0 almost dead, 0.5 moderate, 1 a long bright ring." } },
  },
  presets: {
    tack: { label: { de: "Drahtstift", en: "Tack" }, values: { size: 0.1, blows: 3, spacing: 0.22 } },
    framing: { label: { de: "Bauholz", en: "Framing" }, values: { blows: 5, size: 0.5, ring: 0.4 } },
    spike: { label: { de: "Großer Nagel", en: "Spike" }, values: { size: 1, blows: 8, spacing: 0.45, ring: 0.7 } },
  },
  loop: false, maxSeconds: 4,
  build(p, seed) {
    const r = rng(seed), n = p.blows;
    // Gaps varied ±8 %, shrunk together when the row would not fit in 4 s with its 0.5 s tail
    const gaps = Array.from({ length: n - 1 }, () => p.spacing * (1 + (r() - 0.5) * 0.16));
    const summe = gaps.reduce((a, b) => a + b, 0), passt = summe > 3.5 ? 3.5 / summe : 1;
    const start = [0];
    for (const g of gaps) start.push(start[start.length - 1] + g * passt);
    const s = buffer(start[n - 1] + 0.5), f0 = 4200 - 2400 * p.size, fade = 0.005;
    for (let k = 0; k < n; k++) {
      const u = n > 1 ? k / (n - 1) : 0, at = Math.round(start[k] * RATE);
      const laut = k === 0 ? 0.35 : 0.85 + 0.15 * r(), klang = n >= 2 && k === n - 1 ? 0.1 : 1;
      // Each blow sounds until the next one (fading out over its last 5 ms) or the end of the buffer
      const ende = k < n - 1 ? (start[k + 1] - start[k]) : s.length / RATE - start[k], schnitt = k < n - 1;
      // The board: two wooden modes and the click of the strike
      const fh = 180 * (0.97 + r() * 0.06), tauThud = 0.04 + 0.02 * r();
      const a = new Osc("sine", 0.25), b = new Osc("sine", r()), bp = new Biquad("bandpass", 2500, 1.5);
      // The nail: two partials, higher and shorter as the free shank gets shorter
      const f = f0 * (1 + 0.35 * u), tauRing = p.ring * (0.18 - 0.1 * u) + 0.01;
      const c = new Osc("sine", r()), d = new Osc("sine", r()), klick = 0.002 + 0.002 * r();
      for (let i = 0; i < ende * RATE && at + i < s.length; i++) {
        const t = i / RATE, aus = schnitt ? Math.min(1, (ende - t) / fade) : 1;
        let x = a.next(fh) * envelope(t, 0.001, tauThud) + b.next(fh * 2.3) * envelope(t, 0.001, tauThud * 0.6) * 0.5;
        if (t < 0.03) x += bp.run(white(r)) * envelope(t, 0.0003, klick) * 1.2;
        x += (c.next(f) * envelope(t, 0.0005, tauRing) + d.next(f * 2.76) * envelope(t, 0.0005, tauRing * 0.5) * 0.35) * 0.75 * klang;
        s[at + i] += x * laut * aus;
      }
    }
    return s;
  },
});
