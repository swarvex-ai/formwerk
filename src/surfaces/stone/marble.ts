import { abs, color, float, fract, min, mix, sin } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp } from "../noise";
import type { F } from "../noise";

export const marble = defineSurface({
  id: "marble", category: "stone",
  title: { de: "Marmor", en: "Marble" },
  description: {
    de: "Polierter Marmor mit Adern: weißer Carrara, grüner oder schwarzer Marmor, als durchgehende Platte oder in Fliesen. Eine Kachel ist 1 × 1 m.",
    en: "Polished marble with veins: white Carrara, green or black marble, as a continuous slab or in tiles. One tile is 1 × 1 m.",
  },
  params: {
    veins: { type: "integer", min: 1, max: 8, default: 3, label: { de: "Adern", en: "Veins" },
      describe: { de: "Wie viele Hauptadern über die Kachel laufen: 1 ruhig, 3 üblich, 8 unruhig.", en: "How many main veins run across the tile: 1 calm, 3 usual, 8 busy." } },
    turbulence: { type: "number", min: 0, max: 1, step: 0.05, default: 0.55, label: { de: "Verwirbelung", en: "Turbulence" },
      describe: { de: "Wie gewunden die Adern sind: 0 fast gerade Streifen, 0,55 üblich, 1 wild verwirbelt.", en: "How winding the veins are: 0 nearly straight stripes, 0.55 usual, 1 wildly swirled." } },
    tiles: { type: "integer", min: 0, max: 6, default: 0, label: { de: "Fliesen", en: "Tiles" },
      describe: { de: "Fliesen je Meter mit feinen Fugen: 0 eine durchgehende Platte, 2 große Fliesen (50 cm), 4 kleinere.", en: "Tiles per metre with fine joints: 0 a continuous slab, 2 large tiles (50 cm), 4 smaller ones." } },
    polish: { type: "number", min: 0, max: 1, step: 0.05, default: 0.8, label: { de: "Politur", en: "Polish" },
      describe: { de: "Wie glänzend: 0 geschliffen und matt, 0,8 poliert, 1 spiegelnd.", en: "How glossy: 0 honed and matt, 0.8 polished, 1 mirror-like." } },
    color: { type: "color", default: "#ebe8e2", label: { de: "Grundfarbe", en: "Base colour" },
      describe: { de: "Weiß #ebe8e2 (Carrara), Grün #2f5a48, Schwarz #1e1e22, Rosa #d8b4a8.", en: "White #ebe8e2 (Carrara), green #2f5a48, black #1e1e22, pink #d8b4a8." } },
    veinColor: { type: "color", default: "#7c7a78", label: { de: "Aderfarbe", en: "Vein colour" },
      describe: { de: "Farbe der Adern: Grau für Carrara, Weiß für schwarzen Marmor, Gold für Calacatta.", en: "Colour of the veins: grey for Carrara, white for black marble, gold for Calacatta." } },
  },
  presets: {
    carrara: { label: { de: "Carrara", en: "Carrara" }, values: { color: "#ebe8e2", veinColor: "#7c7a78" } },
    "black-marble": { label: { de: "Schwarzer Marmor", en: "Black marble" }, values: { color: "#1e1e22", veinColor: "#d8d6d0", veins: 4, turbulence: 0.7 } },
    "green-tiles": { label: { de: "Grüne Fliesen", en: "Green tiles" }, values: { color: "#2f5a48", veinColor: "#cfe0d4", tiles: 2 } },
  },
  tile: 1, depth: 0.003,
  build(p, seed) {
    const grund = color(p.color), ader = color(p.veinColor);
    return (q, res) => {
      const wirbel = fbm(q, [3, 3], 512, 0.6, seed + 1, 7).toVar(), fein = fbm(q, [24, 24], res, 0.55, seed + 2).toVar();
      // Veins: thin lines where a warped sine crosses zero, with fainter side veins
      const lauf = q.x.mul(p.veins).add(q.y.mul(p.veins)).add(wirbel.mul(0.6 + 2.4 * p.turbulence));
      const haupt = float(1).sub(ramp(abs(sin(lauf.mul(Math.PI))), 0, 0.12)).toVar();
      const neben = float(1).sub(ramp(abs(sin(lauf.mul(Math.PI * 3).add(fein.mul(4)))), 0, 0.05)).mul(0.35);
      const maske = haupt.max(neben).mul(ramp(fbm(q, [6, 6], 256, 0.5, seed + 3, 4), -0.5, 0.2)).toVar();
      let fuge: F = float(1);
      if (p.tiles > 0) {
        const f = fract(q.mul(p.tiles)), d = min(min(f.x, float(1).sub(f.x)), min(f.y, float(1).sub(f.y))).div(p.tiles);
        fuge = ramp(d, 0.0008, 0.0016);
      }
      const col = mix(grund.mul(fein.mul(0.05).add(wirbel.mul(0.04)).add(1)), ader, maske.mul(0.85)).mul(mix(float(0.6), float(1), fuge));
      // Polished, the stone is nearly flat: the veins are etched a little deeper, the joints lie lower
      const height = float(0.7).add(fein.mul(0.06)).sub(maske.mul(0.12)).mul(fuge.mul(0.8).add(0.2));
      const roughness = mix(float(0.6), float(0.02 + 0.08 * (1 - p.polish) + (p.polish < 0.5 ? (0.5 - p.polish) * 0.9 : 0)), fuge).add(maske.mul(0.05));
      return { height: height.clamp(0, 1), color: col, roughness: roughness.clamp(0.02, 1), metalness: float(0) };
    };
  },
});
