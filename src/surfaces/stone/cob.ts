import { color, cos, dot, float, floor, fract, max, min, mix, PI, sin, sqrt, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, voronoi, wrap, wrap1 } from "../noise";
import type { F } from "../noise";

export const cob = defineSurface({
  id: "cob", category: "stone",
  title: { de: "Lehmbau", en: "Cob" },
  description: {
    de: "Wand aus Lehm, Sand und gehacktem Stroh, von Hand aufgeworfen und verstrichen: breite weiche Wölbungen, Strohhalme in der Oberfläche und feine Trocknungsrisse, für Brotbacköfen, Hütten und Scheunen. Eine Kachel ist 1 × 1 m.",
    en: "Earthen wall of clay, sand and chopped straw, pressed on by hand and smoothed: broad soft swells, straw stalks in the surface and fine shrinkage cracks, for bread ovens, huts and barns. One tile is 1 × 1 m.",
  },
  params: {
    swell: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Wölbung", en: "Swell" },
      describe: { de: "Breite, weiche Wölbungen der von Hand aufgeworfenen Wand: 0 glatt verstrichen, 0,5 üblicher Lehm, 1 buckelig und rau.", en: "Broad hand-pressed swells in the height: 0 smoothed flat, 0.5 usual, 1 lumpy and rough." } },
    straw: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Strohanteil", en: "Straw" },
      describe: { de: "Anteil der Fläche, auf dem kurze Strohhalme sichtbar sind: 0 keiner, 0,4 üblicher Lehm, 1 dick mit Stroh.", en: "Share of the surface showing straw stalks: 0 none, 0.4 usual cob, 1 thick with straw." } },
    cracks: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Risse", en: "Cracks" },
      describe: { de: "Feine Trocknungsrisse im Lehm: 0 keine, 0,2 üblich, 1 eine alte trockene Wand.", en: "Fine dry shrinkage cracks: 0 none, 0.2 usual, 1 an old dry wall." } },
    colour: { type: "color", default: "#a88664", label: { de: "Lehmfarbe", en: "Clay colour" },
      describe: { de: "Farbe des Lehms: Ocker #a88664, roter Ton #9a6248, grauer Lehm #9a9284.", en: "Colour of the clay: ochre #a88664, red clay #9a6248, grey loam #9a9284." } },
    strawColour: { type: "color", default: "#d8bf78", label: { de: "Strohfarbe", en: "Straw colour" },
      describe: { de: "Farbe der Strohhalme: frisch #d8bf78, alt #a8946a.", en: "Colour of the straw stalks: fresh #d8bf78, old #a8946a." } },
  },
  presets: {
    oven: { label: { de: "Backofen", en: "Oven" }, values: { swell: 0.3, straw: 0.2, cracks: 0.4, colour: "#9a6248" } },
    cottage: { label: { de: "Kate", en: "Cottage" }, values: { swell: 0.5, straw: 0.4, cracks: 0.2 } },
    barn: { label: { de: "Scheune", en: "Barn" }, values: { swell: 0.8, straw: 0.8, colour: "#9a9284", strawColour: "#a8946a" } },
  },
  tile: 1, depth: 0.02,
  build(p, seed) {
    const ton = color(p.colour), stroh = color(p.strawColour);
    // The share gate walks through the cell ids with the share, so 0 leaves the wall free of stalks and 1 fills every cell
    const s = Math.min(1.15, p.straw * 1.15);
    const gate = Math.min(1, p.straw / 0.04), anteil = gate * gate * (3 - 2 * gate);
    const n = 24, halb = float(0.036); // half width 1.5 mm: three texels across a 1024 bake, so the stalks do not alias
    return (q, res) => {
      const fein = fbm(q, [64, 64], res, 0.6, seed + 1).toVar();
      const wolke = fbm(q, [5, 5], 256, 0.55, seed + 2, 4).toVar();
      // Shrinkage cracks: the one voronoi of the height, a thin groove on its edge distance, faded by the share (0 gives none)
      let rille: F = float(0);
      if (p.cracks > 0) {
        const v = voronoi(wrap(q.mul(10), vec2(10, 10)), 10, 0.9, seed + 3).toVar();
        rille = float(1).sub(ramp(v.x, 0, 0.16)).mul(p.cracks).toVar();
      }
      // Straw: a short stalk in a cell of a 24 × 24 grid at a random angle, drawn where the distance to the segment is small
      const f = fract(q.mul(n)).toVar(), g = floor(q.mul(n)).toVar();
      const zelle = vec2(wrap1(g.x, n), wrap1(g.y, n)).toVar();
      let halm: F = float(0);
      if (p.straw > 0) {
        const hat = cell(zelle, seed + 4).toVar();
        const winkel = cell(zelle, seed + 5).mul(PI).toVar();
        const laenge = cell(zelle, seed + 6).mul(0.12).add(0.32).toVar();
        const mittig = vec2(cell(zelle, seed + 7).sub(0.5), cell(zelle, seed + 8).sub(0.5)).mul(0.1).toVar();
        const d = f.sub(0.5).sub(mittig).toVar();
        const richt = vec2(cos(winkel), sin(winkel)).toVar();
        const t = min(max(dot(d, richt), laenge.negate()), laenge).toVar();
        const senk = d.sub(richt.mul(t)).toVar();
        halm = ramp(sqrt(dot(senk, senk)), halb, halb.mul(0.5)).mul(ramp(hat, float(s), float(s).sub(0.05)).mul(anteil)).toVar();
      }
      // Clay: broad swells and fine grain; the groove sits dark and rough, the stalk a little above the wall
      const hohe = float(0.55)
        .add(wolke.mul(p.swell * 0.24))
        .add(fein.mul(0.05))
        .sub(rille.mul(0.3))
        .add(halm.mul(0.04))
        .clamp(0, 1);
      const lehm = ton.mul(wolke.mul(p.swell * 0.05).add(fein.mul(0.07)).add(1)).mul(float(1).sub(rille.mul(0.35)));
      const halmFarbe = stroh.mul(halm.mul(0.12).add(0.88));
      const col = mix(lehm, halmFarbe, halm);
      const roughness = mix(float(0.89).add(fein.mul(0.04)).add(rille.mul(0.04)), float(0.95), halm).clamp(0.05, 0.97);
      return { height: hohe, color: col, roughness, metalness: float(0) };
    };
  },
});
