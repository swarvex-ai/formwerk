import { color, float, mix, sin, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";
import type { F } from "../noise";

export const snow = defineSurface({
  id: "snow", category: "ground",
  title: { de: "Schnee", en: "Snow" },
  description: {
    de: "Schnee von frischem Pulver bis zu Harsch: mit Wehen, Glitzern, schmutzigen Stellen und glattem Eis. Eine Kachel ist 2 × 2 m.",
    en: "Snow from fresh powder to crust: with drifts, sparkle, dirty patches and smooth ice. One tile is 2 × 2 m.",
  },
  params: {
    drifts: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Wehen", en: "Drifts" },
      describe: { de: "Vom Wind geformte Wellen: 0 glatt, 0,4 üblich, 1 tiefe Verwehungen.", en: "Waves shaped by the wind: 0 smooth, 0.4 usual, 1 deep drifts." } },
    sparkle: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Glitzern", en: "Sparkle" },
      describe: { de: "Glitzernde Kristalle: 0 matt, 0,5 frischer Schnee in der Sonne, 1 stark.", en: "Glittering crystals: 0 matt, 0.5 fresh snow in sunlight, 1 strong." } },
    dirt: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Schmutz", en: "Dirt" },
      describe: { de: "Graue, schmutzige Stellen: 0 sauber, 0,5 am Straßenrand, 1 Matsch.", en: "Grey, dirty patches: 0 clean, 0.5 by the roadside, 1 slush." } },
    ice: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Eis", en: "Ice" },
      describe: { de: "Glatte, glänzende Eisflächen: 0 keine, 0,5 einige, 1 überfroren.", en: "Smooth, shiny patches of ice: 0 none, 0.5 some, 1 frozen over." } },
    color: { type: "color", default: "#eef3f8", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe des Schnees: Weiß #eef3f8, bläulich im Schatten #d6e2f0.", en: "Colour of the snow: white #eef3f8, bluish in shade #d6e2f0." } },
  },
  presets: {
    powder: { label: { de: "Pulverschnee", en: "Powder" }, values: { drifts: 0.3, sparkle: 0.7 } },
    roadside: { label: { de: "Straßenrand", en: "Roadside" }, values: { drifts: 0.2, sparkle: 0.2, dirt: 0.6, ice: 0.3 } },
    "frozen-lake": { label: { de: "Zugefrorener See", en: "Frozen lake" }, values: { drifts: 0.1, ice: 0.9, color: "#d6e2f0" } },
  },
  tile: 2, depth: 0.04,
  build(p, seed) {
    const weiss = color(p.color), grau = vec3(0.25, 0.24, 0.22), eisFarbe = vec3(0.55, 0.68, 0.8);
    return (q, res) => {
      const fein = fbm(q, [64, 64], res, 0.6, seed + 1).toVar(), lage = fbm(q, [3, 3], 256, 0.55, seed + 2, 5).toVar();
      const wehe = sin(q.y.mul(6 * Math.PI * 2).add(q.x.mul(Math.PI * 4)).add(lage.mul(3))).mul(0.5).add(0.5).mul(p.drifts).toVar();
      const schmutz = p.dirt > 0 ? ramp(fbm(q, [6, 6], 256, 0.55, seed + 3, 4).add(lage.mul(0.3)), 0.7 - p.dirt * 1.1, 1 - p.dirt * 0.8) : float(0);
      const eis = p.ice > 0 ? ramp(lage.mul(-1).add(fein.mul(0.1)), 0.75 - p.ice * 1.2, 0.85 - p.ice * 1.2) : float(0);
      // Sparkle: a few tiny cells that catch the light (bright and glossy)
      let funkeln: F = float(0);
      if (p.sparkle > 0) {
        const v = voronoi(q.mul(120), 120, 1, seed + 4).toVar();
        funkeln = ramp(v.y, 1 - p.sparkle * 0.15, 1.001 - p.sparkle * 0.15).mul(float(1).sub(ramp(v.z, 0.06, 0.14))).toVar();
      }
      let col = weiss.mul(fein.mul(0.04).add(wehe.mul(-0.05)).add(1));
      col = mix(col, grau.mul(fein.mul(0.3).add(1)).add(weiss.mul(0.2)), schmutz.mul(0.8));
      col = mix(col, eisFarbe.mul(fein.mul(0.05).add(1)), eis).add(funkeln.mul(0.25));
      const height = wehe.mul(0.5).add(0.3).add(fein.mul(0.08)).mul(float(1).sub(eis.mul(0.7))).clamp(0, 1);
      const roughness = mix(mix(float(0.92), float(0.15), funkeln), float(0.06), eis).add(schmutz.mul(-0.1));
      return { height, color: col, roughness: roughness.clamp(0.03, 1), metalness: float(0) };
    };
  },
});
