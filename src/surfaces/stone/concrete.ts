import { color, float, fract, max, min, mix } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp } from "../noise";
import type { F } from "../noise";

export const concrete = defineSurface({
  id: "concrete", category: "stone",
  title: { de: "Beton", en: "Concrete" },
  description: {
    de: "Beton mit Poren, Flecken und auf Wunsch Fugen zwischen Platten: vom glatten Sichtbeton bis zum fleckigen Parkhausboden. Eine Kachel ist 2 × 2 m.",
    en: "Concrete with pores, stains and, if you like, joints between slabs: from smooth exposed concrete to a stained car park floor. One tile is 2 × 2 m.",
  },
  params: {
    slabs: { type: "integer", min: 0, max: 4, default: 2, label: { de: "Platten", en: "Slabs" },
      describe: { de: "Platten je Kachel und Richtung, getrennt durch Fugen: 0 fugenlos, 2 übliche Bodenplatten (1 m), 4 kleine Gehwegplatten.", en: "Slabs per tile in each direction, with joints between them: 0 seamless, 2 usual floor slabs (1 m), 4 small paving slabs." } },
    pores: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Poren", en: "Pores" },
      describe: { de: "Kleine Luftlöcher: 0 glatt geschliffen, 0,4 üblich, 1 grob wie Sichtbeton.", en: "Small air holes: 0 ground smooth, 0.4 usual, 1 rough like exposed concrete." } },
    stains: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Flecken", en: "Stains" },
      describe: { de: "Dunkle Flecken von Wasser, Öl und Alter: 0 neu, 0,3 benutzt, 1 ein alter Parkplatz.", en: "Dark stains from water, oil and age: 0 new, 0.3 used, 1 an old car park." } },
    color: { type: "color", default: "#9a9893", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Grau #9a9893, warm #a59c8c, dunkel #6d6c69.", en: "Grey #9a9893, warm #a59c8c, dark #6d6c69." } },
  },
  presets: {
    "exposed-concrete": { label: { de: "Sichtbeton", en: "Exposed concrete" }, values: { slabs: 0, pores: 0.9, stains: 0.15 } },
    "car-park": { label: { de: "Parkhaus", en: "Car park" }, values: { slabs: 1, stains: 0.9, color: "#8a8883" } },
    pavement: { label: { de: "Gehwegplatten", en: "Pavement" }, values: { slabs: 4, pores: 0.3, stains: 0.2, color: "#a59c8c" } },
  },
  tile: 2, depth: 0.006,
  build(p, seed) {
    const beton = color(p.color);
    return (q, res) => {
      const fein = fbm(q, [32, 32], res, 0.6, seed + 1).toVar(), grob = fbm(q, [4, 4], 256, 0.55, seed + 2, 5).toVar();
      // Pores: small holes where a fine noise dips deepest
      const loch = p.pores > 0 ? ramp(fbm(q, [160, 160], res, 0.5, seed + 3, 3), -0.65 + p.pores * 0.3, -0.58 + p.pores * 0.3) : float(1);
      let fuge: F = float(1);
      if (p.slabs > 0) {
        const f = fract(q.mul(p.slabs)), d = min(min(f.x, float(1).sub(f.x)), min(f.y, float(1).sub(f.y))).div(p.slabs).mul(2);
        fuge = ramp(d, 0.004, 0.007);
      }
      const fleck = p.stains > 0 ? ramp(grob.add(fbm(q, [12, 12], 256, 0.5, seed + 4, 4).mul(0.3)), 0.75 - p.stains * 0.9, 1.05 - p.stains * 0.7).mul(p.stains) : float(0);
      const height = float(0.6).add(fein.mul(0.08)).mul(loch.mul(0.6).add(0.4)).mul(fuge.mul(0.7).add(0.3)).clamp(0, 1);
      const col = beton.mul(fein.mul(0.08).add(grob.mul(0.06)).add(1)).mul(mix(float(0.55), float(1), loch)).mul(mix(float(0.55), float(1), fuge)).mul(float(1).sub(fleck.mul(0.45)));
      const roughness = max(float(0.55), float(0.85).add(fein.mul(0.05)).sub(fleck.mul(0.25)));
      return { height, color: col, roughness: min(roughness, float(0.97)), metalness: float(0) };
    };
  },
});
