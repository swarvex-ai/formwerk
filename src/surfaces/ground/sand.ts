import { abs, color, float, mix, sin, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";
import type { F } from "../noise";

export const sand = defineSurface({
  id: "sand", category: "ground",
  title: { de: "Sand", en: "Sand" },
  description: {
    de: "Sand mit Windrippeln: Strand, Wüste oder nasser Sand am Wasser, auf Wunsch mit Kieseln. Eine Kachel ist 2 × 2 m.",
    en: "Sand with wind ripples: a beach, a desert or wet sand by the water, with pebbles if you like. One tile is 2 × 2 m.",
  },
  params: {
    ripples: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Rippel", en: "Ripples" },
      describe: { de: "Wie deutlich die Windrippel sind: 0 glatt, 0,5 ein Strand, 1 eine Wüstendüne.", en: "How strong the wind ripples are: 0 smooth, 0.5 a beach, 1 a desert dune." } },
    scale: { type: "integer", min: 6, max: 30, default: 16, label: { de: "Rippelzahl", en: "Ripple count" },
      describe: { de: "Rippel auf zwei Metern: 8 breite Wellen, 16 üblich, 30 fein.", en: "Ripples across two metres: 8 wide waves, 16 usual, 30 fine." } },
    wetness: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Nässe", en: "Wetness" },
      describe: { de: "Wie nass: 0 trocken, 0,5 feucht, 1 nass am Wasser (dunkler und glänzend).", en: "How wet: 0 dry, 0.5 damp, 1 wet by the water (darker and shiny)." } },
    pebbles: { type: "number", min: 0, max: 1, step: 0.05, default: 0.1, label: { de: "Kiesel", en: "Pebbles" },
      describe: { de: "Kleine Steine im Sand: 0 keine, 0,1 vereinzelt, 1 ein Kiesstrand.", en: "Small stones in the sand: 0 none, 0.1 a few, 1 a pebble beach." } },
    color: { type: "color", default: "#d8c39a", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Strand #d8c39a, Wüste #d4a56a, dunkler Vulkansand #4a4642.", en: "Beach #d8c39a, desert #d4a56a, dark volcanic sand #4a4642." } },
  },
  presets: {
    beach: { label: { de: "Strand", en: "Beach" }, values: { ripples: 0.4, pebbles: 0.1 } },
    desert: { label: { de: "Wüste", en: "Desert" }, values: { ripples: 1, scale: 12, pebbles: 0, color: "#d4a56a" } },
    "wet-sand": { label: { de: "Nasser Sand", en: "Wet sand" }, values: { ripples: 0.2, wetness: 0.9, pebbles: 0.2 } },
  },
  tile: 2, depth: 0.03,
  build(p, seed) {
    const farbe = color(p.color), kiesel = vec3(0.35, 0.33, 0.3);
    return (q, res) => {
      const korn = fbm(q, [128, 128], res, 0.7, seed + 1).toVar(), lage = fbm(q, [4, 4], 256, 0.5, seed + 2, 4).toVar();
      // Ripples: a sine across the tile, bent by noise so the crests wander; asymmetric like real ripples
      const lauf = q.y.mul(p.scale).add(q.x.mul(2)).add(lage.mul(1.6)), s = sin(lauf.mul(Math.PI * 2)).toVar();
      const rippel = s.mul(0.5).add(0.5).pow(1.6).mul(p.ripples).toVar();
      let stein: F = float(0);
      if (p.pebbles > 0) {
        const v = voronoi(q.mul(36), 36, 1, seed + 3).toVar();
        stein = ramp(v.y, 1 - p.pebbles * 0.5, 1.01 - p.pebbles * 0.5).mul(float(1).sub(ramp(v.z, 0.25, 0.4))).toVar();
      }
      const nass = float(p.wetness);
      const sandFarbe = farbe.mul(korn.mul(0.12).add(lage.mul(0.05)).add(rippel.mul(0.06)).add(1)).mul(float(1).sub(nass.mul(0.4)));
      const col = mix(sandFarbe, kiesel.mul(abs(korn).mul(0.6).add(0.8)).mul(lage.mul(0.4).add(1)), stein);
      const height = rippel.mul(0.5).add(0.3).add(korn.mul(0.05)).add(stein.mul(0.25)).clamp(0, 1);
      const roughness = mix(float(0.95), float(0.35), nass).add(korn.mul(0.03));
      return { height, color: col, roughness: roughness.clamp(0.1, 1), metalness: float(0) };
    };
  },
});
