import { color, float, fract, mix, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";

export const slate = defineSurface({
  id: "slate", category: "stone",
  title: { de: "Schiefer", en: "Slate" },
  description: {
    de: "Abgespaltene Felswand aus Schiefer oder Tonschiefer: dunkelgraue Schichten, die in Absätzen und schräg verlaufen, durch feine Risse in Blöcke geteilt, mit rostigen Eisenflecken. Für Stollen, Steinbrüche, Klippen und Höhlenwände. Eine Kachel ist 2 × 2 m.",
    en: "A split rock face of slate or shale: dark grey strata that step in ledges and run at a slant, split into blocks by fine cracks, with rusty iron stains. For mine tunnels, quarries, cliffs and cave walls. One tile is 2 × 2 m.",
  },
  params: {
    layers: { type: "integer", min: 4, max: 16, default: 8, label: { de: "Schichten", en: "Layers" },
      describe: { de: "Gesteinschichten über die Kachel: 4 dicke Bänke, 8 üblich, 16 dünner Tonschiefer.", en: "Strata across the tile: 4 thick beds, 8 usual, 16 thin shale." } },
    tilt: { type: "integer", min: -2, max: 2, default: 1, label: { de: "Neigung", en: "Tilt" },
      describe: { de: "Wie viele Schichthöhen die Schichten über eine Kachel ansteigen: 0 waagerecht, 1 üblich, negativ fallend; ganze Zahlen halten die Kachel nahtlos.", en: "How many layer heights the strata climb across one tile: 0 level, 1 usual, negative falls; whole numbers keep the tile seamless." } },
    relief: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Relief", en: "Relief" },
      describe: { de: "Wie stark die Absätze hervortreten: 0 glatte Schichtung, 0,6 üblich, 1 scharfe Felsstufen.", en: "How strongly the ledges step out: 0 smooth strata, 0.6 usual, 1 sharp rock steps." } },
    cracks: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Risse", en: "Cracks" },
      describe: { de: "Feine Risse zwischen den Blöcken: 0 keine, 0,4 üblich, 1 stark zerklüftet.", en: "Fine cracks between the blocks: 0 none, 0.4 usual, 1 heavily fractured." } },
    blocks: { type: "integer", min: 2, max: 8, default: 4, label: { de: "Blöcke", en: "Blocks" },
      describe: { de: "Risszellen über die Kachel: 2 große Blöcke, 4 üblich, 8 kleine.", en: "Crack cells across the tile: 2 large blocks, 4 usual, 8 small ones." } },
    stains: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Rostflecken", en: "Stains" },
      describe: { de: "Rostige braune Eisenflecken: 0 reine Felswand, 0,3 üblich, 1 stark verfärbt.", en: "Rusty brown iron stains: 0 clean rock, 0.3 usual, 1 heavily discoloured." } },
    color: { type: "color", default: "#4a4f55", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe des Gesteins: Schiefer #4a4f55, Tonschiefer #5e5a52, Kohle #26262a.", en: "Colour of the rock: slate #4a4f55, shale #5e5a52, coal #26262a." } },
  },
  presets: {
    slate: { label: { de: "Schiefer", en: "Slate" }, values: { layers: 8 } },
    shale: { label: { de: "Tonschiefer", en: "Shale" }, values: { color: "#5e5a52", layers: 14, relief: 0.4 } },
    "coal-seam": { label: { de: "Kohleflöz", en: "Coal seam" }, values: { color: "#26262a", layers: 6, stains: 0, cracks: 0.6 } },
    "flat-strata": { label: { de: "Waagerechte Schichten", en: "Flat strata" }, values: { tilt: 0, layers: 5, relief: 1 } },
  },
  tile: 2, depth: 0.08,
  build(p, seed) {
    return (q, res) => {
      const fein = fbm(q, [32, 32], res, 0.55, seed + 1).toVar();
      const lage = fbm(q, [3, 3], 256, 0.55, seed + 2, 5).toVar();
      // Strata: a slanted sawtooth of layer beds (layers and tilt are whole numbers, so the tile repeats)
      const s = q.y.mul(p.layers).add(q.x.mul(p.tilt)).add(lage.mul(0.6)).toVar();
      const f = fract(s).toVar();
      const stufe = ramp(f, 0, 0.85).mul(float(1).sub(ramp(f, 0.85, 1))).toVar();
      // Fine cracks between blocks: the one voronoi of the height (ramp 0 to 0.15 wide, pow(3) keeps the line thin)
      const v = voronoi(q.mul(p.blocks), p.blocks, 0.8, seed + 3).toVar();
      const riss = float(1).sub(ramp(v.x, 0, 0.15)).pow(3).mul(p.cracks).toVar();
      const rost = p.stains > 0 ? ramp(fbm(q, [4, 4], 256, 0.55, seed + 4, 5).add(fein.mul(0.2)), 0.75 - p.stains * 0.9, 0.95 - p.stains * 0.9) : float(0);
      let col = color(p.color).mul(stufe.mul(0.25).add(fein.mul(0.12)).add(0.85));
      col = mix(col, vec3(0.42, 0.26, 0.14), rost.mul(0.75));
      col = col.mul(float(1).sub(riss.mul(0.6)));
      const height = float(0.5).add(stufe.sub(0.5).mul(p.relief * 0.8)).add(fein.mul(0.06)).sub(riss.mul(0.35)).clamp(0, 1);
      const roughness = float(0.82).sub(stufe.mul(0.15)).add(rost.mul(0.1)).clamp(0.03, 1);
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
